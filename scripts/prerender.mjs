/**
 * Build-time prerendering for the Vite/React SPA (Phase 4, Option A).
 *
 * After `vite build`, this serves the `dist` output with Vite's preview
 * server, drives a headless Chromium over each public route, and writes the
 * fully-rendered HTML back into `dist`. Crawlers and link-preview bots then
 * receive real page content (headings, services, sectors, principal bio,
 * per-route <head> meta from react-helmet-async) instead of an empty shell.
 *
 * Failure is non-fatal: if Chromium cannot launch, the build still produces
 * a working client-rendered SPA — the prerender step is simply skipped.
 *
 * Note: dynamic blog post routes (/blog/:slug) are not prerendered here —
 * they depend on the live API. Prerendering those is a follow-up (see docs).
 */
import { preview } from 'vite';
import puppeteer from 'puppeteer';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Public, crawlable routes. /portal and /admin are intentionally excluded.
const ROUTES = ['/', '/blog', '/privacy', '/terms', '/services/gis'];

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const PORT = 4178;

async function prerender() {
  const server = await preview({ preview: { port: PORT, strictPort: false } });
  const base = (server.resolvedUrls?.local?.[0] || `http://localhost:${PORT}`).replace(/\/$/, '');
  console.log(`[prerender] preview server: ${base}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 45000 });
      await page.waitForSelector('#root > *', { timeout: 15000 });

      // Scroll the full page so scroll-triggered (useInView) animations run
      // and content is captured at its final opacity rather than opacity:0.
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let scrolled = 0;
          const step = 600;
          const timer = setInterval(() => {
            window.scrollBy(0, step);
            scrolled += step;
            if (scrolled >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 60);
        });
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 700)); // let animations settle

      const html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));
      const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, html, 'utf8');
      console.log(`[prerender] ${route} -> ${outPath.replace(DIST, 'dist')}`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

prerender()
  .then(() => {
    console.log('[prerender] done.');
    process.exit(0);
  })
  .catch((err) => {
    console.warn('[prerender] SKIPPED — prerendering failed; the SPA shell will be served as-is.');
    console.warn(`[prerender] ${err && err.message ? err.message : err}`);
    process.exit(0); // non-fatal — build output is still a working SPA
  });
