import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(new URL("../cms/package.json", import.meta.url));
const Database = require("better-sqlite3");
const marker = `${root}cms/.tmp/content-maintenance-v1.json`;
try { await readFile(marker); console.log("Content maintenance migration already applied."); process.exit(0); } catch (error) { if (error.code !== "ENOENT") throw error; }
const db = new Database(`${root}cms/.tmp/data.db`);
try {
  await db.backup(`${root}cms/.tmp/before-content-maintenance-${Date.now()}.db`);
  const counts = { stories: 0, answers: 0, conditions: 0 };
  db.transaction(() => {
    const stories = db.prepare("SELECT id,body,href,content_kind FROM news_storys").all();
    for (const story of stories) {
      const kind = story.body && JSON.parse(story.body).length ? "article" : story.href ? "link" : "card";
      if (story.content_kind === "card" || !story.content_kind) counts.stories += db.prepare("UPDATE news_storys SET content_kind=? WHERE id=?").run(kind, story.id).changes;
    }
    for (const faq of db.prepare("SELECT * FROM components_site_faqs").all()) {
      if (faq.answer_content) continue;
      const children = [{ type: "text", text: faq.answer || "" }];
      if (faq.link_href && faq.link_label) {
        if (faq.answer) children.push({ type: "text", text: " " });
        children.push({ type: "link", url: faq.link_href, children: [{ type: "text", text: faq.link_label }] });
      }
      db.prepare("UPDATE components_site_faqs SET answer_content=? WHERE id=?").run(JSON.stringify([{ type: "paragraph", children }]), faq.id);
      counts.answers++;
    }
    for (const section of db.prepare("SELECT id,text FROM components_tariff_sections").all()) {
      const plain = db.prepare("SELECT l.id,e.body FROM components_tariff_sections_cmps l JOIN components_tariff_entries e ON e.id=l.cmp_id WHERE l.entity_id=? AND l.component_type='tariff.entry' AND (e.title IS NULL OR trim(e.title)='') ORDER BY l.\"order\"").all(section.id);
      if (!plain.length || section.text) continue;
      db.prepare("UPDATE components_tariff_sections SET text=? WHERE id=?").run(plain.map(entry => entry.body).join("\n\n"), section.id);
      for (const entry of plain) db.prepare("DELETE FROM components_tariff_sections_cmps WHERE id=?").run(entry.id);
      counts.conditions++;
    }
  })();
  await writeFile(marker, JSON.stringify(counts, null, 2));
  console.log(JSON.stringify(counts));
} finally { db.close(); }
