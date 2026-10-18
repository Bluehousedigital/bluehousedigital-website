# bluehousedigital.com operations runbook

How the live site is built, where everything lives, and how to change it. Last updated Oct 18, 2026 (launch day).

## The short version
- The site's code and copy live in a private GitHub repo: **Bluehousedigital/bluehousedigital-website** (branch `main`).
- Cloudflare Pages watches that repo. **Every push to `main` rebuilds and publishes the live site in about 2 minutes.** Nothing to click in Cloudflare.
- All page copy comes from one file: `content/copy.md`. Change the copy there and every page updates.
- Leads go to HubSpot. Visits go to Google Analytics. Spam is blocked by Cloudflare Turnstile.

## Where things live

| What | Where |
| --- | --- |
| Live site | https://bluehousedigital.com (www and bluehousedigital.pages.dev redirect here) |
| Code and copy | GitHub: Bluehousedigital/bluehousedigital-website (private) |
| Hosting and DNS | Cloudflare (max@bluehousedigital.com), Pages project `bluehousedigital`, zone `bluehousedigital.com` |
| Domain registration | GoDaddy (nameservers point to Cloudflare: crystal / newt) |
| Email | Google Workspace (MX records in Cloudflare DNS) |
| Leads | HubSpot portal 247722762 (na2), form "Website lead form" (GUID 01a3a78f-6657-4274-80cf-61b514fc0370) |
| Booking calendar | HubSpot Meetings: https://meetings-na2.hubspot.com/max-cowan (embedded on /contact/thanks/) |
| Analytics | GA4 property "Blue House Digital Website", stream "Blue House Website", Measurement ID G-TPKMTV2ZB0 |
| Spam protection | Turnstile widget "Blue House website forms", site key 0x4AAAAAAFaixtRZ_SnM5mpV; secret stored only as the Pages secret `TURNSTILE_SECRET` |
| Search | Google Search Console (domain verified by TXT record); sitemap at /sitemap.xml |
| Copy doc (editorial history) | https://claude.ai/code/artifact/387a899c-6b0e-436e-b4c6-ec8b89513121 |
| Wireframes | https://claude.ai/artifact/HhMybabbf4AFTfkGntZLGw |

Never paste the Turnstile secret, passwords or API tokens into a chat or a project doc.

## Repo map

| Path | What it does |
| --- | --- |
| `content/copy.md` | The approved copy for every page. `## Page name` starts a page; fields like `H1:`, `Title tag:`, `Meta description:` and section headings drive the templates. A mirror is saved in this project as `website/site-copy-live.md`. |
| `build.mjs` | Builds the site into `dist/`: 21 pages, 404, thanks page, sitemap.xml, robots.txt, llms.txt, `_headers`, `_redirects`. Path redirects (e.g. /blog → /insights/) are set here. |
| `src/pages.mjs` | Page templates (home, hubs, service pages, approach, about, contact, thanks, insights, post, AI instructions, legal). `SERVICE_FORM` maps each service URL to its preselected form option. |
| `src/lib/` | `parse.mjs` reads copy.md; `components.mjs` holds header, footer, forms, FAQ, CTA bands; `layout.mjs` holds the page shell, meta tags, schema, GA4/HubSpot/Turnstile scripts; `html.mjs` holds helpers and the link map. |
| `src/config.mjs` | Site facts and IDs: URL, email, LinkedIn, founded year, GA4, HubSpot, Meetings, Turnstile site key, the six form "situation" options. |
| `src/legal.mjs` | Privacy policy and terms (plain-language drafts; legal review still pending). |
| `src/assets/site.css`, `site.js` | Design system (v2 brand tokens, Instrument Sans + IBM Plex Mono) and browser behaviour (menus, mobile bar, form validation and submit). |
| `public/` | Fonts, logo SVGs, favicons, photos (`img/max-cowan-*`, `og-default.jpg`). Copied as-is. |
| `functions/api/lead.js` | Form handler: honeypot, Turnstile check, sends the lead to HubSpot. |
| `functions/_middleware.js` | Redirects www and pages.dev to the canonical domain; keeps preview deployments out of search. |

Build locally with `node build.mjs` (Node 20+, no install step). Preview with `npx serve dist`.

## How a change goes live (for Claude)
1. Attach the repo to the session: `add_repo` owner `Bluehousedigital`, repo `bluehousedigital-website`, access `push`. Clone it.
2. Make the change (usually `content/copy.md`; layout or behaviour changes go in `src/`).
3. Run `node build.mjs` and check the result: no build errors, no em dashes in copy, one H1 per page, links resolve, forms untouched unless intended. For visual changes, screenshot the affected pages at desktop and mobile widths with Playwright.
4. Commit with a clear message and push to `main`. Cloudflare deploys in about 2 minutes. The latest build shows under Workers & Pages → bluehousedigital → Deployments.
5. Confirm on https://bluehousedigital.com (WebFetch works on the live domain).
6. If the change touches copy, update `website/site-copy-live.md` in this project so the mirror stays current.

For a risky change, push to a branch first. Cloudflare builds every branch as a preview at `<branch>.bluehousedigital.pages.dev` (noindex), so Max can review before merging to `main`.

To undo a bad deploy: in Cloudflare Deployments, open the last good deployment → "Rollback to this deployment". Then fix forward in the repo.

## Common changes
- **Edit copy, headlines, FAQs, pricing:** `content/copy.md`.
- **Add an Insights post:** add a page block to `content/copy.md` (copy the "Launch post: Insights are coming" pattern), then register it in `build.mjs` (the `posts` list) so it appears on /insights/, the home page and the sitemap.
- **Add a service page:** copy block in `content/copy.md` with its URL, add the URL to `SERVICE_FORM` in `src/pages.mjs`, add it to the nav in `src/lib/components.mjs`.
- **Publish case studies (phase two):** the /work/ template is planned but not built into the nav or sitemap yet; build it from the four approved anonymized case studies.
- **Change contact email, LinkedIn, IDs:** `src/config.mjs`.
- **Swap a photo:** replace the .jpg and .webp in `public/img/` with the same names (keep both formats).
- **Change brand colours or type:** the tokens at the top of `src/assets/site.css`; keep them in step with `brand/brand-tokens-v2.json`.

## Forms and leads
- Both site forms post to `/api/lead`, which sends standard HubSpot contact properties: first name, last name, email, company, website, job title, message. Situation, form location, service page, audience, referrer and UTMs are listed inside **Message**.
- HubSpot bot filtering must stay **off** on "Website lead form", or server-side submissions land in spam. Turnstile and the honeypot handle spam instead.
- Forms carry `data-hs-do-not-collect` so HubSpot's collected-forms script doesn't capture them twice.
- Successful submits fire GA4 `generate_lead`, then go to /contact/thanks/ with the Meetings scheduler.
- Test a form change with a `max+testN@bluehousedigital.com` address, then delete the test contact in HubSpot.

## DNS (Cloudflare)
- Apex `bluehousedigital.com`: CNAME → bluehousedigital.pages.dev (proxied). `www`: Pages custom domain.
- Mail: Google Workspace MX (aspmx 1, alt1/alt2 5, alt3/alt4 10); SPF `v=spf1 include:_spf.google.com ~all`; DMARC `v=DMARC1; p=none; rua=mailto:max@bluehousedigital.com`; Google site verification TXT.
- Don't edit DNS at GoDaddy; it has no effect while nameservers point to Cloudflare.

## Open items after launch
- Search Console: resubmit sitemap.xml (the first read caught the old GoDaddy sitemap), request indexing of the home page, add Bing Webmaster Tools.
- GA4: star `generate_lead` as a key event once it appears under Recent events.
- Add Google DKIM (`google._domainkey`) from Google Admin.
- Delete the GoDaddy Websites + Marketing site about a week after launch.
- Legal review of privacy and terms.
- Optional: HubSpot brand colour #0E2238 so the scheduler matches.
- Review the Insights topic bank; publish case studies in phase two.
