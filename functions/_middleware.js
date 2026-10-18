// Host rules for every request:
// - www and the main pages.dev address redirect to https://bluehousedigital.com (one canonical site)
// - preview deployments (<hash>.bluehousedigital.pages.dev) stay viewable but are kept out of search
const CANONICAL = 'bluehousedigital.com';
const REDIRECT_HOSTS = new Set(['www.bluehousedigital.com', 'bluehousedigital.pages.dev']);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.hostname = CANONICAL; url.protocol = 'https:'; url.port = '';
    return Response.redirect(url.toString(), 301);
  }
  const res = await next();
  if (url.hostname !== CANONICAL) {
    const out = new Response(res.body, res);
    out.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return out;
  }
  return res;
}
