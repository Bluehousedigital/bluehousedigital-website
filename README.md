# bluehousedigital.com

The Blue House Digital website. A small, dependency-free static site generator turns the approved copy (`content/copy.md`) into pages, and Cloudflare Pages hosts it.

## How it works

- `content/copy.md`: the approved website copy, exported from the copy doc. Edit copy here (or re-export the doc) and every page updates.
- `build.mjs`: builds the site into `dist/`.
- `src/`: templates (`pages.mjs`), shared parts (`lib/`), styles and browser script (`assets/`).
- `public/`: fonts, logos, favicons and photos, copied as-is.
- `functions/api/lead.js`: the form handler. It checks spam protection (honeypot plus Cloudflare Turnstile) and sends leads to HubSpot.

Build locally with `node build.mjs`. Node 20 or newer, no install step.

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `node build.mjs` |
| Build output directory | `dist` |
| Production branch | `main` |

### Environment variables

| Name | Where | Value |
| --- | --- | --- |
| `SITE_INDEXABLE` | Production only, at launch | `true` (until then, every page is noindex and robots.txt blocks crawling) |
| `TURNSTILE_SECRET` | Secret | Turnstile secret key |
| `HUBSPOT_PORTAL_ID` | Plain | HubSpot account ID |
| `HUBSPOT_FORM_A` | Plain | Form GUID for the short form |
| `HUBSPOT_FORM_B` | Plain | Form GUID for the contact form |
| `GA4_ID` | Plain | GA4 Measurement ID (G-XXXXXXX) |
| `HUBSPOT_MEETINGS_URL` | Plain, optional | Meetings link for the thanks page scheduler |
| `LAUNCH_DATE` | Plain, optional | Publish date shown on the launch post (YYYY-MM-DD) |

The HubSpot account (247722762, na2) and the "Website lead form" GUID are built in as defaults in `src/config.mjs` and `functions/api/lead.js`, so no HubSpot variables are required. Both site forms submit into that one form. Bot filtering is off on that HubSpot form because Turnstile and the honeypot handle spam; leave it off or server-side submissions land in spam.

## HubSpot form fields

Only standard contact properties are sent: `firstname`, `lastname`, `email`, `company`, `website`, `jobtitle`, `message`. Situation, form location, service page, audience, referrer and UTM values are listed inside `message`, so no custom properties are needed. The forms carry `data-hs-do-not-collect` so HubSpot's collected-forms script doesn't double capture them.
