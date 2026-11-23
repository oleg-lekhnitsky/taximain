import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import net from "node:net";
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(new URL("../cms/package.json", import.meta.url));
const cmsDir = `${root}cms`;
const env = require("dotenv").parse(await readFile(`${cmsDir}/.env`, "utf8"));
const listening = await new Promise(resolve => { const socket = net.connect({ host: "127.0.0.1", port: Number(env.PORT || 1337) }); socket.once("connect", () => { socket.destroy(); resolve(true); }); socket.once("error", () => resolve(false)); });
if (listening) throw Error("Stop the CMS before migrating shared settings.");
const db = new (require("better-sqlite3"))(`${cmsDir}/.tmp/data.db`);
await db.backup(`${cmsDir}/.tmp/before-shared-settings-${Date.now()}.db`); db.close();
process.chdir(cmsDir);process.env.STRAPI_TELEMETRY_DISABLED = "true";
const { createStrapi, compileStrapi } = require("@strapi/strapi");
const app = createStrapi(await compileStrapi({ appDir: cmsDir }));
const clean = value => Array.isArray(value) ? value.map(clean) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).filter(([key]) => !["id", "documentId", "createdAt", "updatedAt", "publishedAt"].includes(key)).map(([key,item]) => [key,clean(item)])) : value;
try {
 await app.load();
 const pages = await app.db.query("api::site-page.site-page").findMany({ populate: ["headerSection", "footerSection", "cookieSection", "featuresSection", "downloadSection", "sharedSettings"] });
 const languages = [...new Set(pages.map(page => page.language))];
 let linked = 0;
 for (const language of languages) {
  const candidates = pages.filter(page => page.language === language).sort((a,b) => Number(!!b.publishedAt)-Number(!!a.publishedAt) || String(a.country).localeCompare(String(b.country)));
  const source = candidates[0];
  let settings = await app.documents("api::shared-setting.shared-setting").findFirst({ filters: { language }, status: "published", populate: ["header", "footer", "cookie", "accessibility", "links"] });
  if (!settings) {
   const accessibility = {};
   for (const key of ["carouselLabel", "carouselPositionLabel", "previousSlideLabel", "nextSlideLabel"]) accessibility[key] = source.featuresSection[key];
   for (const key of ["qrImageDescription", "googlePlayLabel", "appStoreLabel"]) accessibility[key] = source.downloadSection[key];
   settings = await app.documents("api::shared-setting.shared-setting").create({ status: "published", data: {
    language, header: clean(source.headerSection), footer: clean(source.footerSection), cookie: clean(source.cookieSection), accessibility,
    links: { googlePlayUrl: "https://play.google.com/store/apps/details?id=uz.wildberries.taxi.client", appStoreUrl: "https://apps.apple.com/app/id6755240054" },
   }, populate: ["header", "footer", "cookie", "accessibility", "links"] });
  }
  const baseline = clean({ header: settings.header, footer: settings.footer, cookie: settings.cookie, accessibility: settings.accessibility });
  for (const page of candidates) {
   if (page.sharedSettings || page.sharedBaseline) continue;
   await app.db.query("api::site-page.site-page").update({ where: { id: page.id }, data: { sharedSettings: settings.id, sharedBaseline: baseline } });
   linked++;
  }
 }
 const cashbacks = await app.db.connection("components_page_cashback_sections").select("*");
 for (const row of cashbacks) {
  const update = {};
  if (!row.rate_text) update.rate_text = (row.rate_prefix_after ? [row.rate, row.rate_prefix] : [row.rate_prefix, row.rate]).filter(Boolean).join(" ");
  if (!row.downloads_text) update.downloads_text = [row.downloads_value, row.downloads_label].filter(Boolean).join(" ");
  if (Object.keys(update).length) await app.db.connection("components_page_cashback_sections").where({ id: row.id }).update(update);
 }
 console.log(`Shared settings: ${languages.length} languages; ${linked} draft/published pages linked. Local variations and draft states preserved.`);
} finally { await app.destroy(); }
