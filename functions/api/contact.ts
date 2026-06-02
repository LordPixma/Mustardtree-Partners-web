/**
 * Cloudflare Pages Function — Contact form handler
 *
 * Handles `POST /api/contact` on the SAME origin as the site.
 *
 * Why a Pages Function (and not the `_redirects` proxy to the Worker)?
 * Cloudflare Pages `_redirects` proxying only supports relative URLs on the
 * same site — it cannot proxy to an external domain such as the Worker's
 * `*.workers.dev` host. A relative `POST /api/contact` therefore fell through
 * to the SPA catch-all (`/* /index.html 200`), and POSTing to a static asset
 * returns `405 Method Not Allowed`. Handling the route here fixes that:
 * Functions take precedence over `_redirects`, so this runs on-origin with no
 * proxy and no CORS.
 *
 * Required Pages environment variable:
 *   RESEND_API_KEY   — Resend API key (set as an encrypted secret)
 * Optional:
 *   CONTACT_TO_EMAIL — recipient (default: info@mustardtreegroup.com)
 *   EMAIL_FROM       — verified sender (default: noreply@mustardtreegroup.com)
 */

interface ContactEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  CONTACT_TO_EMAIL?: string;
}

interface RequestContext {
  request: Request;
  env: ContactEnv;
}

const DEFAULT_TO = 'info@mustardtreegroup.com';
const DEFAULT_FROM = 'MustardTree Partners <noreply@mustardtreegroup.com>';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface ContactInput {
  name: string;
  email: string;
  message: string;
}

function pickString(body: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function validate(body: Record<string, unknown>): { data?: ContactInput; error?: string } {
  // Accept a few common field-name variants so the endpoint works regardless
  // of how the front-end form labels its fields.
  const name = pickString(body, ['name', 'fullName', 'full_name']);
  const email = pickString(body, ['email', 'emailAddress', 'email_address']);
  const message = pickString(body, ['message', 'help', 'enquiry', 'inquiry', 'details', 'comments']);

  if (!name || !email || !message) {
    return { error: 'Please provide your name, email and a message.' };
  }
  if (name.length > 100) {
    return { error: 'Name is too long.' };
  }
  // Basic shape check — full validation happens when the email is delivered.
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }
  if (message.length > 5000) {
    return { error: 'Message is too long (5000 characters max).' };
  }

  return { data: { name, email, message } };
}

function buildEmail(input: ContactInput): { subject: string; html: string; text: string } {
  const subject = `New website enquiry from ${input.name}`;
  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
  `;
  const text =
    `New contact form submission\n\n` +
    `Name: ${input.name}\n` +
    `Email: ${input.email}\n\n` +
    `Message:\n${input.message}\n`;
  return { subject, html, text };
}

async function sendEmail(env: ContactEnv, input: ContactInput): Promise<{ ok: boolean; error?: string }> {
  const to = env.CONTACT_TO_EMAIL || DEFAULT_TO;
  const from = env.EMAIL_FROM || DEFAULT_FROM;
  const { subject, html, text } = buildEmail(input);

  if (!env.RESEND_API_KEY) {
    return { ok: false, error: 'Email delivery is not configured (RESEND_API_KEY missing).' };
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject,
      html,
      text,
    }),
  });

  if (resp.ok) return { ok: true };
  const detail = await resp.text();
  return { ok: false, error: detail.slice(0, 500) };
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await context.request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const body = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  const { data, error } = validate(body);
  if (!data) {
    return json({ error: error || 'Invalid submission.' }, 400);
  }

  try {
    const result = await sendEmail(context.env, data);
    if (!result.ok) {
      console.error('Contact form email failed:', result.error);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
    return json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err instanceof Error ? err.message : err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
