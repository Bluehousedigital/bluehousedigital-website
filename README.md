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

Without the HubSpot variables the form still accepts submissions (useful on staging) and logs them in the Pages function logs.

## HubSpot form fields

Both forms use standard contact properties (`firstname`, `lastname`, `email`, `company`, `website`, `jobtitle`, `message`) plus these custom contact properties: `bh_situation`, `bh_audience`, `bh_form_location`, `bh_service_interest`, `bh_referrer`, and the five `utm_*` fields. If a custom property is missing, the handler falls back to standard fields and folds the details into `message`, so no lead is lost.
