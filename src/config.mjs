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
  // Staging stays out of search until launch: set SITE_INDEXABLE=true on the production build.
  indexable: env.SITE_INDEXABLE === 'true',
  // Public keys and IDs (safe to ship to the browser)
  turnstileSiteKey: env.TURNSTILE_SITE_KEY || '0x4AAAAAAFaixtRZ_SnM5mpV',
  ga4Id: env.GA4_ID || 'G-TPKMTV2ZB0',
  hubspotPortalId: env.HUBSPOT_PORTAL_ID || '247722762',
  meetingsUrl: env.HUBSPOT_MEETINGS_URL || '',
};

export const SITUATIONS = [
  'A migration or replatform',
  'A traffic or visibility drop',
  'A gap in SEO leadership',
  'Getting found in AI answers',
  'White-label or agency support',
  'Something else',
];
