# WB Taxi

Next.js App Router migration of the local compensation page, with React, TypeScript, and SCSS.

```sh
nvm use
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `src/app/page.tsx`: page composition and server-rendered content.
- `src/components/taxi/`: header, hero, features carousel, city coverage, cashback, download banner, news, FAQs, footer, and cookie notice.
- `src/styles/taxi/`: shared SCSS, original site base styles and component SCSS modules. No Tailwind utilities or build dependency.
- `public/assets/`: local WB Sans and Google Sans fonts, logo variants, interface icons, and website images.
- `src/app/news/support/`: localized news article.
- `src/app/tariffs/`: shared country tariff page. The imported seed data and CMS loader are documented in `src/data/tariffs/README.md`.

The original compensation form, exclusions, illustrations, and floating CTA have been removed.

The source FAQ placeholder answers and unavailable legal links are retained as supplied. Cookie notice dismissal is stored locally. Mobile navigation, carousel dragging/keyboard controls, FAQ transitions, and reduced-motion support are preserved.

Webpack is selected for development and production because this environment restricts the ports required by Turbopack's Sass worker.

```sh
npm run lint
npm run build
npm start
```

## Logo

`src/components/Logo/Logo.tsx` uses the three original SVG exports from Figma section `203:3687`:

- `variant="light"` (default): pink WB badge with black taxi text (`203:3673`).
- `variant="dark"`: pink WB badge with white taxi text (`203:3667`).
- `variant="monochrome"`: white badge and text (`203:3679`).

```tsx
import Logo from "@/components/Logo/Logo";

<Logo variant="dark" height={48} />;
```

The header switches logo variants for the transparent and solid header states. Width follows the original artwork's aspect ratio. Responsive callers can set `--logo-height` in a class passed through `className`; an explicit `height` prop overrides it.

## Country versions

`src/components/CountrySwitcher/CountrySwitcher.tsx` uses UI SDK's popover, listbox, and segmented control for country and language selection. It is available in both desktop and mobile headers.

Country configuration is centralized in `src/lib/countries.ts`. Belarus is the default. The five supported codes are `uz`, `kg`, `am`, `ge`, and `by`.

Copy `.env.example` to `.env.local` and replace the reserved `.example` domains with real HTTPS origins when available. Rebuild after changing public environment variables. All domains serve this same app; the incoming hostname selects the initial country on the server. Country-specific components can read `useCountry()` inside `CountryProvider`.

With placeholder domains, the selector changes `?country=kg` (etc.) within the current app and remembers the choice in browser storage. Language selection uses `lang` in the URL and a saved preference per country. Once a real domain is configured, selecting that country navigates to its domain. Copy is localized in `src/lib/copy.ts`; news and city lists vary by country. Country, language, and internal page navigation use shared fade transitions. Reduced-motion preferences disable the page transition.

Additional country flags come from flag-icons; its license is included in `public/assets/countries/LICENSE.flag-icons`.

The header's localized partner link points to the selected country's B2B website and passes the country and language in its URL. Configure the five `NEXT_PUBLIC_PARTNERS_*_URL` values in `.env.local` when those websites are ready; the defaults are reserved `.example` placeholders.

## Share preview

Open Graph includes a six-second MP4 of the existing car with rotating wheels on a six-cell magenta/violet checkerboard, plus a JPEG fallback for image previews. Both are in `public/assets/social/`. Regenerate them with `node scripts/generate-og-video.mjs` (requires ffmpeg). Media URLs use the request hostname for each country domain; optional `SITE_URL` overrides the origin. Video playback depends on the sharing platform.

## Local content management

Strapi 5 in `cms/` supplies published page copy, FAQs, city lists, hero images, cashback rates, news/support articles, and tariffs. Run `npm run cms:dev` for http://127.0.0.1:1337/admin alongside `npm run dev` for the website. Publish in Strapi and refresh the website to see changes.

`npm run cms:seed` imports current content and images without overwriting existing CMS records, and configures the server-only connection in `.env.local`. Stop the CMS before seeding. See [the CMS guide](cms/README.md) for setup, editing, backups, and publishing checks. With `STRAPI_URL` unset, the site uses its original local content.

# taximain

## Railway

The website and CMS run as separate services backed by PostgreSQL and persistent
uploads. See [.railway/README.md](.railway/README.md) for the infrastructure setup.
Push code changes to `main` to deploy; edit published content in the deployed CMS.
Local credentials, databases, uploads and migration archives are excluded from Git.
