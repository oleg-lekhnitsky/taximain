import { faqAnswer } from "./faq";
import { legacyCookieMessage } from "./cookie";
import type { RichBlock } from "../news";
import type { PageCopy, FaqContent } from "./types";

type CopyField = readonly [keyof PageCopy, number?];

// The editor follows the fixed website layout. Named fields replace indexed JSON.
export const sectionCopyFields = {
  headerSection: {
    countryLabel: ["picker", 0],
    languageLabel: ["picker", 1],
    countryAndLanguageLabel: ["picker", 2],
    faqLabel: ["faqNav"],
    partnersLabel: ["partners"],
    openMenuLabel: ["openMenu"],
    closeMenuLabel: ["closeMenu"],
    navigationLabel: ["navigation"],
    versionLabel: ["version"],
  },
  heroSection: { heading: ["hero"], buttonLabel: ["downloadButton"] },
  featuresSection: {
    heading: ["order"],
    tariffsCardLabel: ["features", 0],
    arrivalCardLabel: ["features", 1],
    servicesCardLabel: ["features", 2],
    carouselLabel: ["carousel", 0],
    carouselPositionLabel: ["carousel", 1],
    previousSlideLabel: ["carousel", 2],
    nextSlideLabel: ["carousel", 3],
  },
  citiesSection: { heading: ["daily"] },
  cashbackSection: {
    heading: ["cashback"],
    subtitle: ["cashbackSubtitle"],
    ratePrefix: ["upTo"],
    ratePrefixAfter: ["upToAfter"],
    terms: ["cashbackTerms"],
    downloadsValue: ["downloads", 0],
    downloadsLabel: ["downloads", 1],
  },
  downloadSection: {
    heading: ["download"],
    scanText: ["scan"],
    qrImageDescription: ["qrAlt"],
    scanAppLabel: ["scanApp"],
    googlePlayLabel: ["play"],
    appStoreLabel: ["appStore"],
  },
  faqSection: { heading: ["faqTitle"] },
  newsSection: { heading: ["news"], relatedNewsHeading: ["related"] },
  footerSection: {
    tariffsLabel: ["footer", 0],
    userAgreementLabel: ["footer", 1],
    privacyPolicyLabel: ["footer", 2],
    serviceRulesLabel: ["footer", 3],
    legalHeading: ["legal"],
  },
  cookieSection: {
    buttonLabel: ["okay"],
    accessibilityLabel: ["cookiesLabel"],
  },
} as const satisfies Record<string, Record<string, CopyField>>;

export type SectionName = keyof typeof sectionCopyFields;
export const sectionLabels: Record<SectionName, string> = {
  headerSection: "Header and navigation",
  heroSection: "01. Hero",
  featuresSection: "02. Features",
  citiesSection: "03. Cities",
  cashbackSection: "04. Cashback",
  downloadSection: "05. App download",
  faqSection: "06. FAQ",
  newsSection: "07. News",
  footerSection: "Footer",
  cookieSection: "Cookie notice",
};
export const sectionNames = Object.keys(sectionCopyFields) as SectionName[];
export const sectionUid = (name: SectionName) =>
  `page.${name.replace(/Section$/, "").replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
export type PageSections = Partial<
  Record<SectionName, Record<string, unknown>>
>;
export type LegacyPage = {
  copy: PageCopy;
  cookieMessage?: RichBlock[];
  cities: { name: string }[];
  faqs: FaqContent[];
  heroImage: unknown;
  heroImageRetina: unknown;
  heroLocation: string;
  cashbackRate: string;
  appDownloadButton?: string;
};

export function toPageSections(page: LegacyPage): PageSections {
  const sections: PageSections = {};
  for (const name of sectionNames) {
    const fields: Record<string, unknown> = {};
    for (const [field, [copyKey, index]] of Object.entries(
      sectionCopyFields[name],
    ) as [string, CopyField][]) {
      const value = page.copy[copyKey];
      fields[field] = index === undefined ? value : (value as string[])[index];
    }
    sections[name] = fields;
  }
  Object.assign(sections.heroSection!, {
    heading: combineHeroHeading(
      page.copy.hero,
      page.copy.location || page.heroLocation,
    ),
    location: null,
    image: page.heroImageRetina || page.heroImage,
    retinaImage: page.heroImageRetina,
  });
  sections.cashbackSection!.rateText = (page.copy.upToAfter ? [page.cashbackRate, page.copy.upTo] : [page.copy.upTo, page.cashbackRate]).join(" ");
  sections.cashbackSection!.downloadsText = page.copy.downloads.join(" ");
  sections.citiesSection!.cities = page.cities.map((city) => ({
    name: city.name,
  }));
  sections.cashbackSection!.rate = page.cashbackRate;
  sections.downloadSection!.buttonLabel =
    page.appDownloadButton || page.copy.downloadButton;
  const oldCopy = page.copy as unknown as Record<string, unknown>;
  sections.cookieSection!.message =
    page.cookieMessage ||
    legacyCookieMessage(
      String(oldCopy.cookiesBefore || ""),
      String(oldCopy.cookiesAfter || ""),
    );
  sections.faqSection!.items = page.faqs.map((faq) => ({
    question: faq.question,
    answerContent: faq.answerContent ?? faqAnswer(faq.answer, faq.linkHref, faq.linkLabel),
    answer: faq.answer,
    linkHref: faq.linkHref,
    linkLabel: faq.linkLabel,
  }));
  return sections;
}

export function fromPageSections<T extends LegacyPage & PageSections>(
  page: T,
): T {
  // Preserve compatibility while existing section records are migrated.
  if (!page.heroSection) return page;
  page = upgradeHeadingSections(page);
  const copy: Record<string, unknown> = { location: "" };
  for (const name of sectionNames) {
    const section = page[name];
    if (!section)
      throw new Error(`Missing published page section: ${sectionLabels[name]}`);
    for (const [field, [copyKey, index]] of Object.entries(
      sectionCopyFields[name],
    ) as [string, CopyField][]) {
      if (index === undefined) copy[copyKey] = section[field];
      else {
        const lines = (copy[copyKey] ||= []) as unknown[];
        lines[index] = section[field];
      }
    }
  }
  if (typeof page.cashbackSection?.rateText === "string") {
    copy.upTo ??= "";
    copy.upToAfter ??= false;
  }
  if (typeof page.cashbackSection?.downloadsText === "string") {
    copy.downloads = ((copy.downloads as unknown[]) ?? []).map(value => typeof value === "string" ? value : "");
    if (!(copy.downloads as string[]).length) copy.downloads = [page.cashbackSection.downloadsText, ""];
  }
  return {
    ...page,
    copy: copy as PageCopy,
    cookieMessage: page.cookieSection!.message as RichBlock[],
    cities: page.citiesSection!.cities as T["cities"],
    faqs: page.faqSection!.items as T["faqs"],
    cashbackRateText: page.cashbackSection!.rateText as string | undefined,
    downloadsText: page.cashbackSection!.downloadsText as string | undefined,
    heroImage: page.heroSection!.image,
    heroImageRetina: page.heroSection!.retinaImage,
    heroLocation: "",
    cashbackRate: (page.cashbackSection!.rate as string) || "",
    appDownloadButton: page.downloadSection!.buttonLabel as string,
  };
}

export const sectionPopulate = {
  headerSection: true,
  heroSection: { populate: ["image", "retinaImage"] },
  featuresSection: true,
  citiesSection: { populate: ["cities"] },
  cashbackSection: true,
  downloadSection: true,
  faqSection: { populate: ["items"] },
  newsSection: true,
  footerSection: true,
  cookieSection: true,
} as const;

// Additive migration: existing text and highlighted phrases become one heading.
export function upgradeHeadingSections<T extends PageSections>(page: T): T {
  const result = { ...page };
  if (page.cookieSection && !Array.isArray(page.cookieSection.message)) {
    result.cookieSection = {
      ...page.cookieSection,
      message: legacyCookieMessage(
        String(page.cookieSection.textBeforeLink || ""),
        String(page.cookieSection.textAfterLink || ""),
      ),
    };
  }
  if (
    page.heroSection &&
    typeof page.heroSection.location === "string" &&
    page.heroSection.location.trim()
  ) {
    result.heroSection = {
      ...page.heroSection,
      heading: combineHeroHeading(
        String(page.heroSection.heading || ""),
        page.heroSection.location,
      ),
      location: null,
    };
  }
  for (const name of [
    "featuresSection",
    "citiesSection",
    "cashbackSection",
    "downloadSection",
    "faqSection",
  ] as const) {
    const section = page[name];
    if (!section) continue;
    const next = { ...section };
    if (typeof next.heading !== "string") {
      next.heading =
        name === "featuresSection"
          ? `**${[section.headingLine1, section.headingLine2Accent].filter(Boolean).join(" ")}** ${[section.headingLine2Text, section.headingLine3].filter(Boolean).join(" ")}`.trim()
          : [section.headingLine1, section.headingLine2]
              .filter(Boolean)
              .join(" ");
    }
    if (name === "downloadSection" && typeof next.scanText !== "string")
      next.scanText = [section.scanLine1, section.scanLine2]
        .filter(Boolean)
        .join(" ");
    result[name] = next;
  }
  return result;
}

export function hasFlowingHeadings(page: PageSections) {
  return (
    [
      "featuresSection",
      "citiesSection",
      "cashbackSection",
      "downloadSection",
      "faqSection",
    ].every((name) => typeof page[name as SectionName]?.heading === "string") &&
    typeof page.downloadSection?.scanText === "string" &&
    !String(page.heroSection?.location || "").trim() &&
    Array.isArray(page.cookieSection?.message)
  );
}

export function combineHeroHeading(heading: string, location: string) {
  const text = heading.trim();
  const suffix = location.trim();
  return !suffix || text.endsWith(suffix) ? text : `${text} ${suffix}`;
}
