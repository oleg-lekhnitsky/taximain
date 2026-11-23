# Tariff content

The `/tariffs` page shares the site's country/language selection and uses the site's header, footer, typography and FAQ accordions.

`uz.json` contains the initial import of the supplied Uzbekistan sheet, including all nine tariffs for Tashkent, Samarkand and Bukhara and the general conditions. It records the source and import date. Prices, currencies and conditions have not been rewritten. There is no live Google Sheets connection.

## CMS integration

`src/lib/tariffs/load.ts` is the server-side CMS integration boundary. When `STRAPI_URL` is configured, it reads published tariff documents and ordered sections/entries from local Strapi. Otherwise it supplies the original Uzbekistan imports. Countries without published documents retain the empty state.

Use the `TariffDocument` type as the view model: country, source language, heading, ordered city/conditions sections, and ordered tariff entries with title and body. CMS records should retain a stable section ID and support country, language, draft/published status and ordering. Query only published records in the production loader. Strapi is connected through the server-only CMS client. `npm run cms:seed` imports the original Russian and Uzbek documents without overwriting existing CMS records.

`uz-uz.json` contains the supplied Uzbek translation of the same nine tariffs and general conditions. Uzbek selection uses that document with `lang="uz"`; Russian uses `uz.json` with `lang="ru"`. Each import retains its own source URL and date. The page title, country name, navigation and empty states follow the selected site language. CMS documents supply localized tariff conditions in the same way.

The CSV parser remains available for one-time imports of the draft's `heading`, `meta`, `subheading`, `body` format. A `meta` value starts a new section; following rows with an empty `meta` continue it. Quoted multiline cells and escaped quotes are supported, and empty rows are ignored. Tariff text is rendered as plain paragraphs and safe web links.
