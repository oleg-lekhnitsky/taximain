import "server-only";
import uzImport from "@/data/tariffs/uz.json";
import uzTranslation from "@/data/tariffs/uz-uz.json";
import { buildTariffDocument } from "./parse";
import { cmsCollection, cmsConfigured } from "../cms/client";
import { isCountryCode } from "../countries";
import { isCountryLanguage, defaultLanguage } from "../languages";
import type { TariffDocument } from "./types";
import type { CountryTariffs } from "./types";

type CmsTariff = Omit<TariffDocument, "sections"> & {
  sections: {
    sectionId: string;
    title: string;
    text?: string;
    entries: { title: string | null; body: string }[];
  }[];
};
export async function loadTariffs(): Promise<CountryTariffs> {
  if (cmsConfigured()) {
    const documents = await cmsCollection<CmsTariff>("tariff-documents", {
      "populate[sections][populate][entries]": "true",
    });
    const result: CountryTariffs = {
      uz: null,
      kg: null,
      am: null,
      ge: null,
      by: null,
    };
    const keys = new Set<string>();
    for (const record of documents) {
      if (
        !isCountryCode(record.country) ||
        !isCountryLanguage(record.country, record.language)
      )
        throw new Error("Invalid tariff country/language");
      const key = `${record.country}:${record.language}`;
      if (keys.has(key))
        throw new Error(`Duplicate published tariff document: ${key}`);
      keys.add(key);
      const ids = new Set<string>();
      const document: TariffDocument = {
        country: record.country,
        language: record.language,
        heading: record.heading,
        sections: record.sections.map((section) => {
          if (
            !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(section.sectionId) ||
            ids.has(section.sectionId)
          )
            throw new Error(
              `Invalid or duplicate tariff section ID: ${section.sectionId}`,
            );
          ids.add(section.sectionId);
          return {
            id: section.sectionId,
            title: section.title,
            text: section.text,
            entries: section.entries.map((entry) => ({
              title: entry.title || "",
              body: entry.body,
            })),
          };
        }),
      };
      const existing = result[record.country];
      if (!existing)
        result[record.country] = {
          ...document,
          translations: { [record.language]: document },
        };
      else {
        const translations = {
          ...existing.translations,
          [record.language]: document,
        };
        result[record.country] =
          record.language === defaultLanguage(record.country)
            ? { ...document, translations }
            : { ...existing, translations };
      }
    }
    return result;
  }
  return {
    uz: {
      ...buildTariffDocument("uz", uzImport.rows),
      translations: {
        uz: {
          ...buildTariffDocument("uz", uzTranslation.rows),
          language: "uz",
        },
      },
    },
    kg: null,
    am: null,
    ge: null,
    by: null,
  };
}
