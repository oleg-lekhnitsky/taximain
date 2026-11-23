import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import { isDeepStrictEqual } from "node:util";
import {
  sectionNames,
  sectionLabels,
  sectionUid,
  sectionPopulate,
  toPageSections,
  upgradeHeadingSections,
  hasFlowingHeadings,
} from "../src/lib/cms/sections.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const cmsDir = path.join(root, "cms");
const requireCms = createRequire(path.join(cmsDir, "package.json"));
const env = requireCms("dotenv").parse(
  await readFile(path.join(cmsDir, ".env"), "utf8"),
);
assert.equal(
  process.env.DATABASE_CLIENT || env.DATABASE_CLIENT || "sqlite",
  "sqlite",
  "This migration is for local SQLite only.",
);
const port = Number(process.env.PORT || env.PORT || 1337);
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
assert(!listening, "Stop the CMS before organizing its content.");
const stamp = new Date().toISOString().replaceAll(":", "-");
await copyFile(
  path.resolve(
    cmsDir,
    process.env.DATABASE_FILENAME || env.DATABASE_FILENAME || ".tmp/data.db",
  ),
  path.join(cmsDir, `.tmp/before-page-sections-${stamp}.db`),
);
process.env.STRAPI_TELEMETRY_DISABLED = "true";
process.chdir(cmsDir);
const { compileStrapi, createStrapi } = requireCms("@strapi/strapi");
const app = createStrapi(await compileStrapi({ appDir: cmsDir }));
const uid = "api::site-page.site-page";
const populate = {
  ...sectionPopulate,
  copy: true,
  cities: true,
  faqs: true,
  heroImage: true,
  heroImageRetina: true,
};
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "id")
        .map(([key, item]) => [key, clean(item)]),
    );
  return value;
};
function sectionsFor(record) {
  const upgraded = upgradeHeadingSections(record);
  const mapped = record.heroSection ? {} : toPageSections(record);
  for (const name of sectionNames) {
    // Reruns preserve sections already edited in the new editor.
    if (upgraded[name]) mapped[name] = clean(upgraded[name]);
  }
  for (const field of ["image", "retinaImage"]) {
    const media = mapped.heroSection[field];
    if (media && typeof media === "object")
      mapped.heroSection[field] = media.id ?? record.heroSection?.[field]?.id;
  }
  return mapped;
}
function comparable(record) {
  const sections = sectionsFor(record);
  return clean(sections);
}
let migrated = 0;
try {
  await app.load();
  const documents = app.documents(uid);
  const drafts = await documents.findMany({ status: "draft", populate });
  const published = await documents.findMany({ status: "published", populate });
  await writeFile(
    path.join(cmsDir, `.tmp/page-section-snapshot-${stamp}.json`),
    JSON.stringify({ drafts, published }, null, 2),
    { mode: 0o600 },
  );
  for (const draft of drafts) {
    const live = published.find(
      (record) => record.documentId === draft.documentId,
    );
    if (
      sectionNames.every((name) => draft[name]) &&
      hasFlowingHeadings(draft) &&
      (!live ||
        (sectionNames.every((name) => live[name]) && hasFlowingHeadings(live)))
    )
      continue;
    const draftData = sectionsFor(draft);
    if (live) {
      const liveData = sectionsFor(live);
      await documents.update({
        documentId: draft.documentId,
        status: "draft",
        data: liveData,
      });
      await documents.publish({ documentId: draft.documentId });
      // Restore the independently saved draft, including any unpublished edits.
      if (!isDeepStrictEqual(clean(draftData), clean(liveData)))
        await documents.update({
          documentId: draft.documentId,
          status: "draft",
          data: draftData,
        });
      const migratedLive = await documents.findOne({
        documentId: draft.documentId,
        status: "published",
        populate,
      });
      assert.deepEqual(
        comparable(migratedLive),
        comparable(live),
        "Published page content changed during migration",
      );
    } else {
      await documents.update({
        documentId: draft.documentId,
        status: "draft",
        data: draftData,
      });
    }
    const migratedDraft = await documents.findOne({
      documentId: draft.documentId,
      status: "draft",
      populate,
    });
    assert.deepEqual(
      comparable(migratedDraft),
      comparable(draft),
      "Draft content changed during migration",
    );
    migrated++;
  }
  const manager = app.plugin("content-manager");
  const contentTypes = manager.service("content-types");
  const model = app.contentTypes[uid];
  const config = await contentTypes.findConfiguration(model);
  const labels = { country: "Country", language: "Language", ...sectionLabels };
  const editOrder = ["country", "language", ...sectionNames];
  config.layouts.edit = [
    [
      { name: "country", size: 6 },
      { name: "language", size: 6 },
    ],
    ...sectionNames.map((name) => [{ name, size: 12 }]),
  ];
  config.layouts.list = ["country", "language", "updatedAt"];
  for (const [name, label] of Object.entries(labels)) {
    config.metadatas[name].edit.label = label;
    if (sectionLabels[name]) {
      config.metadatas[name].edit.description =
        name === "newsSection"
          ? "Section headings. Add and edit articles in the News story collection for this country and language."
          : "Matches this block on the website.";
    }
  }
  for (const [name, metadata] of Object.entries(config.metadatas)) {
    if (
      !editOrder.includes(name) &&
      ![
        "createdAt",
        "updatedAt",
        "publishedAt",
        "createdBy",
        "updatedBy",
        "documentId",
        "id",
      ].includes(name)
    )
      metadata.edit.visible = false;
  }
  await contentTypes.updateConfiguration(model, config);
  const components = manager.service("components");
  for (const name of sectionNames) {
    const component = app.components[sectionUid(name)];
    const settings = await components.findConfiguration(component);
    settings.layouts.edit = Object.keys(component.attributes)
      .filter(
        (field) =>
          !["id", "documentId"].includes(field) &&
          component.attributes[field].pluginOptions?.["content-manager"]
            ?.visible !== false,
      )
      .map((field) => [{ name: field, size: 12 }]);
    for (const [field, metadata] of Object.entries(settings.metadatas)) {
      if (metadata.edit)
        metadata.edit.label = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (letter) => letter.toUpperCase());
    }
    if (settings.metadatas.heading)
      settings.metadatas.heading.edit.description =
        "One text block. Lines wrap automatically after fonts load. Use **text** to highlight words.";
    if (name === "cookieSection" && settings.metadatas.message) {
      settings.metadatas.message.edit.label = "Message";
      settings.metadatas.message.edit.description =
        "Edit the complete paragraph here. Select text and use the link button to add or change a link.";
    }
    await components.updateConfiguration(component, settings);
  }
  const saved = await contentTypes.findConfiguration(model);
  assert.deepEqual(
    saved.layouts.edit.flat().map((field) => field.name),
    editOrder,
  );
  console.log(
    `Organized ${migrated} site pages into ordered editor sections. Published content and saved drafts were verified unchanged.`,
  );
  console.log(
    "Database backup and content snapshot saved in cms/.tmp/. Legacy fields remain hidden for recovery.",
  );
} finally {
  await app.destroy();
}
