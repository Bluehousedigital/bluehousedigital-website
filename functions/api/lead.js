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
  const fields = [
    ['firstname', firstname], ['lastname', rest.join(' ')], ['email', email], ['company', company],
    ['bh_situation', situation], ['website', clip(d.website, 300)], ['jobtitle', clip(d.role, 120)],
    ['message', clip(d.message, 4000)], ['bh_audience', clip(d.audience || d.bh_audience, 40)],
    ['bh_form_location', clip(d.bh_form_location, 60)], ['bh_service_interest', clip(d.bh_service_interest, 60)],
    ['utm_source', clip(d.utm_source)], ['utm_medium', clip(d.utm_medium)], ['utm_campaign', clip(d.utm_campaign)],
    ['utm_term', clip(d.utm_term)], ['utm_content', clip(d.utm_content)], ['bh_referrer', clip(d.referrer, 500)],
  ].filter(([, v]) => v).map(([name, value]) => ({ objectTypeId: '0-1', name, value }));

  const formGuid = d.form === 'B' ? env.HUBSPOT_FORM_B : env.HUBSPOT_FORM_A;
  if (env.HUBSPOT_PORTAL_ID && formGuid) {
    const context = { pageUri: clip(d.pageUri, 500), pageName: clip(d.pageName, 200), ipAddress: request.headers.get('CF-Connecting-IP') || undefined };
    if (clip(d.hutk, 100)) context.hutk = clip(d.hutk, 100);
    const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${env.HUBSPOT_PORTAL_ID}/${formGuid}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields, context }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error('HubSpot error', res.status, detail);
      // Unknown custom properties are the most common cause; retry with standard fields only.
      const std = fields.filter(f => ['firstname', 'lastname', 'email', 'company', 'website', 'jobtitle'].includes(f.name));
      std.push({ objectTypeId: '0-1', name: 'message', value: [situation, clip(d.bh_form_location, 60), clip(d.message, 3000)].filter(Boolean).join(' | ') });
      const retry = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${env.HUBSPOT_PORTAL_ID}/${formGuid}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: std, context }),
      });
      if (!retry.ok) return json({ error: 'Your message didn’t go through.' }, 502);
    }
    return json({ ok: true });
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
