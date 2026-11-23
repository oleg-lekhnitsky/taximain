import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, writeFile, stat } from "node:fs/promises";
import net from "node:net";
import { localSiteContent } from "../src/lib/cms/local.ts";
import { toPageSections } from "../src/lib/cms/sections.ts";
import { supportArticleBody } from "../src/lib/cms/article.ts";
import { supportArticleFields } from "../src/lib/cms/types.ts";
import { buildTariffDocument } from "../src/lib/tariffs/parse.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const cmsDir = path.join(root, "cms");
const requireCms = createRequire(path.join(cmsDir, "package.json"));
process.env.STRAPI_TELEMETRY_DISABLED = "true";

// Only seed an offline local SQLite database; never compete with the dev server.
const env = await readFile(path.join(cmsDir, ".env"), "utf8");
const dotenv = requireCms("dotenv");
const cmsEnv = dotenv.parse(env);
if (
  (process.env.DATABASE_CLIENT || cmsEnv.DATABASE_CLIENT || "sqlite") !==
  "sqlite"
) {
  throw new Error("This seed command is for the local SQLite CMS only.");
}
const port = Number(process.env.PORT || cmsEnv.PORT || 1337);
const listening = await new Promise((resolve, reject) => {
  const socket = net.connect({ host: "127.0.0.1", port });
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", (error) =>
    error.code === "ECONNREFUSED" ? resolve(false) : reject(error),
  );
});
if (listening)
  throw new Error(
    `Stop the CMS on port ${port} before running npm run cms:seed.`,
  );

process.chdir(cmsDir);
const { compileStrapi, createStrapi } = requireCms("@strapi/strapi");
const app = createStrapi(await compileStrapi({ appDir: cmsDir }));
const counts = { pages: 0, news: 0, tariffs: 0, media: 0 };
try {
  await app.load();
  const mediaCache = new Map();
  async function media(asset, alt = "") {
    if (mediaCache.has(asset)) return mediaCache.get(asset);
    const name = `taxi-seed-${asset.replace(/^\//, "").replaceAll("/", "_")}`;
    let file = await app.db
      .query("plugin::upload.file")
      .findOne({ where: { name } });
    if (!file) {
      const filepath = path.join(root, "public", asset);
      const info = await stat(filepath);
      const extension = path.extname(asset).toLowerCase();
      const mimetype = {
        ".png": "image/png",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
      }[extension];
      if (!mimetype) throw new Error(`Unsupported seed image: ${asset}`);
      [file] = await app
        .plugin("upload")
        .service("upload")
        .upload({
          data: {
            fileInfo: {
              name,
              alternativeText: alt,
              caption: `Original site asset: ${asset}`,
            },
          },
          files: {
            filepath,
            originalFilename: path.basename(asset),
            mimetype,
            size: info.size,
          },
        });
      counts.media++;
    }
    mediaCache.set(asset, file.id);
    return file.id;
  }
  async function addMissing(uid, filters, data, counter) {
    const existing = await app
      .documents(uid)
      .findFirst({ filters, status: "draft" });
    if (existing) return;
    await app.documents(uid).create({ data, status: "published" });
    counts[counter]++;
  }

  for (const [key, content] of Object.entries(localSiteContent())) {
    const [country, language] = key.split(":");
    const pageUid = "api::site-page.site-page";
    const pageExists = await app
      .documents(pageUid)
      .findFirst({ filters: { country, language }, status: "draft" });
    if (!pageExists) {
      await addMissing(
        pageUid,
        { country, language },
        {
          country,
          language,
          ...toPageSections({
            ...content,
            cities: content.cities.map((name) => ({ name })),
            heroImage: await media(content.heroImage),
            heroImageRetina: await media(content.heroImageRetina),
          }),
        },
        "pages",
      );
    }
    for (const [order, story] of content.news.entries()) {
      const uid = "api::news-story.news-story";
      const filters = { country, language, storyId: story.id };
      if (await app.documents(uid).findFirst({ filters, status: "draft" }))
        continue;
      await addMissing(
        uid,
        filters,
        {
          country,
          language,
          storyId: story.id,
          contentKind: story.article ? "article" : story.href ? "link" : "card",
          slug: `${story.id}-${country}-${language}`,
          title: story.title,
          description: story.description,
          imageAlt: story.alt,
          image: await media(story.image, story.alt),
          date: story.dateTime,
          order,
          href: story.href || null,
          ...(story.article
            ? {
                body: supportArticleBody(story.article, country, language),
                supportArticle: Object.fromEntries(
                  supportArticleFields.map((field, i) => [
                    field,
                    story.article[i],
                  ]),
                ),
              }
            : {}),
        },
        "news",
      );
    }
  }
  for (const [language, filename] of [
    ["ru", "uz.json"],
    ["uz", "uz-uz.json"],
  ]) {
    const source = JSON.parse(
      await readFile(path.join(root, "src/data/tariffs", filename), "utf8"),
    );
    const document = buildTariffDocument("uz", source.rows);
    await addMissing(
      "api::tariff-document.tariff-document",
      { country: "uz", language },
      {
        country: "uz",
        language,
        heading: document.heading,
        sections: document.sections.map((section) => ({
          sectionId: section.id,
          title: section.title,
          entries: section.entries,
        })),
      },
      "tariffs",
    );
  }

  const tokens = app.service("admin::api-token-content-api");
  const tokenName = "WB Taxi local frontend";
  let token = await tokens.getByName(tokenName, { includeDecryptedKey: true });
  if (!token)
    token = await tokens.create({
      name: tokenName,
      description:
        "Server-side published-content reads for the local Next.js site",
      type: "read-only",
      lifespan: null,
    });
  if (token.type !== "read-only" || !token.accessKey)
    throw new Error(
      "Existing frontend token must be read-only and decryptable. Review it in Strapi settings.",
    );
  const frontendEnvPath = path.join(root, ".env.local");
  let frontendEnv = await readFile(frontendEnvPath, "utf8").catch((error) => {
    if (error.code === "ENOENT") return "";
    throw error;
  });
  for (const [key, value] of [
    ["STRAPI_URL", `http://127.0.0.1:${port}`],
    ["STRAPI_API_TOKEN", token.accessKey],
  ]) {
    const line = `${key}=${value}`;
    const match = new RegExp(`^${key}=.*$`, "m");
    frontendEnv = match.test(frontendEnv)
      ? frontendEnv.replace(match, line)
      : `${frontendEnv.trimEnd()}\n${line}\n`;
  }
  await writeFile(frontendEnvPath, frontendEnv, { mode: 0o600 });
  console.log(
    `Seed complete: ${counts.pages} site pages, ${counts.news} news stories, ${counts.tariffs} tariff documents, ${counts.media} images added.`,
  );
  console.log(
    "Existing content was preserved. Frontend read-only connection saved to .env.local (token not printed).",
  );
} finally {
  await app.destroy();
}
