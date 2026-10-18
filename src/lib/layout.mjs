import { esc } from './html.mjs';
import { SITE } from '../config.mjs';
import { header, footer } from './components.mjs';

export function layout({ path, title, description, body, current = '', schema = [], noindex = false, hasForm = false, ogImage = '/img/og-default.jpg', bodyClass = '' }) {
  const canonical = SITE.url + path;
  const robots = (!SITE.indexable || noindex) ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">';
  const ga = SITE.ga4Id ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga4Id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.ga4Id}');</script>` : '';
  const hs = SITE.hubspotPortalId ? `<script async defer id="hs-script-loader" src="https://js.hs-scripts.com/${SITE.hubspotPortalId}.js"></script>` : '';
  const ts = hasForm ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : '';
  const ld = schema.length ? `<script type="application/ld+json">${JSON.stringify(schema.length === 1 ? schema[0] : { '@context': 'https://schema.org', '@graph': schema.map(s => { const { ['@context']: _, ...rest } = s; return rest; }) })}</script>` : '';
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${robots}
<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE.name}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE.url}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0E2238">
<link rel="preload" href="/fonts/InstrumentSans-400.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/InstrumentSans-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${process.env.BUILD_ID}">
${ld}
${ga}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
<div class="mobile-bar" aria-hidden="true"><a class="btn btn-accent" href="/contact/" tabindex="-1" data-cta="mobile_bar">Book an intro call</a></div>
<script src="/assets/site.js?v=${process.env.BUILD_ID}" defer></script>
${ts}${hs}
</body>
</html>`;
}

// Schema builders
export const org = () => ({
  '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': SITE.url + '/#org',
  name: SITE.name, legalName: SITE.legalName, url: SITE.url + '/', logo: SITE.url + '/favicon-512.png',
  image: SITE.url + '/img/max-cowan-portrait.jpg', email: SITE.email, foundingDate: SITE.founded, slogan: SITE.tagline,
  description: 'SEO and GEO consultancy in Denver, Colorado, setting direction for SEO, GEO and conversion for growing brands and marketing agencies.',
  address: { '@type': 'PostalAddress', addressLocality: 'Denver', addressRegion: 'CO', addressCountry: 'US' },
  areaServed: 'US', founder: { '@id': SITE.url + '/about/#max' }, sameAs: [SITE.linkedin],
  knowsAbout: ['Search engine optimization', 'Generative engine optimization', 'AI search visibility', 'Technical SEO', 'SEO migrations', 'Conversion rate optimization'],
});
export const person = () => ({
  '@context': 'https://schema.org', '@type': 'Person', '@id': SITE.url + '/about/#max', name: 'Max Cowan',
  jobTitle: 'Owner & Principal Consultant', worksFor: { '@id': SITE.url + '/#org' }, url: SITE.url + '/about/',
  image: SITE.url + '/img/max-cowan-headshot-square.jpg', sameAs: [SITE.linkedin],
  address: { '@type': 'PostalAddress', addressLocality: 'Denver', addressRegion: 'CO', addressCountry: 'US' },
});
export const website = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.url + '/#site', url: SITE.url + '/', name: SITE.name, publisher: { '@id': SITE.url + '/#org' } });
export const breadcrumbs = (path) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: path.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, item: SITE.url + p.url })),
});
export const faqSchema = (items) => items.length ? ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\*\*/g, '') } })),
}) : null;
export const service = ({ name, description, url, audience }) => ({
  '@context': 'https://schema.org', '@type': 'Service', name, description, url: SITE.url + url, serviceType: name,
  provider: { '@id': SITE.url + '/#org' }, areaServed: 'US', audience: { '@type': 'Audience', audienceType: audience },
});
