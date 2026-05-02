/**
 * Post-build prerender: saves fully rendered HTML for policy/content routes into dist/.
 * Requires: npm run build (vite output in dist/) then Chromium via playwright.
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);
const dist = path.join(root, 'dist');
const PORT = 4789;
const BASE = `http://127.0.0.1:${PORT}`;

const STATIC_ROUTES = [
  '/',
  '/about',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/editorial',
  '/faq',
  '/how-to-play',
];

function extractSlugs(articlesPath) {
  const src = fsSync.readFileSync(articlesPath, 'utf8');
  const slugs = [];
  const re = /slug:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) slugs.push(m[1]);
  return [...new Set(slugs)];
}

async function waitForServer(url, maxMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Server not ready within ${maxMs}ms: ${url}`);
}

function routeToDiskPath(route) {
  if (route === '/') return path.join(dist, 'index.html');
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  return path.join(dist, clean, 'index.html');
}

async function writeHtml(route, html) {
  const filePath = routeToDiskPath(route);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const articlesPath = path.join(root, 'src', 'data', 'articles.ts');
  const slugs = extractSlugs(articlesPath);
  const articleRoutes = slugs.map((s) => `/blog/${s}`);
  const routes = [...STATIC_ROUTES, ...articleRoutes];

  const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    shell: true,
    stdio: 'ignore',
  });

  try {
    await waitForServer(`${BASE}/`);

    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
      await context.addInitScript(() => {
        localStorage.setItem('cookieConsent', 'false');
      });

      for (const route of routes) {
        const page = await context.newPage();
        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 120000 });
          await page.waitForSelector('#root', { timeout: 45000 });
          await delay(600);
          const html = await page.content();
          await writeHtml(route, html);
          console.log(`Prerendered ${route}`);
        } finally {
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }
  } finally {
    preview.kill('SIGTERM');
    await delay(400);
    if (!preview.killed) {
      try {
        preview.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
