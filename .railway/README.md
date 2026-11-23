# Railway deployment

`railway.ts` defines the `taximain` project: a Next.js `web` service, a Strapi `cms`
service, PostgreSQL, and a persistent upload volume mounted at `/app/public/uploads`.
Both app services deploy the `main` branch of `oleg-lekhnitsky/taximain`.
The CMS uses `/cms` as its repository root; the website uses the repository root.

The website Docker image uses Next.js standalone output. `STRAPI_URL` and
`CMS_PREVIEW_ORIGIN` are public build arguments so the image allowlist and preview
frame policy match production. API tokens and preview secrets are runtime-only.

Initial secrets are loaded from the ignored `.deployment/railway-secrets.json`.
On another machine without that file, `preserve()` keeps values already stored in
Railway. Do not commit that file, CMS databases, content exports, or `.env` files.

Review infrastructure changes with `railway config plan`; apply with
`railway config apply`. Normal content edits happen in the deployed Strapi admin
and persist in PostgreSQL and the uploads volume. Git pushes update code and do
not reseed or overwrite content.

Optional deployment bootstrap variables provision a read-only frontend token and
preserve the initial local CMS administrator's password hash. Existing accounts
are never replaced. The temporary migration transfer token uses Strapi’s shortest supported expiry (seven days);
remove `MIGRATION_TRANSFER_TOKEN` after importing the initial content. On the next startup, the token is revoked automatically.
