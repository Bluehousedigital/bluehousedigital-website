import { esc, md, plain, arrowLink, arrowLinks, href, icon, picture } from './html.mjs';
import { SITE, SITUATIONS } from '../config.mjs';
import { sec, field, ofType, first } from './parse.mjs';

let G = {}; // globals parsed from the "Global copy" page
export function setGlobals(globalPage) {
  const s = (name) => globalPage.sections.find(x => x.key.startsWith(name)) || { blocks: [] };
  const brands = first(s('Brands menu'), 'table');
  const agencies = first(s('Agencies menu'), 'table');
  const trust = first(s('Trust bar'), 'table');
  const form = s('Short form');
  const errs = (field(form, 'Errors') || '').split(' · ').map(e => e.replace(/^"|"$/g, ''));
  G = {
    brandsMenu: brands.rows, agenciesMenu: agencies.rows,
    stats: trust.rows.map(([b, l]) => ({ b, l })),
    industries: (ofType(s('Trust bar'), 'p')[0]?.text || '').replace(/^Industries line:\s*/, ''),
    steps: first(s('Closing band'), 'ol').items,
    footerBlurb: ofType(s('Footer'), 'p')[0].text,
    micro: field(form, 'Microcopy'),
    errors: { name: errs[0], email: errs[1], company: errs[2], situation: errs[3] },
    sending: field(form, 'Sending state') || 'Sending…',
  };
}
export const globals = () => G;

const PILLAR_NUM = { Evaluate: '01 · Evaluate', Lead: '02 · Lead', Deliver: '03 · Deliver' };

function menuColumns(rows) {
  const groups = {};
  for (const [pillar, item, desc] of rows) (groups[pillar] ||= []).push({ item, desc });
  return Object.entries(groups).map(([p, items]) => `<div class="menu-col"><h3>${PILLAR_NUM[p] || p}</h3>${items.map(i =>
    `<a href="${href(i.item)}"><b>${esc(i.item)}</b><span>${esc(i.desc)}</span></a>`).join('')}</div>`).join('');
}

export function header(current = '') {
  const cur = (p) => current === p ? ' aria-current="page"' : '';
  return `<header class="site-header" id="top">
<div class="wrap nav">
  <a class="brand-logo" href="/" aria-label="Blue House Digital home"><img src="/brand/bluehouse-logo-horizontal.svg" alt="Blue House Digital" width="168" height="28"></a>
  <ul class="nav-links">
    <li><button class="top" aria-expanded="false" aria-controls="menu-brands">For brands ${icon.chev}</button>
      <div class="menu" id="menu-brands"><div class="menu-cols">${menuColumns(G.brandsMenu)}</div>
        <div class="menu-aside"><b>Not sure where to begin?</b><span>Most engagements start with the Visibility &amp; Accuracy Audit.</span><a href="/brands/seo-ai-search-audit/">See the audit →</a><a href="/brands/">All brand services →</a></div></div></li>
    <li><button class="top" aria-expanded="false" aria-controls="menu-agencies">For agencies ${icon.chev}</button>
      <div class="menu agencies" id="menu-agencies"><div class="menu-cols">${menuColumns(G.agenciesMenu)}</div>
        <div class="menu-aside"><b>Advisory, leadership cover and white-label delivery, always under your brand.</b><a href="/agencies/">All agency services →</a></div></div></li>
    <li><a class="top" href="/approach/"${cur('approach')}>Approach</a></li>
    <li><a class="top" href="/insights/"${cur('insights')}>Insights</a></li>
    <li><a class="top" href="/about/"${cur('about')}>About</a></li>
  </ul>
  <a class="btn btn-accent btn-sm nav-cta" href="/contact/" data-cta="header">Book an intro call</a>
  <button class="menu-toggle" aria-expanded="false" aria-controls="mobile-sheet" aria-label="Open menu">${icon.menu}</button>
</div>
<nav class="mobile-sheet" id="mobile-sheet" aria-label="Mobile">
  <details><summary>For brands ${icon.chev}</summary><div class="m-group">${mobileGroup(G.brandsMenu)}<a href="/brands/"><strong>All brand services →</strong></a></div></details>
  <details><summary>For agencies ${icon.chev}</summary><div class="m-group">${mobileGroup(G.agenciesMenu)}<a href="/agencies/"><strong>All agency services →</strong></a></div></details>
  <a class="m-top" href="/approach/">Approach</a><a class="m-top" href="/insights/">Insights</a><a class="m-top" href="/about/">About</a><a class="m-top" href="/contact/">Contact</a>
  <div class="m-cta"><a class="btn btn-accent" href="/contact/">Book an intro call</a></div>
</nav>
</header>`;
}
function mobileGroup(rows) {
  const groups = {};
  for (const [p, item] of rows) (groups[p] ||= []).push(item);
  return Object.entries(groups).map(([p, items]) => `<h3>${PILLAR_NUM[p]}</h3>${items.map(i => `<a href="${href(i)}">${esc(i)}</a>`).join('')}`).join('');
}

export function footer() {
  const brands = G.brandsMenu.map(r => r[1]); const agencies = G.agenciesMenu.map(r => r[1]);
  const li = (items) => items.map(i => `<li><a href="${href(i)}">${esc(i)}</a></li>`).join('');
  return `<footer class="site-footer">
<div class="wrap">
  <div class="foot-grid">
    <div class="foot-brand"><img src="/brand/bluehouse-logo-horizontal-reversed.svg" alt="Blue House Digital" width="176" height="30">
      <p class="foot-tag">${esc(SITE.tagline)}</p><p>${esc(G.footerBlurb)}</p>
      <p><a class="btn btn-accent btn-sm" href="/contact/" data-cta="footer" style="color:var(--on-accent)">Book an intro call</a></p></div>
    <div><h2>For brands</h2><ul>${li(brands)}</ul></div>
    <div><h2>For agencies</h2><ul>${li(agencies)}</ul></div>
    <div><h2>Company</h2><ul><li><a href="/approach/">Approach</a></li><li><a href="/about/">About</a></li><li><a href="/insights/">Insights</a></li><li><a href="/contact/">Contact</a></li><li><a href="/ai-instructions/">AI instructions</a></li></ul></div>
    <div><h2>Contact</h2><ul><li><a href="mailto:${SITE.email}">${SITE.email}</a></li><li>Denver, Colorado</li><li><a href="${SITE.linkedin}" rel="noopener" target="_blank">LinkedIn</a></li></ul></div>
  </div>
  <div class="foot-legal"><span>© ${new Date().getFullYear()} ${esc(SITE.legalName)}</span><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>
</div>
</footer>`;
}

export function stats({ large = false, agenciesFirst = false } = {}) {
  let list = [...G.stats];
  if (agenciesFirst) list = [list.find(s => /Agencies/.test(s.l)), ...list.filter(s => !/Agencies/.test(s.l))];
  return `<dl class="stats${large ? ' large' : ''}">${list.map(s => `<div class="stat"><dt class="visually-hidden">${esc(s.l)}</dt><dd style="margin:0"><b>${esc(s.b)}</b><span>${esc(s.l)}</span></dd></div>`).join('')}</dl>`;
}

let formCount = 0;
// Form A (short) and Form B (full contact)
export function formA({ title = "Tell us what's going on", submit = 'Book an intro call', location, preselect = '', service = '', audience = '' }) {
  const id = `f${++formCount}`;
  const opts = SITUATIONS.map(o => `<option${o === preselect ? ' selected' : ''}>${esc(o)}</option>`).join('');
  return `<form class="form-card bh-form" data-hs-do-not-collect="true" data-form="A" novalidate action="/api/lead" method="post" aria-labelledby="${id}-t">
  <p class="form-title" id="${id}-t">${esc(title)}</p>
  <div class="field"><label for="${id}-name">Name</label><input id="${id}-name" name="name" autocomplete="name" required><span class="err">${esc(G.errors.name)}</span></div>
  <div class="field"><label for="${id}-email">Work email</label><input id="${id}-email" name="email" type="email" autocomplete="email" required><span class="err">${esc(G.errors.email)}</span></div>
  <div class="field"><label for="${id}-company">Company</label><input id="${id}-company" name="company" autocomplete="organization" required><span class="err">${esc(G.errors.company)}</span></div>
  <div class="field"><label for="${id}-sit">What's going on?</label><select id="${id}-sit" name="situation" required><option value=""${preselect ? '' : ' selected'} disabled>Choose one</option>${opts}</select><span class="err">${esc(G.errors.situation)}</span></div>
  ${hidden(location, service, audience)}
  <div class="form-status" role="alert"></div>
  <button class="btn btn-accent" type="submit" data-label="${esc(submit)}">${esc(submit)}</button>
  <p class="micro">${md(G.micro.replace('privacy policy', '[privacy policy](/privacy/)'))}</p>
</form>`;
}
export function formB() {
  const id = 'fb';
  const opts = SITUATIONS.map(o => `<option>${esc(o)}</option>`).join('');
  return `<form class="form-card bh-form" data-hs-do-not-collect="true" data-form="B" novalidate action="/api/lead" method="post" aria-label="Contact form">
  <div class="two-col"><div class="field"><label for="${id}-name">Name</label><input id="${id}-name" name="name" autocomplete="name" required><span class="err">${esc(G.errors.name)}</span></div>
  <div class="field"><label for="${id}-email">Work email</label><input id="${id}-email" name="email" type="email" autocomplete="email" required><span class="err">${esc(G.errors.email)}</span></div></div>
  <div class="two-col"><div class="field"><label for="${id}-company">Company</label><input id="${id}-company" name="company" autocomplete="organization" required><span class="err">${esc(G.errors.company)}</span></div>
  <div class="field"><label for="${id}-web">Website <span class="opt">(optional)</span></label><input id="${id}-web" name="website" type="url" inputmode="url" autocomplete="url" placeholder="https://"></div></div>
  <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:500;margin-bottom:6px">I'm with a</legend><div class="radio-row"><label><input type="radio" name="audience" value="Brand" checked> Brand</label><label><input type="radio" name="audience" value="Agency"> Agency</label></div></fieldset>
  <div class="field"><label for="${id}-sit">What's going on?</label><select id="${id}-sit" name="situation" required><option value="" selected disabled>Choose one</option>${opts}</select><span class="err">${esc(G.errors.situation)}</span></div>
  <div class="field"><label for="${id}-role">Role <span class="opt">(optional)</span></label><input id="${id}-role" name="role" autocomplete="organization-title"></div>
  <div class="field"><label for="${id}-msg">Anything else we should know? <span class="opt">(optional)</span></label><textarea id="${id}-msg" name="message"></textarea></div>
  ${hidden('contact_full', '', '')}
  <div class="form-status" role="alert"></div>
  <button class="btn btn-accent" type="submit" data-label="Book an intro call">Book an intro call</button>
  <p class="micro">${md(G.micro.replace('privacy policy', '[privacy policy](/privacy/)'))}</p>
</form>`;
}
function hidden(location, service, audience) {
  return `<input type="hidden" name="bh_form_location" value="${esc(location)}"><input type="hidden" name="bh_service_interest" value="${esc(service)}"><input type="hidden" name="bh_audience" value="${esc(audience)}">
  <div class="hp" aria-hidden="true"><label>Leave this field empty<input name="company_url" tabindex="-1" autocomplete="off"></label></div>
  <div class="cf-turnstile" data-sitekey="${SITE.turnstileSiteKey}" data-appearance="interaction-only" data-size="flexible"></div>`;
}

export function closingBand({ label = 'Next step', h2, body, submit = 'Book an intro call', location, preselect, service, audience, steps = true }) {
  return `<section class="section panel grid-bg" aria-labelledby="close-h">
<div class="wrap closing-grid">
  <div class="closing-copy">
    <p class="label">${esc(label)}</p>
    <h2 class="h2" id="close-h">${md(h2)}</h2>
    ${body ? `<p class="lead">${md(body)}</p>` : ''}
    ${steps ? `<ol class="steps">${G.steps.map(s => `<li><div><b>${esc(s.lead.replace(/\.$/, ''))}</b><span>${md(s.text)}</span></div></li>`).join('')}</ol>` : ''}
  </div>
  ${formA({ title: "Tell us what's going on", submit, location, preselect, service, audience })}
</div>
</section>`;
}

export function faq(items, title = 'Questions, answered') {
  return `<div class="faq">${items.map(f => `<details><summary>${esc(f.q)}<span class="plus" aria-hidden="true"></span></summary><div class="answer"><p>${md(f.a)}</p></div></details>`).join('')}</div>`;
}

export function crumbs(path) {
  // path: [{name, url}]
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${path.map((p, i) => i < path.length - 1 ? `<li><a href="${p.url}">${esc(p.name)}</a></li>` : `<li aria-current="page">${esc(p.name)}</li>`).join('')}</ol></nav>`;
}

export function checkList(items) {
  return `<ul class="check-list">${items.map(i => `<li>${icon.check}<div><b>${md(i.lead)}</b> <span>${md(i.text)}</span></div></li>`).join('')}</ul>`;
}
export function numbered(items) {
  return `<ol class="numbered">${items.map(i => `<li><b>${md(i.lead.replace(/\.$/, ''))}</b><span>${md(i.text)}</span></li>`).join('')}</ol>`;
}
export function timeline(rows) {
  return `<ol class="timeline">${rows.map(([when, step, detail]) => `<li><span class="when">${esc(when)}</span><b>${esc(step)}</b><p>${md(detail)}</p></li>`).join('')}</ol>`;
}
export function changes(raw) {
  const pairs = raw.split(' · ').map(p => p.split(' → '));
  return `<div class="changes"><div class="changes-head">What changes</div>${pairs.map(([a, b]) => `<div class="change"><span class="from">${esc(a)}</span>${icon.arrow}<span class="to">${esc(b)}</span></div>`).join('')}</div>`;
}
export function callouts(raw) {
  return `<ul class="callouts">${raw.split(' · ').map(c => `<li>${md(c.replace(/\.$/, ''))}</li>`).join('')}</ul>`;
}
