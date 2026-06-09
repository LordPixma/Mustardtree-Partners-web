/**
 * Pages Function — proxy all /api/* requests to the MustardTree Worker API.
 *
 * Why this exists:
 * Cloudflare Pages `_redirects` cannot proxy to an external origin (the
 * Worker's *.workers.dev host). A relative `/api/*` request therefore fell
 * through to the SPA catch-all (`/* /index.html 200`) and returned the HTML
 * shell instead of JSON — which broke the blog, portal, and every other
 * Worker-backed call. This catch-all forwards the request to the Worker
 * server-side (same-origin to the browser, so no CORS), preserving the method,
 * headers (including the CF_Authorization cookie for portal/admin), and body.
 *
 * More specific Functions in this directory take precedence: POST /api/contact
 * is handled by `contact.ts` and never reaches this proxy.
 */

interface ProxyContext {
  request: Request;
}

const WORKER_ORIGIN = 'https://mustardtree-api.samuel-1e5.workers.dev';

export async function onRequest(context: ProxyContext): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const target = `${WORKER_ORIGIN}${url.pathname}${url.search}`;

  // `new Request(target, request)` clones method, headers, and body onto the
  // Worker origin. fetch() then runs server-side from the Pages edge.
  return fetch(new Request(target, request));
}
