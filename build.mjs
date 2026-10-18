// Static site build: node build.mjs  →  dist/
import fs from 'node:fs';
import path from 'node:path';
import { parseCopy } from './src/lib/parse.mjs';
import { setGlobals } from './src/lib/components.mjs';
import * as P from './src/pages.mjs';
import { privacyHtml, termsHtml } from './src/legal.mjs';
import { SITE } from './src/config.mjs';

process.env.BUILD_ID = process.env.CF_PAGES_COMMIT_SHA?.slice(0, 8) || Date.now().toString(36);
const OUT = 'dist';
const LAUNCH_DATE = process.env.LAUNCH_DATE || '2026-10-18';
const fmt = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const today = new Date().toISOString().slice(0, 10);

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync('public', OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync('src/assets/site.css', path.join(OUT, 'assets/site.css'));
fs.copyFileSync('src/assets/site.js', path.join(OUT, 'assets/site.js'));

const pages = parseCopy(fs.readFileSync('content/copy.md', 'utf8'));
const byName = (n) => pages.find(p => p.name === n) || (() => { throw new Error('Missing page in copy: ' + n); })();
setGlobals(byName('Global copy'));

const sitemap = [];
function write(urlPath, html, { index = true } = {}) {
  const file = urlPath.endsWith('/') ? path.join(OUT, urlPath, 'index.html') : path.join(OUT, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (index) sitemap.push(urlPath);
}

// Insights posts
const launch = byName('Launch post: Insights are coming');
const postInfo = { url: launch.meta.URL, date: LAUNCH_DATE, dateLabel: fmt(LAUNCH_DATE) };
const lf = (k) => launch.sections[0].blocks.find(b => b.type === 'field' && b.key === k)?.value || '';
const posts = [{ url: postInfo.url, title: lf('H1').replace(/\*\*/g, ''), dek: lf('Dek'), label: lf('Label') }];

write('/', P.home(byName('Home'), posts));
write('/brands/', P.hub(byName('Brands hub')));
write('/agencies/', P.hub(byName('Agencies hub')));
for (const url of Object.keys(P.SERVICE_FORM)) {
  const page = pages.find(p => p.meta.URL === url);
  write(url, P.servicePage(page));
}
write('/approach/', P.approach(byName('Approach')));
write('/about/', P.about(byName('About')));
write('/contact/', P.contact(byName('Contact')));
write('/contact/thanks/', P.thanks(byName('Contact')), { index: false });
write('/insights/', P.insights(byName('Insights index'), posts));
write(postInfo.url, P.post(launch, postInfo));
const ai = byName('AI instructions page (new)');
write('/ai-instructions/', P.aiPage(ai, { iso: today, label: fmt(today) }));
write('/privacy/', P.docPage({ path: '/privacy/', title: 'Privacy Policy | Blue House Digital', description: 'How Blue House Digital collects, uses and protects information submitted through bluehousedigital.com.', h1: 'Privacy policy', label: 'Legal', html: privacyHtml(fmt(LAUNCH_DATE)) }));
write('/terms/', P.docPage({ path: '/terms/', title: 'Terms of Use | Blue House Digital', description: 'The terms that apply when you use bluehousedigital.com, the website of Blue House Digital, LLC in Denver, Colorado.', h1: 'Terms of use', label: 'Legal', html: termsHtml(fmt(LAUNCH_DATE)) }));
write('/404.html', P.docPage({ path: '/404.html', title: 'Page not found | Blue House Digital', description: 'This page does not exist.', h1: "That page isn't here", label: '404', noindex: true, html: '<p class="lead">The link may be old, or the page may have moved.</p><p style="margin-top:24px" class="btn-row"><a class="btn btn-accent" href="/">Go to the home page</a><a class="btn btn-outline" href="/contact/">Book an intro call</a></p>' }), { index: false });

// llms.txt from the copy doc's code block
const llms = ai.sections.find(s => s.key.startsWith('/llms.txt')).blocks.find(b => b.type === 'code').text;
fs.writeFileSync(path.join(OUT, 'llms.txt'), llms.trim() + '\n');

// sitemap.xml + robots.txt
const urls = sitemap.filter(u => !u.endsWith('.html'));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), SITE.indexable
  ? `# Search engines and AI assistants are welcome.\nUser-agent: *\nAllow: /\nDisallow: /contact/thanks/\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap.xml\n`
  : `# Staging build: not for indexing.\nUser-agent: *\nDisallow: /\n`);

// Cloudflare Pages headers and redirects
fs.writeFileSync(path.join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN
${SITE.indexable ? '' : '  X-Robots-Tag: noindex, nofollow\n'}/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=2592000
/brand/*
  Cache-Control: public, max-age=2592000
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/llms.txt
  Content-Type: text/plain; charset=utf-8
`);
fs.writeFileSync(path.join(OUT, '_redirects'), `/home / 301
/contact-us /contact/ 301
/services /brands/ 301
/blog /insights/ 301
/blog/* /insights/ 301
`);

console.log(`Built ${sitemap.length} pages → ${OUT}/ (indexable: ${SITE.indexable})`);
