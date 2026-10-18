// Small HTML helpers: escaping, inline markdown and link resolution.
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const LINKS = {
  'See how we work': '/approach/',
  'See our approach': '/approach/',
  'About Blue House': '/about/',
  'About Max': '/about/',
  'SEO consulting for brands': '/brands/',
  'SEO services for agencies': '/agencies/',
  'All brand services': '/brands/',
  'All agency services': '/agencies/',
  'Agency services': '/agencies/',
  'All insights': '/insights/',
  'Explore services': '/brands/',
  'Start with an audit': '/brands/seo-ai-search-audit/',
  'See the audit': '/brands/seo-ai-search-audit/',
  'See white-label delivery': '/agencies/white-label-seo-services/',
  'Visibility & Accuracy Audit': '/brands/seo-ai-search-audit/',
  'Fractional Search Leadership': '/brands/fractional-seo/',
  'Fractional': '/brands/fractional-seo/',
  'Interim Search Leadership': '/brands/interim-seo-lead/',
  'Interim': '/brands/interim-seo-lead/',
  'Managed SEO Services': '/brands/managed-seo-services/',
  'Technical SEO': '/brands/technical-seo-services/',
  'SEO Migrations': '/brands/seo-migration-services/',
  'GEO Services': '/brands/generative-engine-optimization/',
  'Agency Advisory': '/agencies/seo-agency-consulting/',
  'White-Label Delivery': '/agencies/white-label-seo-services/',
  'Interim Agency Leadership': '/agencies/interim-seo-director/',
  'Fractional or Interim': '/brands/fractional-seo/',
  'Book an intro call': '/contact/',
};
export const href = (label) => LINKS[label.replace(/\s*→\s*$/, '').trim()];

// Inline markdown: **bold**, [text](url), bare emails. Escapes everything else.
export function md(s = '') {
  let out = esc(s);
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+|\/[^)\s]*)\)/g, (m, t, u) => `<a href="${u}">${t}</a>`);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])([a-z0-9._%+-]+@bluehousedigital\.com)/gi, '$1<a href="mailto:$2">$2</a>');
  return out;
}
export const plain = (s = '') => s.replace(/\*\*/g, '').trim();

// "Label → (https://...)" or "Label →" → anchor
export function arrowLink(raw, cls = 'arrow-link') {
  const m = raw.match(/^(.*?)\s*→\s*(?:\((https?:[^)]+)\))?\s*$/);
  if (!m) return md(raw);
  const label = m[1].trim();
  const url = m[2] || href(label);
  if (!url) return esc(label);
  const ext = /^https?:/.test(url) ? ' rel="noopener" target="_blank"' : '';
  return `<a class="${cls}" href="${url}"${ext}>${esc(label)} <span aria-hidden="true">→</span></a>`;
}
// Split "A → · B → (url)" lists
export const arrowLinks = (raw) => raw.split(/\s·\s/).map(x => arrowLink(x.trim())).join('');

export const icon = {
  check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  arrow: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>',
  menu: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  close: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
};

export function picture(name, alt, { cls = '', w, h, eager = false, sizes = '100vw' } = {}) {
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<picture class="${cls}"><source srcset="/img/${name}.webp" type="image/webp"><img src="/img/${name}.jpg" alt="${esc(alt)}" width="${w}" height="${h}" ${load} sizes="${sizes}"></picture>`;
}
