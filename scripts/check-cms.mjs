import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import path from "node:path";
import net from "node:net";

const root = fileURLToPath(new URL("../", import.meta.url));
const cmsDir = path.join(root, "cms");
const requireCms = createRequire(path.join(cmsDir, "package.json"));
const dotenv = requireCms("dotenv");
const connection = dotenv.parse(
  await readFile(path.join(root, ".env.local"), "utf8"),
);
const cmsUrl = new URL(connection.STRAPI_URL);
assert(
  ["localhost", "127.0.0.1"].includes(cmsUrl.hostname),
  "Checks require a local CMS",
);
const cmsEnv = dotenv.parse(await readFile(path.join(cmsDir, ".env"), "utf8"));
assert.equal(
  process.env.DATABASE_CLIENT || cmsEnv.DATABASE_CLIENT || "sqlite",
  "sqlite",
);
const port = Number(cmsUrl.port || 1337);
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
assert(
  !listening,
  "Stop the CMS before running this check; the check starts its own instance.",
);
const siteUrl = process.env.CMS_CHECK_SITE_URL || "http://127.0.0.1:3000";
process.env.STRAPI_TELEMETRY_DISABLED = "true";
process.chdir(cmsDir);
const { compileStrapi, createStrapi } = requireCms("@strapi/strapi");
const app = createStrapi(await compileStrapi({ appDir: cmsDir }));
const created = [];
const previewSessions = [];
let adminAuthorization;
let sharedRestore;
const marker = `cms-check-${Date.now()}`;
async function api(collection, params = {}) {
  const url = new URL(`/api/${collection}`, cmsUrl);
  url.search = new URLSearchParams({
    status: "published",
    ...params,
  }).toString();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${connection.STRAPI_API_TOKEN}` },
  });
  assert.equal(response.status, 200);
  return (await response.json()).data;
}
async function page(route, status = 200) {
  const response = await fetch(new URL(route, siteUrl), { cache: "no-store" });
  const text = await response.text();
  assert.equal(
    response.status,
    status,
    `Unexpected status for ${route}: ${response.status}`,
  );
  assert(
    !text.includes(connection.STRAPI_API_TOKEN),
    "API token leaked into frontend response",
  );
  return text;
}
try {
  await app.start();
  const supportedLanguages = { uz: ["ru", "uz"], kg: ["ru", "ky"], am: ["hy", "ru"], ge: ["ka", "ru"], by: ["ru", "be"] };
  for (const uid of ["api::site-page.site-page", "api::news-story.news-story", "api::tariff-document.tariff-document"]) {
    const records = await app.documents(uid).findMany({ status: "draft", limit: 1000 });
    for (const record of records) {
      assert(supportedLanguages[record.country]?.includes(record.language), `Unsupported language in ${uid}`);
    }
    for (const country of Object.keys(supportedLanguages)) {
      const language = Object.keys({ ru: 1, uz: 1, ky: 1, hy: 1, ka: 1, be: 1 }).find(value => !supportedLanguages[country].includes(value));
      await assert.rejects(app.documents(uid).create({ data: { country, language } }), /language supported in the selected country/);
    }
  }
  console.log("Country-language validation passed for all three content types; existing drafts use supported languages.");
  const sectionOrder = [
    "headerSection",
    "heroSection",
    "featuresSection",
    "citiesSection",
    "cashbackSection",
    "downloadSection",
    "faqSection",
    "newsSection",
    "footerSection",
    "cookieSection",
  ];
  const editor = await app
    .plugin("content-manager")
    .service("content-types")
    .findConfiguration(app.contentTypes["api::site-page.site-page"]);
  assert.deepEqual(
    editor.layouts.edit.flat().map((field) => field.name),
    ["country", "language", "sharedSettings", ...sectionOrder],
  );
  for (const name of sectionOrder) {
    const componentUid =
      app.contentTypes["api::site-page.site-page"].attributes[name].component;
    assert(
      !Object.values(app.components[componentUid].attributes).some(
        (field) => field.type === "json",
      ),
      `Raw JSON in editor section ${name}`,
    );
  }
  assert.equal((await fetch(new URL("/api/site-pages", cmsUrl))).status, 403);
  assert.equal(
    (
      await fetch(new URL("/api/news-stories", cmsUrl), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${connection.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: {} }),
      })
    ).status,
    403,
  );
  const pages = await api("site-pages", { "pagination[pageSize]": "100" });
  assert.equal(pages.length, 10);
  assert.equal(
    new Set(pages.map((page) => `${page.country}:${page.language}`)).size,
    10,
  );
  const [belarus] = await api("site-pages", {
    "filters[country][$eq]": "by",
    "filters[language][$eq]": "ru",
    "populate[heroSection]": "true",
  });
  const home = await page("/?country=by&lang=ru");
  assert(
    home.includes(belarus.heroSection.heading),
    "CMS hero text is missing from the page",
  );
  const image = await app.db
    .query("plugin::upload.file")
    .findOne({ where: { mime: "image/png" } });
  assert(image);
  assert.equal((await fetch(new URL(image.url, cmsUrl))).status, 200);
  const uid = "api::news-story.news-story";
  const story = await app.documents(uid).create({
    status: "draft",
    data: {
      country: "by",
      language: "ru",
      storyId: marker,
      slug: marker,
      title: `${marker}-original`,
      date: "2026-11-23",
      order: 999,
      layout: "support",
      image: image.id,
      body: [
        {
          type: "paragraph",
          children: [{ type: "text", text: `${marker}-body` }],
        },
      ],
    },
  });
  created.push([uid, story.documentId]);
  assert.equal(story.contentKind, "article");
  const incomplete = await app.documents(uid).create({ data: {
    country: "by", language: "ru", title: marker + "-incomplete", slug: marker + "-incomplete", date: "2026-11-23", contentKind: "article",
  } });
  created.push([uid, incomplete.documentId]);
  assert(incomplete.storyId, "Internal story ID should be generated automatically");
  await assert.rejects(app.documents(uid).publish({ documentId: incomplete.documentId }), /Add article text/);
  await app.documents(uid).update({ documentId: incomplete.documentId, data: { contentKind: "link" } });
  await assert.rejects(app.documents(uid).publish({ documentId: incomplete.documentId }), /Add a link/);

  // Use an isolated, short-lived admin session; do not change real credentials.
  const admin = await app.db
    .query("admin::user")
    .findOne({ where: { isActive: true }, populate: ["roles"] });
  assert(admin, "Create a local administrator before running preview checks");
  const sessionManager = app.sessionManager("admin");
  const adminSession = await sessionManager.generateRefreshToken(
    String(admin.id),
    marker,
    { type: "session" },
  );
  previewSessions.push([String(admin.id), adminSession.sessionId]);
  const adminAccess = await sessionManager.generateAccessToken(
    adminSession.token,
  );
  assert(!("error" in adminAccess));
  adminAuthorization = `Bearer ${adminAccess.token}`;
  const issuePreview = async (model, documentId) => {
    const issued = await fetch(new URL("/wb-preview/session", cmsUrl), {
      method: "POST",
      headers: {
        Authorization: adminAuthorization,
        "Content-Type": "application/json",
        Origin: cmsUrl.origin,
      },
      body: JSON.stringify({ model, documentId }),
    });
    const reply = await issued.json();
    assert.equal(
      issued.status,
      200,
      `Preview authorization failed: ${JSON.stringify(reply.error)}`,
    );
    const entry = await fetch(reply.url, { redirect: "manual" });
    assert.equal(entry.status, 307);
    const cookie = entry.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    assert(cookie.includes("HttpOnly") === false); // Request cookie contains only names/values.
    assert(
      entry.headers.getSetCookie().some((value) => /HttpOnly/i.test(value)),
    );
    return {
      url: entry.headers.get("location"),
      cookie,
      token: new URL(reply.url).searchParams.get("token"),
    };
  };
  const deniedPreview = await fetch(new URL("/wb-preview/session", cmsUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: uid, documentId: story.documentId }),
  });
  assert([401, 403].includes(deniedPreview.status));
  const checkRequest = (model, documentId, authorized = true) => fetch(new URL("/wb-content/checks", cmsUrl), { method: "POST", headers: { "Content-Type": "application/json", ...(authorized ? { Authorization: adminAuthorization } : {}) }, body: JSON.stringify({ model, documentId }) });
  assert([401, 403].includes((await checkRequest(uid, incomplete.documentId, false)).status));
  const checks = await checkRequest(uid, incomplete.documentId);
  assert.equal(checks.status, 200);
  const warnings = (await checks.json()).warnings;
  assert(warnings.some(warning => warning.code === "link-required"));
  assert(warnings.some(warning => warning.code === "translation"));
  const sharedUid = "api::shared-setting.shared-setting";
  const shared = await app.documents(sharedUid).findFirst({ filters: { language: "ru" }, status: "published" });
  assert(shared, "Seed shared settings before running checks");
  await assert.rejects(app.documents(sharedUid).create({ data: { language: "ru" } }), /already exist/);
  const sharedDraft = await app.documents(sharedUid).findOne({ documentId: shared.documentId, status: "draft", populate: ["header"] });
  const headerData = { ...sharedDraft.header };
  delete headerData.id;
  sharedRestore = { documentId: shared.documentId, header: headerData };
  await app.documents(sharedUid).update({ documentId: shared.documentId, data: { header: { ...headerData, navigationLabel: `${marker}-shared-navigation` } } });
  const sharedPreview = await issuePreview(sharedUid, shared.documentId);
  const sharedResponse = await fetch(sharedPreview.url, { headers: { Cookie: sharedPreview.cookie } });
  assert.equal(sharedResponse.status, 200);
  assert((await sharedResponse.text()).includes(`${marker}-shared-navigation`), "Shared-setting draft is missing from its scoped preview");
  assert(!(await page("/?country=by&lang=ru")).includes(`${marker}-shared-navigation`), "Shared draft leaked to the public website");
  await app.documents(sharedUid).update({ documentId: shared.documentId, data: { header: headerData } });
  sharedRestore = undefined;
  const draftPreview = await issuePreview(uid, story.documentId);
  if (process.env.CMS_CHECK_BROWSER) {
    const { checkCmsBrowser } = await import("./check-cms-browser.mjs");
    try {
      await checkCmsBrowser({
        executable: process.env.CMS_CHECK_BROWSER,
        cmsUrl: cmsUrl.href,
        model: uid,
        documentId: story.documentId,
        accessToken: adminAccess.token,
        sitePageId: belarus.documentId,
        marker,
        onSave: () =>
          app
            .documents(uid)
            .update({
              documentId: story.documentId,
              status: "draft",
              data: { title: `${marker}-preview-save` },
            }),
      });
    } finally {
      await app
        .documents(uid)
        .update({
          documentId: story.documentId,
          status: "draft",
          data: { title: `${marker}-original` },
        });
    }
  }
  const previewResponse = await fetch(draftPreview.url, {
    headers: { Cookie: draftPreview.cookie },
  });
  assert.equal(previewResponse.status, 200);
  const previewHtml = await previewResponse.text();
  assert(
    previewHtml.includes(`${marker}-original`),
    "Draft missing from preview",
  );
  assert(previewHtml.includes("Draft preview"));
  assert(!previewHtml.includes(connection.STRAPI_API_TOKEN));
  assert(!previewHtml.includes(connection.CMS_PREVIEW_SECRET));
  assert(
    !(await page("/?country=by&lang=ru")).includes(marker),
    "Preview draft leaked to normal visitors",
  );
  const unrelated = await app.documents(uid).create({
    status: "draft",
    data: {
      country: "by",
      language: "ru",
      storyId: `${marker}-other`,
      slug: `${marker}-other`,
      title: `${marker}-unrelated`,
      date: "2026-11-23",
      image: image.id,
      layout: "support",
      order: 1000,
    },
  });
  created.push([uid, unrelated.documentId]);
  const scoped = await fetch(
    new URL("/?country=by&lang=ru", draftPreview.url),
    { headers: { Cookie: draftPreview.cookie } },
  );
  const scopedHtml = await scoped.text();
  assert(scopedHtml.includes(`${marker}-original`));
  assert(
    !scopedHtml.includes(`${marker}-unrelated`),
    "Unrelated draft leaked into scoped preview",
  );
  const revision = await fetch(
    new URL("/api/cms-preview/status", draftPreview.url),
    { headers: { Cookie: draftPreview.cookie } },
  );
  assert.equal(revision.status, 200);
  assert((await revision.json()).updatedAt);
  assert.equal(
    (await fetch(new URL("/api/cms-preview/status", draftPreview.url))).status,
    401,
  );
  const invalid = new URL("/api/cms-preview", draftPreview.url);
  invalid.searchParams.set("token", `x${draftPreview.token.slice(1)}`);
  assert.equal((await fetch(invalid, { redirect: "manual" })).status, 401);
  const sign = (payload) => {
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${data}.${createHmac("sha256", connection.CMS_PREVIEW_SECRET).update(data).digest("base64url")}`;
  };
  const context = JSON.parse(
    Buffer.from(draftPreview.token.split(".")[0], "base64url").toString(),
  );
  invalid.searchParams.set(
    "token",
    sign({ ...context, expiresAt: Date.now() - 1000 }),
  );
  assert.equal((await fetch(invalid, { redirect: "manual" })).status, 401);
  invalid.searchParams.set(
    "token",
    sign({ ...context, pathname: "https://example.com/" }),
  );
  assert.equal((await fetch(invalid, { redirect: "manual" })).status, 401);
  const exited = await fetch(
    new URL("/api/cms-preview/exit", draftPreview.url),
    { headers: { Cookie: draftPreview.cookie }, redirect: "manual" },
  );
  assert.equal(exited.status, 307);
  assert(
    exited.headers
      .getSetCookie()
      .some((value) => value.startsWith("wb_cms_preview=;")),
  );
  const sitePreview = await issuePreview(
    "api::site-page.site-page",
    belarus.documentId,
  );
  assert.equal(
    (await fetch(sitePreview.url, { headers: { Cookie: sitePreview.cookie } }))
      .status,
    200,
  );
  const filters = { "filters[storyId][$eq]": marker };
  assert.equal((await api("news-stories", filters)).length, 0);
  assert(!(await page("/?country=by&lang=ru")).includes(marker));
  await app.documents(uid).publish({ documentId: story.documentId });
  assert((await page("/?country=by&lang=ru")).includes(`${marker}-original`));
  assert(
    (await page(`/news/${marker}?country=by&lang=ru`)).includes(
      `${marker}-body`,
    ),
  );
  await app.documents(uid).update({
    documentId: story.documentId,
    status: "draft",
    data: { title: `${marker}-draft-revision` },
  });
  assert.equal(
    (await api("news-stories", filters))[0].title,
    `${marker}-original`,
  );
  assert(
    !(await page("/?country=by&lang=ru")).includes(`${marker}-draft-revision`),
  );
  await app.documents(uid).publish({ documentId: story.documentId });
  assert(
    (await page("/?country=by&lang=ru")).includes(`${marker}-draft-revision`),
  );
  await app.documents(uid).unpublish({ documentId: story.documentId });
  assert(!(await page("/?country=by&lang=ru")).includes(marker));
  await page(`/news/${marker}?country=by&lang=ru`, 404);

  const tariffUid = "api::tariff-document.tariff-document";
  const tariff = await app.documents(tariffUid).create({
    status: "draft",
    data: {
      country: "by",
      language: "ru",
      heading: marker,
      sections: [
        {
          sectionId: marker,
          title: marker,
          entries: [{ title: marker, body: `${marker}-tariff-body` }],
        },
      ],
    },
  });
  created.push([tariffUid, tariff.documentId]);
  assert(
    !(await page("/tariffs?country=by&lang=ru")).includes(
      `${marker}-tariff-body`,
    ),
  );
  const tariffPreview = await issuePreview(tariffUid, tariff.documentId);
  const tariffDraft = await fetch(tariffPreview.url, {
    headers: { Cookie: tariffPreview.cookie },
  });
  assert((await tariffDraft.text()).includes(`${marker}-tariff-body`));
  await app.documents(tariffUid).publish({ documentId: tariff.documentId });
  assert(
    (await page("/tariffs?country=by&lang=ru")).includes(
      `${marker}-tariff-body`,
    ),
  );
  assert((await page("/tariffs?country=uz&lang=uz")).includes("5500"));
  for (const [country, language] of [
    ["uz", "ru"],
    ["uz", "uz"],
    ["kg", "ru"],
    ["kg", "ky"],
    ["am", "hy"],
    ["am", "ru"],
    ["ge", "ka"],
    ["ge", "ru"],
    ["by", "ru"],
    ["by", "be"],
  ]) {
    await page(`/?country=${country}&lang=${language}`);
  }
  console.log(
    "CMS checks passed (including scoped preview authentication, draft isolation, token expiry/tampering, exit, and all three content types): 10 locales, images, server-only read token, denied anonymous access/writes, draft isolation, publish/update/unpublish, news article rendering, and tariff publishing.",
  );
} finally {
  try {
    if (sharedRestore) await app.documents("api::shared-setting.shared-setting").update({ documentId: sharedRestore.documentId, data: { header: sharedRestore.header } });
    for (const [uid, documentId] of created.reverse())
      await app.documents(uid).delete({ documentId });
  } finally {
    for (const [userId, sessionId] of previewSessions)
      await app.sessionManager("admin").revokeSessionById(userId, sessionId);
    await app.destroy();
  }
}
