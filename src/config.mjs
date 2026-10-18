// Site-wide settings. Values that change per environment come from Cloudflare Pages
// environment variables at build time; nothing secret lives here.
const env = process.env;

export const SITE = {
  url: 'https://bluehousedigital.com',
  name: 'Blue House Digital',
  legalName: 'Blue House Digital, LLC',
  tagline: 'Search expertise, when it counts.',
  email: 'max@bluehousedigital.com',
  linkedin: 'https://www.linkedin.com/in/max-cowan/',
  founded: '2018',
  // Indexable by default. functions/_middleware.js keeps preview hosts out of search; SITE_INDEXABLE=false forces a noindex build.
  indexable: env.SITE_INDEXABLE !== 'false',
  // Public keys and IDs (safe to ship to the browser)
  turnstileSiteKey: env.TURNSTILE_SITE_KEY || '0x4AAAAAAFaixtRZ_SnM5mpV',
  ga4Id: env.GA4_ID || 'G-TPKMTV2ZB0',
  hubspotPortalId: env.HUBSPOT_PORTAL_ID || '247722762',
  meetingsUrl: env.HUBSPOT_MEETINGS_URL || 'https://meetings-na2.hubspot.com/max-cowan',
};

export const SITUATIONS = [
  'A migration or replatform',
  'A traffic or visibility drop',
  'A gap in SEO leadership',
  'Getting found in AI answers',
  'White-label or agency support',
  'Something else',
];
