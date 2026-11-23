# WB Taxi local CMS

Strapi 5 runs independently of Next.js, using SQLite and local media storage. The website reads published CMS content server-side with a read-only token.

## Start

Use the Node version in the root `.nvmrc`. From the repository root, run these in separate terminals:

```sh
npm run cms:dev
```

```sh
npm run dev
```

CMS: http://127.0.0.1:1337/admin. Website: http://localhost:3000. Create a local administrator account on the first visit if one does not exist.

## Fresh checkout and seeding

```sh
npm ci
npm --prefix cms ci
node scripts/setup-cms-env.mjs
npm run cms:seed
npm run cms:organize
npm run cms:preview:setup
```

Stop Strapi before seeding. The command checks that its port is free, loads the local SQLite CMS, imports the original site content and images, and creates a server-only read token. It writes `STRAPI_URL` and `STRAPI_API_TOKEN` to the root `.env.local`, preserving other variables. Restart Next.js after the initial connection setup.

The initial import contains 10 country/language site pages, 22 localized news records, 2 Uzbekistan tariff documents (Russian and Uzbek), and 13 images. Existing placeholder answers and demo city coverage are preserved as supplied.

Seeding adds missing records only. It does not overwrite edits, republish existing drafts, or duplicate uploaded images. Record identity is country/language for site pages and tariffs, and country/language/storyId for news. Rerunning a seed after deleting a source record recreates that missing record.

## Editing

Open a **Site page** for the relevant country and language. Its editor follows the website from top to bottom:

1. Header and navigation
2. 01. Hero — complete heading, button label, background and retina image
3. 02. Features — heading text, three card captions, carousel labels
4. 03. Cities — heading text and ordered city entries
5. 04. Cashback — heading, subtitle, rate, terms, download statistics
6. 05. App download — heading, its own button label, QR hint, store labels
7. 06. FAQ — heading text and ordered questions, answers, and optional links
8. 07. News — section and related-news headings
9. Footer — legal link labels and heading
10. Cookie notice — one rich-text message with inline links, plus its button

Each section heading is one text field, including the complete hero headline. The former hero location is merged into that headline and no longer edited separately. The browser wraps it naturally, and animation rows are measured after fonts load and on resize. Use `**text**` inside the heading to highlight words; do not insert manual line breaks. Other section fields use named inputs; no JSON arrays are needed. Cities and FAQs can be added, removed, or reordered within their sections. Section order follows the current website layout.

News articles remain in **News story**, filtered by the same country and language. Edit the title, description, image, date, order, and body there. `storyId` groups translations and must be unique within a country/language; `slug` is globally unique. Existing links stay in `href`. New articles with a rich-text `body` and no `href` link automatically to `/news/{slug}`. The existing support story uses **Support article** fields to preserve its custom layout; the rich-text body is used when that component is absent.

**Tariff document** contains ordered sections and entries. Retain stable `sectionId` values for anchors. Entry titles can be empty for general conditions. `heading` retains the source heading; the visible page title uses the localized interface label. Countries without published tariffs show the existing empty state; a missing translation uses that country's available base document.

Use **Save** for drafts and **Publish** for website updates. Refresh the website to see published changes; no rebuild is required. Unpublishing news removes its card and gives its article URL a 404 for that locale. Keep one published site page per supported country/language and at most one tariff document per country/language.

## Migrating an older editor

Stop Strapi, then run:

```sh
npm run cms:organize
```

This creates a database backup and content snapshot in `cms/.tmp/`, moves the existing page content into its matching sections, verifies the effective published and draft content, and saves the editor field order. Saved drafts remain independent of published versions. Existing section edits are preserved on reruns. Previous flat fields remain stored but hidden for recovery.

Run this command after seeding a fresh checkout as well, to apply the editor labels and layout. New seed records already use section components.

## Connection behavior

`STRAPI_URL` and `STRAPI_API_TOKEN` are server-only; they must never use a `NEXT_PUBLIC_` prefix. Anonymous Content API access and token write access remain disabled. Images are public media URLs served by Strapi.

With `STRAPI_URL` unset, the site uses its original local content for standalone development. Once configured, CMS errors are reported instead of silently restoring local content, so unpublished content cannot reappear from a fallback. Both servers must be running for the connected site.

The local connection uses `127.0.0.1`; accessing the website from another device requires configuring an address that device can reach for CMS media and changing Strapi's bind address.

## Local data and backup

- Database: `cms/.tmp/data.db`
- Uploaded media: `cms/public/uploads/`
- CMS secrets: `cms/.env`
- Frontend connection: `.env.local`

These files are ignored by version control. Stop the CMS before backing up SQLite, and retain uploaded media alongside the database. Deleting the database removes local content and administrator accounts. `node scripts/setup-cms-env.mjs` creates missing secrets without replacing an existing file.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run cms:build
node cms/node_modules/typescript/bin/tsc --noEmit -p cms/tsconfig.json
node cms/node_modules/typescript/bin/tsc --noEmit -p cms/src/admin/tsconfig.json
```

For publishing integration checks, leave Next.js running and stop Strapi first:

```sh
npm run cms:check
```

The check starts its own local Strapi instance, creates temporary records, verifies read-only access, drafts, publishing, updates, unpublishing, article routes, media, tariffs, and all 10 locale requests, then removes its temporary records and stops the instance. Use `CMS_CHECK_SITE_URL` if Next.js runs on another port. Restart `npm run cms:dev` afterward.

After adding content models, run `npm --prefix cms run strapi -- ts:generate-types` before the CMS TypeScript check. The frontend's checks exclude `cms/`, which has its own dependencies and compiler configuration.

## Admin appearance

`cms/src/admin/app.tsx` configures WB Taxi logos, light/dark theme colors, and login wording. `cms/src/admin/styles.css` loads the site's WB Sans font and styles the authentication screen. Logo and font assets are bundled from `cms/src/admin/assets/`; the CMS does not need the frontend running for its branding.

Custom styling uses Strapi's theme tokens and stable HTML selectors. Rebuild with `npm run cms:build` for production; the development server reloads admin changes automatically. Logos uploaded in Strapi's project settings take precedence over configured logos.

## Custom live preview

Our own preview panel works with the local Community CMS. Open a Site page, News story, or Tariff document, save it, and choose **Live preview → Open live preview** in the editor sidebar. The preview opens in a compact horizontal floating window and keeps the editor at full width. Desktop and Mobile switch the website viewport; Expand opens a larger view and Compact restores the small window. Close ends the private preview session.

The preview refreshes after **Save**, without publishing. New entries must be saved once and have the content required by the website, including news images. Unsaved keystrokes are not sent to the preview. Close or Exit preview clears the private preview session.

For a fresh setup:

```sh
npm run cms:preview:setup
```

Restart both servers afterward. The command configures `CLIENT_URL` in `cms/.env` and a shared `CMS_PREVIEW_SECRET` in `cms/.env` and `.env.local`, preserving existing connection settings. Neither value needs a `NEXT_PUBLIC_` prefix. Keep the secret private. `CLIENT_URL` defaults to `http://localhost:3000`; loopback hostnames follow the CMS host so local iframe cookies work. For hosted deployments, set the public frontend origin and `CMS_PREVIEW_ORIGIN` to the public CMS origin if it differs from `STRAPI_URL`.

Preview sessions require an authenticated administrator with full read access to the selected entry, expire after 30 minutes, and preview only that entry's draft. Other content stays published. Normal visitors have no preview cookie and continue to see published content. Preview responses use private/no-store requests and noindex metadata. This is a custom saved-draft viewer, separate from Strapi's paid in-place editing feature.

`npm run cms:check` also tests authenticated preview issuance, rejected anonymous access, scoped draft isolation, expired/tampered links, exit, and previews for all three content types. It uses a temporary admin session and revokes it afterward. Optionally set `CMS_CHECK_BROWSER` to an installed Chromium executable to check the editor panel, automatic refresh, mobile/desktop controls and close behavior in a browser.

Cookie notice text is edited in its **Message** rich-text field. Select a word or phrase and use the link toolbar button to set its URL. The former before/after fragments are migrated into a single paragraph, retaining the existing cookie-policy link.

### Editing content

News has three content types: **Card only** (title, description and image),
**Full article** (adds the article editor), and **Card with link** (adds a destination).
Switching types keeps existing text. Full articles and linked cards can be saved
as incomplete drafts, but publishing requires article text or a link respectively.
Internal story IDs are generated automatically. Country, language, type and date
are available in the news list; page and tariff lists omit technical IDs.

FAQ answers use one rich-text field with inline links. Tariff sections have optional
standalone text for conditions and optional named tariff entries. Existing separate
FAQ fields and original components are retained for recovery.

The one-time local SQLite migration is `node scripts/simplify-cms-content.mjs`.
It creates a database backup, preserves drafts and published versions, skips existing
rich-text answers, and records completion in `cms/.tmp/content-maintenance-v1.json`.
Do not remove that marker and rerun it on edited content: the initial news-type
classification is intended only for the original records.

### Shared settings and editing guidance

**Shared settings** contains one draft/published record per interface language. It
owns navigation labels, footer/legal labels, the cookie notice, accessibility copy,
and optional download/legal destination URLs. Six records were seeded from the
existing pages. Use **Shared settings** for language-wide edits, then publish.
Each site page links to the corresponding language record. Page fields that differ
from the initial common values remain country-specific overrides; common fields
inherit later shared changes. Existing country differences and independent drafts
were retained. New pages automatically use their language's published shared settings; you can also select a matching record explicitly.

`node scripts/seed-shared-settings.mjs` is an offline, repeatable local migration.
It backs up SQLite, creates missing shared language records, links pages without
an existing relationship, and fills missing complete cashback/download-count text.
It does not replace an existing relationship or a nonempty complete text field.
Keep `sharedBaseline` internal; it records which existing wording was common when
the page was linked, so subsequent shared edits preserve local overrides.

The **Content checks** sidebar inspects the last saved draft. It reports missing
published translations, malformed/unsafe URLs, unknown site paths/anchors, missing
article text or link destinations, image descriptions, small source images and
unconfigured legal links. External URL availability is not probed. Legal links
are intentionally empty until real destinations are supplied; the website displays
those labels as text until configured. Store URLs start with the existing defaults.

Image guidance: hero sources should be at least 2880px wide (approximately 2880 ×
1620 for the current artwork); news images at least 928 × 626px; article images at
least 1352px wide. These are guidance, not upload restrictions. Next.js chooses
responsive output sizes from the original high-resolution source.

Use **Preview block** beside a page block, or the section selector inside preview,
to jump to that block. Preview continues to use saved drafts. Shared-setting drafts
can also be previewed from their editor; publishing applies them to linked pages.
Draft tokens remain signed, scoped, private, and time-limited.

The cashback badge and download count now each have one complete text field.
Their original split fields are retained internally for recovery.

Validation: `node --import tsx scripts/check-shared-settings.mjs` checks inheritance,
country overrides and rich-text equality; `npm run cms:check` covers the protected
checks endpoint, shared-preview draft isolation and duplicate-language protection.
The optional Chromium check also exercises the preview section picker.
