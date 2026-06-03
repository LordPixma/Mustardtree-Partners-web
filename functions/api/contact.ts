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
 * On submit it sends two emails via Resend: a notification to the team
 * (CONTACT_TO_EMAIL) and a best-effort autoreply acknowledgement to the person
 * who submitted the form.
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

// Best-effort per-IP rate limiting. State is per-isolate (not globally
// consistent), so it throttles bursts rather than enforcing a hard global cap —
// pair it with a Cloudflare WAF rate-limiting rule for stronger protection.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 600_000; // 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

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

function buildTeamEmail(input: ContactInput): { subject: string; html: string; text: string } {
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

function buildAutoReply(input: ContactInput, contactEmail: string): { subject: string; html: string; text: string } {
  const subject = 'We have received your message — MustardTree Partners';
  const html = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>Thank you for getting in touch with MustardTree Partners. We have received
    your message and a member of our team will get back to you within one
    business day.</p>
    <p><strong>Your message:</strong></p>
    <blockquote style="border-left:3px solid #d4a017;margin:0;padding-left:12px;color:#555;white-space:pre-wrap">${escapeHtml(input.message)}</blockquote>
    <p>If your enquiry is urgent, you can reach us directly at
    <a href="mailto:${contactEmail}">${escapeHtml(contactEmail)}</a>.</p>
    <p>Kind regards,<br/>MustardTree Partners</p>
  `;
  const text =
    `Hi ${input.name},\n\n` +
    `Thank you for getting in touch with MustardTree Partners. We have received your ` +
    `message and a member of our team will get back to you within one business day.\n\n` +
    `Your message:\n${input.message}\n\n` +
    `If your enquiry is urgent, you can reach us directly at ${contactEmail}.\n\n` +
    `Kind regards,\nMustardTree Partners\n`;
  return { subject, html, text };
}

interface OutboundEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

async function sendViaResend(env: ContactEnv, message: OutboundEmail): Promise<{ ok: boolean; error?: string }> {
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
      from: env.EMAIL_FROM || DEFAULT_FROM,
      to: [message.to],
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (resp.ok) return { ok: true };
  const detail = await resp.text();
  return { ok: false, error: detail.slice(0, 500) };
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!checkRateLimit(ip)) {
    return json({ error: 'Too many requests. Please try again in a few minutes.' }, 429);
  }

  let parsed: unknown;
  try {
    parsed = await context.request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const body = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;

  // Honeypot: a hidden field real users never fill. If it is populated, treat
  // the submission as spam and silently succeed — don't tip off the bot, and
  // don't send any email.
  if (pickString(body, ['company_website', '_gotcha'])) {
    return json({ success: true });
  }

  const { data, error } = validate(body);
  if (!data) {
    return json({ error: error || 'Invalid submission.' }, 400);
  }

  const to = context.env.CONTACT_TO_EMAIL || DEFAULT_TO;

  try {
    // 1) Notify the team (required — failure means the enquiry is lost).
    const team = buildTeamEmail(data);
    const notify = await sendViaResend(context.env, {
      to,
      replyTo: data.email,
      subject: team.subject,
      html: team.html,
      text: team.text,
    });
    if (!notify.ok) {
      console.error('Contact form email failed:', notify.error);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }

    // 2) Acknowledge the submitter (best-effort — never fail the request on this).
    const reply = buildAutoReply(data, to);
    const auto = await sendViaResend(context.env, {
      to: data.email,
      replyTo: to,
      subject: reply.subject,
      html: reply.html,
      text: reply.text,
    });
    if (!auto.ok) {
      console.error('Contact autoreply failed:', auto.error);
    }

    return json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err instanceof Error ? err.message : err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
