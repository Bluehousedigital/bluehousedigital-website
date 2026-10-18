// Cloudflare Pages Function: POST /api/lead
// Checks the honeypot and Turnstile, then submits the lead to HubSpot's Forms API.
// Environment variables (set in Cloudflare Pages > Settings > Variables and secrets):
//   TURNSTILE_SECRET   (secret)  Turnstile secret key
//   HUBSPOT_PORTAL_ID           HubSpot account ID
//   HUBSPOT_FORM_A              Form GUID for the short form
//   HUBSPOT_FORM_B              Form GUID for the full contact form
//   LEAD_FALLBACK_URL (optional) Webhook to receive leads if HubSpot is not configured

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const clip = (v, n = 500) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

// The one HubSpot form both site forms submit into (env vars override).
const HUBSPOT_FORM_DEFAULT = '01a3a78f-6657-4274-80cf-61b514fc0370';

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ error: 'Please try again.' }, 400); }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (clip(d.company_url)) return json({ ok: true });

  const name = clip(d.name, 120), email = clip(d.email, 200), company = clip(d.company, 200), situation = clip(d.situation, 120);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !company || !situation) return json({ error: 'Please fill in the required fields.' }, 400);

  // Turnstile
  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', clip(d['cf-turnstile-response'], 4096));
    form.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
    const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form }).then(r => r.json()).catch(() => ({ success: false }));
    if (!ts.success) return json({ error: 'We couldn’t confirm you’re human. Please try again.' }, 403);
  }

  const [firstname, ...rest] = name.split(/\s+/);
  // Standard HubSpot contact properties only, so no custom setup is needed.
  // Everything else is laid out in the Message field, one item per line.
  const details = [
    ['Situation', situation], ['Form', clip(d.bh_form_location, 60)], ['Service page', clip(d.bh_service_interest, 60)],
    ['Audience', clip(d.audience || d.bh_audience, 40)], ['Referrer', clip(d.referrer, 500)],
    ['UTM', ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].map(k => clip(d[k])).filter(Boolean).join(' / ')],
  ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  const note = clip(d.message, 4000);
  const fields = [
    ['firstname', firstname], ['lastname', rest.join(' ')], ['email', email], ['company', company],
    ['website', clip(d.website, 300)], ['jobtitle', clip(d.role, 120)],
    ['message', [note, details].filter(Boolean).join('\n\n---\n')],
  ].filter(([, v]) => v).map(([name, value]) => ({ objectTypeId: '0-1', name, value }));

  const portal = env.HUBSPOT_PORTAL_ID || '247722762';
  const formGuid = (d.form === 'B' && env.HUBSPOT_FORM_B) || env.HUBSPOT_FORM_A || HUBSPOT_FORM_DEFAULT;
  if (portal && formGuid) {
    const context = { pageUri: clip(d.pageUri, 500), pageName: clip(d.pageName, 200), ipAddress: request.headers.get('CF-Connecting-IP') || undefined };
    if (clip(d.hutk, 100)) context.hutk = clip(d.hutk, 100);
    // Try the global endpoint first, then the account's own data-centre endpoint (this account is on na2).
    const hosts = ['api.hsforms.com', 'api-na2.hsforms.com'];
    let last = '';
    for (const body of [{ fields, context }, { fields }]) {
      for (const host of hosts) {
        try {
          const res = await fetch(`https://${host}/submissions/v3/integration/submit/${portal}/${formGuid}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
          });
          if (res.ok) { console.log('HubSpot ok', host, email); return json({ ok: true, via: host }); }
          last = `${host} ${res.status} ${(await res.text()).slice(0, 300)}`;
        } catch (e) { last = `${host} ${e.message}`; }
        console.error('HubSpot error', last);
      }
    }
    return json({ error: 'Your message didn’t go through.' }, 502);
  }

  if (env.LEAD_FALLBACK_URL) {
    await fetch(env.LEAD_FALLBACK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, company, situation, ...d }) }).catch(() => {});
    return json({ ok: true });
  }

  // Staging without HubSpot configured: accept and log so form testing works.
  console.log('Lead (HubSpot not configured):', JSON.stringify({ name, email, company, situation, location: d.bh_form_location }));
  return json({ ok: true, delivered: false });
}

export const onRequest = () => json({ error: 'Method not allowed' }, 405);
