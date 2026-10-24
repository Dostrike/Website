import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]));
let checks = 0;
for (const url of urls) {
  const file = path.join(dist, url.pathname.replace(/^\//, ''), 'index.html');
  const html = await fs.readFile(file, 'utf8');
  assert(html.includes('<h1'), `No heading on ${url.pathname}`);
  assert.equal((html.match(/name="description"/g) || []).length, 1, `Duplicate descriptions on ${url.pathname}`);
  assert(!html.includes('http://127.0.0.1:'), `Local address leaked on ${url.pathname}`);
  assert(html.includes('name="google-adsense-account"'), `Missing ownership tag on ${url.pathname}`);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.equal(canonical?.[1], `https://dostrike.com${url.pathname}`, `Wrong canonical on ${url.pathname}`);
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)[^\"]*"/g)) {
    if (href.startsWith('//')) continue;
    const target = path.join(dist, decodeURIComponent(href).replace(/^\//, ''));
    const exists = await fs.stat(target).catch(() => null);
    assert(exists, `Broken internal link ${href} on ${url.pathname}`);
  }
  checks++;
}
assert((await fs.readFile(path.join(dist, '404.html'), 'utf8')).includes('content="noindex"'));
assert((await fs.readFile(path.join(dist, 'ads.txt'), 'utf8')).includes('pub-4621807979883911'));
assert((await fs.readFile(path.join(dist, 'robots.txt'), 'utf8')).includes('https://dostrike.com/sitemap.xml'));
console.log(`Verified ${checks} sitemap pages: canonical URLs, ownership tags, headings and internal links; 404, ads.txt and robots.txt passed.`);
