import { esc, md, plain, arrowLink, arrowLinks, href, icon, picture } from './lib/html.mjs';
import { sec, field, fields, ofType, first } from './lib/parse.mjs';
import { SITE } from './config.mjs';
import * as C from './lib/components.mjs';
import { layout, org, person, website, breadcrumbs, faqSchema, service } from './lib/layout.mjs';

const compact = (a) => a.filter(Boolean);
const faqsOf = (s) => ofType(s, 'faq');
const metaOf = (p) => ({ title: p.meta['Title tag'], description: p.meta['Meta description'], path: p.meta.URL });

// Per-service form defaults
export const SERVICE_FORM = {
  '/brands/seo-ai-search-audit/': { pre: 'A traffic or visibility drop', svc: 'audit', aud: 'brand' },
  '/brands/fractional-seo/': { pre: 'A gap in SEO leadership', svc: 'fractional', aud: 'brand' },
  '/brands/interim-seo-lead/': { pre: 'A gap in SEO leadership', svc: 'interim', aud: 'brand' },
  '/brands/managed-seo-services/': { pre: '', svc: 'managed', aud: 'brand' },
  '/brands/technical-seo-services/': { pre: 'Something else', svc: 'technical', aud: 'brand' },
  '/brands/seo-migration-services/': { pre: 'A migration or replatform', svc: 'migrations', aud: 'brand' },
  '/brands/generative-engine-optimization/': { pre: 'Getting found in AI answers', svc: 'geo', aud: 'brand' },
  '/agencies/seo-agency-consulting/': { pre: 'White-label or agency support', svc: 'agency_advisory', aud: 'agency' },
  '/agencies/white-label-seo-services/': { pre: 'White-label or agency support', svc: 'white_label', aud: 'agency' },
  '/agencies/interim-seo-director/': { pre: 'A gap in SEO leadership', svc: 'interim_agency', aud: 'agency' },
};

function crumbPath(raw, url) {
  const names = raw.split(' / ');
  const urls = ['/', url.startsWith('/agencies') ? '/agencies/' : '/brands/', url];
  return names.map((n, i) => ({ name: n, url: names.length === 2 && i === 1 ? url : urls[i] }));
}

function sectionHead({ label, h2, lead, id }) {
  return `<div class="sec-head">${label ? `<p class="label">${esc(label)}</p>` : ''}<h2 class="h2"${id ? ` id="${id}"` : ''}>${md(h2)}</h2>${lead ? `<p class="lead">${md(lead)}</p>` : ''}</div>`;
}

/* ---------- Service page (S1 to S10) ---------- */
export function servicePage(p) {
  const m = metaOf(p); const f = SERVICE_FORM[m.path];
  const S = (k) => sec(p, k);
  const s1 = S('S1'), s2 = S('S2'), s3 = S('S3'), s4 = S('S4'), s5 = S('S5'), s6 = S('S6'), s7 = S('S7'), s8 = S('S8'), s9 = S('S9'), s10 = S('S10');
  const path = crumbPath(field(s1, 'Breadcrumb'), m.path);
  const outcomes = (field(s1, 'Outcomes') || '').split(' · ');
  const submit = plain(field(s1, 'Submit'));
  const s5table = first(s5, 'table');
  const s6table = first(s6, 'table');
  const glance = s6table ? [s6table.head, ...s6table.rows] : [];
  const proofBody = field(s7, 'Body');
  const next = field(s8, 'Usually next') || '';
  const nm = next.match(/^\*\*(.+?)\.\*\*\s*(.*)$/);
  const faqs = faqsOf(s9);
  const isAgency = m.path.startsWith('/agencies');

  const body = `
<section class="panel grid-bg hero">
<div class="wrap">
  ${C.crumbs(path)}
  <div class="hero-grid">
    <div class="hero-copy">
      <p class="label">${esc(field(s1, 'Label'))}</p>
      <h1 class="h1">${md(plain(field(s1, 'H1')))}</h1>
      <p class="lead">${md(field(s1, 'Subhead'))}</p>
      <ul class="outcomes">${outcomes.map(o => `<li>${icon.check}<span>${esc(o)}</span></li>`).join('')}</ul>
      ${C.stats({ agenciesFirst: isAgency })}
    </div>
    ${C.formA({ title: field(s1, 'Form headline'), submit, location: 'service_hero', preselect: f.pre, service: f.svc, audience: f.aud })}
  </div>
</div>
</section>

<section class="section">
<div class="wrap split">
  <div class="sec-head" style="margin:0">${field(s2, 'Label') ? `<p class="label">${esc(field(s2, 'Label'))}</p>` : ''}<h2 class="h2">${md(field(s2, 'H2'))}</h2></div>
  <div><div class="body">${fields(s2, 'Body').map(b => `<p>${md(b)}</p>`).join('')}</div>
  ${field(s2, 'What changes') ? C.changes(field(s2, 'What changes')) : ''}</div>
</div>
</section>

<section class="section alt">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">Best when</p><h2 class="h2">${md(field(s3, 'H2'))}</h2></div>
  ${C.checkList(ofType(s3, 'item'))}
</div>
</section>

<section class="section">
<div class="wrap">
  ${sectionHead({ label: 'What you get', h2: field(s4, 'H2') })}
  ${C.numbered(first(s4, 'ol').items)}
</div>
</section>

${s5table ? `<section class="section alt">
<div class="wrap">
  ${sectionHead({ label: 'How it works', h2: field(s5, 'H2') || 'How it works' })}
  ${C.timeline(s5table.rows)}
</div>
</section>` : ''}

<section class="section">
<div class="wrap">
  ${sectionHead({ label: 'At a glance', h2: 'What working together looks like' })}
  <dl class="glance">${glance.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${md(v)}</dd></div>`).join('')}</dl>
</div>
</section>

<section class="section alt">
<div class="wrap">
  ${sectionHead({ label: 'Proof', h2: field(s7, 'H2') })}
  ${proofBody ? `<p class="proof-quote">${md(proofBody)}</p>` : ''}
  <div style="margin-top:40px">${C.stats({ large: true, agenciesFirst: isAgency })}</div>
</div>
</section>

${nm ? `<section class="section tight">
<div class="wrap"><div class="related"><div><p class="label">Usually next</p><p><b>${esc(nm[1])}.</b> ${md(nm[2])}</p></div><a class="btn btn-outline" href="${href(nm[1])}">Explore ${esc(nm[1])}</a></div></div>
</section>` : ''}

<section class="section${nm ? ' line-top' : ''}">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">FAQ</p><h2 class="h2">Questions about ${esc(p.name.replace(/^(Agency Advisory|White-Label Delivery)$/, '$1'))}</h2></div>
  ${C.faq(faqs)}
</div>
</section>

${C.closingBand({ h2: field(s10, 'H2'), body: field(s10, 'Body'), submit: plain(field(s10, 'Submit') || submit), location: 'service_closing', preselect: f.pre, service: f.svc, audience: f.aud })}
`;
  return layout({
    ...m, body, hasForm: true,
    schema: compact([service({ name: p.name, description: m.description, url: m.path, audience: isAgency ? 'Marketing agencies' : 'In-house marketing and SEO teams' }), breadcrumbs(path), faqSchema(faqs)]),
  });
}

/* ---------- Home ---------- */
export function home(p, posts) {
  const m = metaOf(p); const S = (k) => sec(p, k);
  const h1 = S('H1'), h3 = S('H3'), h4 = S('H4'), h5 = S('H5'), h6 = S('H6'), h7 = S('H7'), h8 = S('H8'), h9 = S('H9');
  // Audience cards from H3: blocks after each "card" marker
  const cards = []; let cur = null;
  for (const b of h3.blocks) { if (b.type === 'card') { cur = { label: b.label, f: {} }; cards.push(cur); } else if (cur && b.type === 'field') cur.f[b.key] = b.value; }
  const moments = first(h4, 'table').rows;
  const pillars = ['Evaluate', 'Lead', 'Deliver'].map((k, i) => { const v = field(h5, k); const mm = v.match(/^\*\*(.+?)\*\*\s*(.*)$/); return { num: `0${i + 1} · ${k}`, h: mm[1].replace(/\.$/, ''), t: mm[2] }; });
  const post = posts[0];
  const body = `
<section class="panel grid-bg hero">
<div class="wrap hero-grid">
  <div class="hero-copy">
    <p class="label">${esc(field(h1, 'Label'))}</p>
    <h1 class="display">${md(plain(field(h1, 'H1')))}</h1>
    <p class="lead">${md(field(h1, 'Subhead'))}</p>
    <p>${arrowLink(field(h1, 'Secondary link'))}</p>
    ${C.stats()}
  </div>
  ${C.formA({ title: field(h1, 'Form headline'), submit: plain(field(h1, 'Submit')), location: 'home_hero' })}
</div>
</section>

<section class="section tight" style="padding-bottom:0">
<div class="wrap"><p class="industries">${md(first(S('H2'), 'p').text)}</p></div>
</section>

<section class="section">
<div class="wrap">
  ${sectionHead({ label: field(h3, 'Label'), h2: field(h3, 'H2') })}
  <div class="audience">${cards.map(c => `<a class="card" href="${href(c.f.Link)}"><p class="label">${esc(c.label)}</p><h3>${md(c.f.H3)}</h3><p>${md(c.f.Body)}</p><span class="arrow-link">${esc(c.f.Link.replace(/\s*→$/, ''))} <span aria-hidden="true">→</span></span></a>`).join('')}</div>
</div>
</section>

<section class="section alt">
<div class="wrap">
  ${sectionHead({ label: field(h4, 'Label'), h2: field(h4, 'H2') })}
  <div class="moments">${moments.map(([t, b, l], i) => `<a href="${href(l)}"><span class="num">0${i + 1}</span><h3>${esc(t)}</h3><p>${md(b)}</p><span class="arrow-link">${esc(l.replace(/\s*→$/, ''))} <span aria-hidden="true">→</span></span></a>`).join('')}</div>
</div>
</section>

<section class="section">
<div class="wrap">
  ${sectionHead({ label: field(h5, 'Label'), h2: field(h5, 'H2') })}
  <div class="pillars">${pillars.map(x => `<div class="pillar"><p class="num">${x.num}</p><h3>${esc(x.h)}</h3><p>${md(x.t)}</p></div>`).join('')}</div>
  <p style="margin-top:40px"><a class="btn btn-outline" href="/approach/">${esc(field(h5, 'Button'))}</a></p>
</div>
</section>

<section class="section panel">
<div class="wrap">
  ${sectionHead({ label: field(h6, 'Label'), h2: field(h6, 'H2') })}
  ${C.stats({ large: true })}
  <div class="cards c3" style="margin-top:48px">${ofType(h6, 'item').map(i => `<div><h3 class="h4" style="margin-bottom:8px">${esc(i.lead.replace(/\.$/, ''))}</h3><p style="color:var(--on-panel-2)">${md(i.text)}</p></div>`).join('')}</div>
  <div style="margin-top:56px"><p class="label" style="margin-bottom:20px">Recent results</p>${C.callouts(field(h6, 'Proof callouts'))}</div>
</div>
</section>

<section class="section">
<div class="wrap meet">
  ${picture('max-cowan-headshot-square', 'Max Cowan, Owner and Principal Consultant of Blue House Digital', { w: 800, h: 800, sizes: '(max-width: 760px) 360px, 480px' })}
  <div class="sec-head" style="margin:0">
    <p class="label">${esc(field(h7, 'Label'))}</p>
    <h2 class="h2">${md(field(h7, 'H2'))}</h2>
    <div class="body"><p>${md(field(h7, 'Body'))}</p></div>
    <div class="btn-row">${arrowLinks(field(h7, 'Links'))}</div>
  </div>
</div>
</section>

<section class="section alt">
<div class="wrap">
  <div class="sec-head" style="display:flex;justify-content:space-between;align-items:end;max-width:none;gap:16px;flex-wrap:wrap"><div style="display:grid;gap:16px"><p class="label">${esc(field(h8, 'Label'))}</p><h2 class="h2">${md(field(h8, 'H2'))}</h2></div>${arrowLink(field(h8, 'Link'))}</div>
  ${postCard(post)}
</div>
</section>

${C.closingBand({ label: field(h9, 'Label'), h2: field(h9, 'H2'), body: field(h9, 'Body'), submit: plain(field(h9, 'Submit')), location: 'home_closing' })}
`;
  return layout({ ...m, body, hasForm: true, schema: [org(), website(), person()] });
}

function postCard(post) {
  return `<a class="post-card" href="${post.url}"><div class="art grid-bg" aria-hidden="true"><img src="/brand/bluehouse-mark-reversed.svg" alt="" width="96" height="60"></div><div class="body-c"><p class="label">${esc(post.label)}</p><h3 class="h3">${esc(post.title)}</h3><p style="color:var(--text-2)">${esc(post.dek)}</p><span class="arrow-link">Read the post <span aria-hidden="true">→</span></span></div></a>`;
}

/* ---------- Hubs ---------- */
export function hub(p) {
  const m = metaOf(p); const S = (k) => sec(p, k);
  const b1 = S('B1'), b2 = S('B2'), b3 = S('B3'), b4 = S('B4'), b5 = S('B5'), b6 = S('B6'), b7 = S('B7');
  const isAgency = m.path === '/agencies/';
  const path = field(b1, 'Breadcrumb').split(' / ').map((n, i) => ({ name: n, url: i ? m.path : '/' }));
  const btns = field(b1, 'Buttons').split(' · ');
  const rows = first(b3, 'table').rows; const groups = {};
  for (const [pl, sv, copy, best] of rows) (groups[pl] ||= []).push({ sv, copy, best });
  const faqs = faqsOf(b6);
  const proof = field(b5, 'Body') || '';
  const pm = proof.match(/proof callouts:\s*(.*)$/);
  const body = `
<section class="panel grid-bg hero">
<div class="wrap hero-simple">
  ${C.crumbs(path)}
  <div class="hero-copy">
    <p class="label">${esc(field(b1, 'Label'))}</p>
    <h1 class="display">${md(plain(field(b1, 'H1')))}</h1>
    <p class="lead">${md(field(b1, 'Subhead'))}</p>
    <div class="btn-row"><a class="btn btn-accent" href="#start" data-cta="hub_hero">${esc(plain(btns[0]))}</a><a class="btn btn-outline" href="${href(plain(btns[1]))}">${esc(plain(btns[1]))}</a></div>
    <div style="max-width:820px">${C.stats({ agenciesFirst: isAgency })}</div>
  </div>
</div>
</section>

<section class="section">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">${esc(field(b2, 'Label'))}</p><h2 class="h2">${md(field(b2, 'H2'))}</h2></div>
  ${C.checkList(ofType(b2, 'item'))}
</div>
</section>

<section class="section alt">
<div class="wrap">
  ${sectionHead({ label: field(b3, 'Label'), h2: field(b3, 'H2') })}
  ${Object.entries(groups).map(([pl, items], i) => `<div class="svc-group"><h3>0${['Evaluate', 'Lead', 'Deliver'].indexOf(pl) + 1} · ${esc(pl)}</h3><div class="svc-list">${items.map(x => `<a class="svc-item" href="${href(x.sv)}"><div><h4>${esc(x.sv)}</h4><p>${md(x.copy)}</p></div><p class="best"><b>Best when</b>${esc(x.best)}</p><span class="go">${icon.arrow}</span></a>`).join('')}</div></div>`).join('')}
</div>
</section>

<section class="section">
<div class="wrap">
  ${sectionHead({ label: field(b4, 'Label'), h2: field(b4, 'H2') })}
  ${C.numbered(first(b4, 'ol').items)}
</div>
</section>

<section class="section panel">
<div class="wrap">
  ${sectionHead({ label: field(b5, 'Label'), h2: field(b5, 'H2') })}
  ${isAgency ? `<p class="proof-quote" style="color:var(--on-panel)">${md(proof)}</p>` : `<p class="industries">${md(C.globals().industries)}</p>${pm ? `<div style="margin-top:40px">${C.callouts(pm[1].replace(/\.$/, ''))}</div>` : ''}`}
  <div style="margin-top:48px">${C.stats({ large: true, agenciesFirst: isAgency })}</div>
</div>
</section>

<section class="section">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">FAQ</p><h2 class="h2">Common questions</h2></div>
  ${C.faq(faqs)}
</div>
</section>

<div id="start"></div>
${C.closingBand({ label: field(b7, 'Label'), h2: field(b7, 'H2'), body: field(b7, 'Body'), submit: plain(field(b7, 'Submit')), location: isAgency ? 'agencies_closing' : 'brands_closing', audience: isAgency ? 'agency' : 'brand' })}
`;
  return layout({ ...m, body, hasForm: true, schema: compact([breadcrumbs(path), faqSchema(faqs)]) });
}

/* ---------- Approach ---------- */
export function approach(p) {
  const m = metaOf(p); const S = (k) => sec(p, k);
  const a1 = S('A1'), a2 = S('A2'), a3 = S('A3'), a4 = S('A4'), a5 = S('A5'), a6 = S('A6'), a7 = S('A7'), a8 = S('A8');
  const stages = ofType(a3, 'item').map(i => {
    const [numPart, rest] = i.lead.split(':'); const svcM = i.text.match(/^(.*?)\s*Services:\s*(.*)$/);
    return { num: numPart.trim(), h: rest.trim().replace(/\.$/, ''), t: svcM ? svcM[1] : i.text, svc: svcM ? svcM[2].split(' · ') : [] };
  });
  const btns = field(a1, 'Buttons').split(' · ');
  const body = `
<section class="panel grid-bg hero">
<div class="wrap hero-simple"><div class="hero-copy">
  <p class="label">${esc(field(a1, 'Label'))}</p>
  <h1 class="display">${md(plain(field(a1, 'H1')))}</h1>
  <p class="lead">${md(field(a1, 'Subhead'))}</p>
  <div class="btn-row"><a class="btn btn-accent" href="/contact/" data-cta="approach_hero">${esc(plain(btns[0]))}</a><a class="btn btn-outline" href="/brands/">${esc(plain(btns[1]))}</a></div>
</div></div>
</section>

<section class="section">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">The problem</p><h2 class="h2">${md(field(a2, 'H2'))}</h2></div>
  <div class="body">${fields(a2, 'Body').map(b => `<p>${md(b)}</p>`).join('')}</div>
</div>
</section>

<section class="section alt">
<div class="wrap">
  ${sectionHead({ label: 'Evaluate, Lead, Deliver', h2: field(a3, 'H2') })}
  <div class="pillars">${stages.map(x => `<div class="pillar"><p class="num">${esc(x.num)}</p><h3>${esc(x.h.charAt(0).toUpperCase() + x.h.slice(1))}</h3><p>${md(x.t)}</p><p class="svc">${x.svc.map(s => href(s) ? `<a href="${href(s)}">${esc(s)}</a>` : esc(s)).join(' · ')}</p></div>`).join('')}</div>
</div>
</section>

<section class="section">
<div class="wrap">
  ${sectionHead({ label: 'Anatomy of a plan', h2: field(a4, 'H2') })}
  ${C.numbered(first(a4, 'ol').items)}
</div>
</section>

<section class="section alt">
<div class="wrap">
  ${sectionHead({ label: 'Engagement timeline', h2: field(a5, 'H2') })}
  ${C.timeline(first(a5, 'table').rows)}
</div>
</section>

<section class="section">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">Principles</p><h2 class="h2">${md(field(a6, 'H2'))}</h2></div>
  ${C.checkList(ofType(a6, 'item'))}
</div>
</section>

<section class="section alt">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">FAQ</p><h2 class="h2">Questions about how we work</h2></div>
  ${C.faq(faqsOf(a7))}
</div>
</section>

${C.closingBand({ h2: field(a8, 'H2'), body: field(a8, 'Body'), location: 'approach_closing' })}
`;
  return layout({ ...m, body, current: 'approach', hasForm: true, schema: compact([breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Approach', url: m.path }]), faqSchema(faqsOf(a7))]) });
}

/* ---------- About ---------- */
export function about(p) {
  const m = metaOf(p); const S = (k) => sec(p, k);
  const ab1 = S('AB1'), ab2 = S('AB2'), ab4 = S('AB4'), ab5 = S('AB5'), ab6 = S('AB6');
  const story = ofType(ab2, 'p').map(x => x.text);
  const line = field(ab1, 'Line'); const lineParts = line.split(' · ');
  const agencies = field(ab5, 'For agencies'); const am = agencies.match(/^(.*?)\s*Link:\s*(.*)$/);
  const expertise = field(ab5, 'Expertise'); const em = expertise.match(/^(.*?)\s*Link:\s*(.*)$/);
  const body = `
<section class="hero grid-bg light" style="position:relative">
<div class="wrap hero-grid" style="align-items:center">
  <div class="hero-copy">
    <p class="label">${esc(field(ab1, 'Label'))}</p>
    <h1 class="display">${md(plain(field(ab1, 'H1')))}</h1>
    <p class="lead">${md(field(ab1, 'Subhead'))}</p>
    <p class="mono small" style="color:var(--muted)">${lineParts.slice(0, 3).map(esc).join(' · ')}</p>
    <p>${arrowLink(lineParts.slice(3).join(' · '))}</p>
  </div>
  ${picture('max-cowan-portrait', 'Max Cowan on a beach, smiling, in a blue linen shirt', { cls: 'portrait', w: 1200, h: 1500, eager: true, sizes: '(max-width: 900px) 100vw, 480px' })}
</div>
</section>

<section class="section alt">
<div class="wrap split">
  <div style="display:grid;gap:24px;align-content:start">
    <div class="sec-head" style="margin:0"><p class="label">Our story</p><h2 class="h2">${md(field(ab2, 'H2'))}</h2></div>
    <figure class="figure" style="margin:0">${picture('max-cowan-family', 'Max Cowan with his family', { w: 1600, h: 1067, sizes: '(max-width: 900px) 100vw, 520px' })}</figure>
  </div>
  <div class="body" style="font-size:18px;line-height:30px">${story.map(s => `<p>${md(s)}</p>`).join('')}</div>
</div>
</section>

<section class="section panel">
<div class="wrap">
  ${sectionHead({ label: 'By the numbers', h2: 'Built on long relationships' })}
  ${C.stats({ large: true })}
  <p class="industries" style="margin-top:32px">${md(C.globals().industries)}</p>
</div>
</section>

<section class="section">
<div class="wrap split">
  <div class="sec-head" style="margin:0"><p class="label">How we work</p><h2 class="h2">${md(field(ab4, 'H2'))}</h2><p>${arrowLink(field(ab4, 'Link'))}</p></div>
  ${C.checkList(ofType(ab4, 'item'))}
</div>
</section>

<section class="section alt">
<div class="wrap cards c2">
  <div class="card"><p class="label">For agencies</p><p style="font-size:18px;line-height:28px;color:var(--text)">${md(am[1])}</p>${arrowLink(am[2])}</div>
  <div class="card"><p class="label">Expertise</p><p style="font-size:18px;line-height:28px;color:var(--text)">${md(em[1])}</p>${arrowLink(em[2])}</div>
</div>
</section>

${C.closingBand({ h2: field(ab6, 'H2'), body: field(ab6, 'Body'), location: 'about_closing' })}
`;
  return layout({ ...m, body, current: 'about', hasForm: true, schema: [person(), org(), breadcrumbs([{ name: 'Home', url: '/' }, { name: 'About', url: m.path }])] });
}

/* ---------- Contact + thanks ---------- */
export function contact(p) {
  const m = metaOf(p); const c1 = sec(p, 'C1');
  const steps = field(c1, 'What happens next').split(' · ').map(s => { const mm = s.match(/^\d+\.\s*\*\*(.+?)\*\*\s*(.*)$/); return { lead: mm[1], text: mm[2] }; });
  const body = `
<section class="hero">
<div class="wrap split contact-split">
  <div style="display:grid;gap:22px;align-content:start">
    <p class="label">${esc(field(c1, 'Label'))}</p>
    <h1 class="display">${md(plain(field(c1, 'H1')))}</h1>
    <p class="lead">${md(field(c1, 'Intro'))}</p>
    <div class="byline-row">${picture('max-cowan-headshot-square', 'Max Cowan', { cls: '', w: 104, h: 104 }).replace('<img ', '<img class="avatar" ')}<p class="small"><strong>Max Cowan</strong><br><span style="color:var(--muted)">Owner &amp; Principal Consultant</span></p></div>
    <h2 class="h4" style="margin-top:12px">What happens next</h2>
    <ol class="numbered" style="grid-template-columns:1fr">${steps.map(s => `<li><b>${md(s.lead.replace(/\.$/, ''))}</b><span>${md(s.text)}</span></li>`).join('')}</ol>
    <p class="small" style="color:var(--text-2)">${md(field(c1, 'Email line'))}<br>${esc(field(c1, 'Location line'))}</p>
  </div>
  ${C.formB()}
</div>
</section>`;
  return layout({ ...m, body, hasForm: true, schema: [breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Contact', url: m.path }])] });
}
export function thanks(p) {
  const c2 = sec(p, 'C2');
  const sched = SITE.meetingsUrl ? `<div class="meetings-iframe-container" data-src="${esc(SITE.meetingsUrl)}?embed=true"></div><script src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js" defer></script>` : `<div class="card" style="min-height:260px;justify-content:center;align-items:flex-start"><p>Max will email you a few times that work. Or write to <a href="mailto:${SITE.email}">${SITE.email}</a>.</p></div>`;
  const body = `
<section class="hero">
<div class="wrap split even">
  <div style="display:grid;gap:20px;align-content:start">
    <p class="label">${esc(field(c2, 'Label'))}</p>
    <h1 class="h1">${md(field(c2, 'H2'))}</h1>
    <p class="lead">${md(field(c2, 'Body'))}</p>
    <h2 class="h4" style="margin-top:12px">While you wait</h2>
    <p style="display:grid;gap:8px"><a class="arrow-link" href="/insights/insights-are-coming/">Insights are coming <span aria-hidden="true">→</span></a><a class="arrow-link" href="/approach/">See how we work <span aria-hidden="true">→</span></a></p>
  </div>
  <div><p class="label" style="margin-bottom:14px">${esc(field(c2, 'Scheduler label'))}</p>${sched}</div>
</div>
</section>
<script>(function(){try{if(window.gtag){gtag('event','generate_lead',{form_location:sessionStorage.getItem('bh_last_form')||'unknown'})}}catch(e){}})();</script>`;
  return layout({ path: '/contact/thanks/', title: 'Thanks | Blue House Digital', description: 'Thanks for reaching out to Blue House Digital.', body, noindex: true });
}

/* ---------- Insights ---------- */
export function insights(p, posts) {
  const m = metaOf(p); const i1 = sec(p, 'I1'), i4 = sec(p, 'I4');
  const body = `
<section class="hero grid-bg light" style="position:relative;padding-bottom:48px">
<div class="wrap"><div class="hero-copy" style="max-width:820px">
  <p class="label">${esc(field(i1, 'Label'))}</p>
  <h1 class="display">${md(plain(field(i1, 'H1')))}</h1>
  <p class="lead">${md(field(i1, 'Intro'))}</p>
</div></div>
</section>
<section class="section" style="padding-top:24px">
<div class="wrap">
  <p class="label" style="margin-bottom:20px">Featured</p>
  ${posts.map(postCard).join('')}
</div>
</section>
<section class="section panel">
<div class="wrap" style="display:flex;flex-wrap:wrap;gap:24px;justify-content:space-between;align-items:center">
  <h2 class="h2">${md(field(i4, 'H2'))}</h2><a class="btn btn-accent" href="/contact/" data-cta="insights_closing">${esc(plain(field(i4, 'Button')))}</a>
</div>
</section>`;
  return layout({ ...m, body, current: 'insights', schema: [breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Insights', url: m.path }])] });
}
export function post(p, info) {
  const s = p.sections[0];
  const b = (k) => field(s, k);
  const author = b('Author box'); const am = author.match(/^(.*?)\s*Links:\s*(.*)$/);
  const body = `
<section class="hero">
<div class="wrap">
  ${C.crumbs([{ name: 'Home', url: '/' }, { name: 'Insights', url: '/insights/' }, { name: plain(b('H1')), url: info.url }])}
  <div class="article-head">
    <p class="label">${esc(b('Label'))}</p>
    <h1 class="h1">${md(plain(b('H1')))}</h1>
    <p class="lead">${md(b('Dek'))}</p>
    <div class="byline-row">${picture('max-cowan-headshot-square', 'Max Cowan', { w: 104, h: 104 }).replace('<img ', '<img class="avatar" ')}<p class="small"><a href="/about/" style="font-weight:600;color:var(--text);text-decoration:none">Max Cowan</a> · Owner &amp; Principal Consultant<br><span style="color:var(--muted)">Published <time datetime="${info.date}">${info.dateLabel}</time></span></p></div>
  </div>
</div>
</section>
<section class="section" style="padding-top:0">
<div class="wrap" style="display:grid;gap:48px">
  <div class="article-body">${fields(s, 'Body').map(x => `<p>${md(x)}</p>`).join('')}<p><a class="btn btn-accent" href="/contact/" data-cta="article_inline">${esc(b('Button'))}</a></p></div>
  <aside class="author-box">${picture('max-cowan-headshot-square', 'Max Cowan', { w: 176, h: 176 })}<div style="display:grid;gap:8px"><p><strong>Max Cowan</strong></p><p class="small" style="color:var(--text-2)">${md(am[1])}</p><div class="btn-row small">${arrowLinks(am[2])}</div></div></aside>
</div>
</section>`;
  return layout({
    path: info.url, title: p.meta['Title tag'], description: p.meta['Meta description'], body, current: 'insights',
    schema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: plain(b('H1')), description: p.meta['Meta description'], datePublished: info.date, dateModified: info.date, author: { '@id': SITE.url + '/about/#max', '@type': 'Person', name: 'Max Cowan', url: SITE.url + '/about/' }, publisher: { '@id': SITE.url + '/#org' }, mainEntityOfPage: SITE.url + info.url, image: SITE.url + '/img/max-cowan-portrait.jpg' }, person(), breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Insights', url: '/insights/' }, { name: plain(b('H1')), url: info.url }])],
  });
}

/* ---------- AI instructions ---------- */
export function aiPage(p, today) {
  const m = metaOf(p); const s = sec(p, 'Page copy');
  const out = []; let open = null;
  for (const blk of s.blocks) {
    if (blk.type === 'field' && blk.key === 'H1') continue;
    if (blk.type === 'field' && blk.key === 'Intro') { out.push(`<p class="lead">${md(blk.value.replace('[date]', today.label))}</p>`); continue; }
    if (blk.type === 'subhead') { if (open) { out.push('</ul>'); open = null; } out.push(`<h2>${esc(blk.text)}</h2>`); continue; }
    if (blk.type === 'p') { if (open) { out.push('</ul>'); open = null; } out.push(`<p>${md(blk.text)}</p>`); continue; }
    if (blk.type === 'li') { if (!open) { out.push('<ul>'); open = true; } out.push(`<li>${md(blk.text)}</li>`); continue; }
    if (blk.type === 'table') {
      if (open) { out.push('</ul>'); open = null; }
      const linkCell = (c) => /^\/[a-z-]+\/[a-z-/]*$/.test(c) ? `<a href="${c}">${esc(c)}</a>` : /^https?:/.test(c) ? `<a href="${c}">${esc(c)}</a>` : md(c);
      out.push(`<div class="table-wrap"><table><thead><tr>${blk.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${blk.rows.map(r => `<tr>${r.map(c => `<td>${linkCell(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    }
  }
  if (open) out.push('</ul>');
  const body = `
<section class="hero" style="padding-bottom:24px">
<div class="wrap doc">
  ${C.crumbs([{ name: 'Home', url: '/' }, { name: 'AI instructions', url: m.path }])}
  <p class="label" style="margin-bottom:16px">For AI assistants</p>
  <h1 class="h1" style="margin-bottom:20px">${md(plain(field(s, 'H1')))}</h1>
</div>
</section>
<section class="section" style="padding-top:0"><div class="wrap doc">${out.join('\n')}<p style="margin-top:32px" class="caption">Plain-text version: <a href="/llms.txt">/llms.txt</a></p></div></section>`;
  return layout({
    ...m, body, schema: [org(), person(), { '@context': 'https://schema.org', '@type': 'WebPage', name: m.title, url: SITE.url + m.path, dateModified: today.iso, about: { '@id': SITE.url + '/#org' } }],
  });
}

/* ---------- Simple pages ---------- */
export function docPage({ path, title, description, h1, label, html, noindex = false }) {
  const body = `<section class="hero" style="padding-bottom:24px"><div class="wrap doc"><p class="label" style="margin-bottom:16px">${esc(label)}</p><h1 class="h1">${esc(h1)}</h1></div></section><section class="section" style="padding-top:0"><div class="wrap doc">${html}</div></section>`;
  return layout({ path, title, description, body, noindex });
}
