import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = 'https://dostrike.com';
const get = (url, options = {}) => fetch(url, { signal: AbortSignal.timeout(30000), ...options });
const sitemapResponse = await get(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert(urls.includes(`${base}/practice`), 'Latest release sitemap is not live');
for (let offset = 0; offset < urls.length; offset += 4) {
  await Promise.all(urls.slice(offset, offset + 4).map(async url => {
    const response = await get(url);
    assert.equal(response.status, 200, `Page unavailable: ${url}`);
    const html = await response.text();
    assert(html.includes('<h1'), `Missing heading: ${url}`);
    assert(!html.includes('http://127.0.0.1:'), `Build address leaked: ${url}`);
    assert(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `Noindex page included in live sitemap: ${url}`);
    assert(html.includes('name="google-adsense-account"'), `Missing publisher verification: ${url}`);
    assert.equal((html.match(/name="description"/g) || []).length, 1, `Duplicate descriptions: ${url}`);
    assert.equal(html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1], url, `Wrong canonical: ${url}`);
  }));
}
for (const route of ['/not-a-real-dostrike-page', '/blog/not-a-real-guide']) {
  const response = await get(base + route);
  assert.equal(response.status, 404, `Unknown URL returned ${response.status}: ${route}`);
  assert((await response.text()).includes('content="noindex"'));
}
for (const origin of ['http://dostrike.com', 'https://www.dostrike.com']) {
  const response = await get(`${origin}/about`, { redirect: 'manual' });
  assert([301, 308].includes(response.status), `Expected permanent redirect from ${origin}`);
  assert.equal(response.headers.get('location'), `${base}/about`);
}
assert((await (await get(`${base}/ads.txt`)).text()).includes('pub-4621807979883911'));
assert((await (await get(`${base}/robots.txt`)).text()).includes(`${base}/sitemap.xml`));
const redirects = [...(await fs.readFile('src/data/articleRedirects.ts', 'utf8')).matchAll(/'([^']+)': '([^']+)'/g)];
for (const [, retired, destination] of redirects) {
  for (const suffix of ['', '/']) {
    const response = await get(`${base}/blog/${retired}${suffix}`, { redirect: 'manual' });
    assert.equal(response.status, 301, `Retired guide needs permanent redirect: ${retired}${suffix}`);
    assert.equal(new URL(response.headers.get('location'), base).href, `${base}/blog/${destination}/`);
  }
  assert(!urls.includes(`${base}/blog/${retired}`));
}
for (const alias of ['sitemap_index.xml', 'sitemap.txt', 'urls.txt']) {
  const response = await get(`${base}/${alias}`);
  assert.equal(response.status, 200);
  const content = await response.text();
  const aliasUrls = alias.endsWith('.xml') ? [...content.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]) : content.trim().split(/\r?\n/);
  assert.deepEqual(aliasUrls, urls, `Live sitemap alias drift: ${alias}`);
}
console.log(`Live verification passed: ${urls.length} public pages; canonical URLs, unique descriptions, publisher verification, real 404s, ${redirects.length} consolidated-guide redirects, synchronized sitemaps, HTTPS/domain redirects, ads.txt and robots.txt.`);
