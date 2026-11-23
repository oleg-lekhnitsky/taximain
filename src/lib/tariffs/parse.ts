import { cleanTariffTitle } from "./format";
import type { CountryCode } from "../countries";
import type { TariffDocument, TariffRow, TariffSection } from "./types";

export function buildTariffDocument(
  country: CountryCode,
  rows: TariffRow[],
): TariffDocument {
  const sections: TariffSection[] = [];
  let heading = "";
  for (const row of rows) {
    if (row.heading.trim() && !heading) heading = row.heading.trim();
    if (!row.meta.trim() && !row.subheading.trim() && !row.body.trim())
      continue;
    if (row.meta.trim())
      sections.push({
        id: `tariff-section-${sections.length + 1}`,
        title: row.meta.trim(),
        entries: [],
      });
    const section = sections[sections.length - 1];
    if (!section) throw new Error("Tariff entry has no city or section");
    if (!row.subheading.trim() && row.body.trim()) {
      section.text = [section.text, row.body.trim()].filter(Boolean).join("\n\n");
    } else if (row.subheading.trim() || row.body.trim())
      section.entries.push({
        title: cleanTariffTitle(row.subheading),
        body: row.body.trim(),
      });
  }
  if (!sections.length || sections.some((section) => !section.entries.length && !section.text))
    throw new Error("Tariff document has no complete sections");
  return {
    country,
    heading,
    language: "ru",
    sections,
  };
}
