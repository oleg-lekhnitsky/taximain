import { applySharedSettings, type SharedSettings } from "./shared";
import "server-only";
import { cache } from "react";
import { isCountryCode } from "../countries";
import { isCountryLanguage } from "../languages";
import { getCopy } from "../copy";
import type { RichBlock } from "../news";
import { localSiteContent } from "./local";
import { cmsCollection, cmsConfigured, cmsMediaUrl } from "./client";
import {
  pageCopy,
  supportArticleFields,
  type PageCopy,
  type FaqContent,
  type SiteContentMap,
} from "./types";

import { fromPageSections, type PageSections } from "./sections";

type Media = { url: string } | null;
type PageRecord = PageSections & {
  sharedSettings?: { documentId: string } | null;
  sharedBaseline?: Partial<SharedSettings>;
  country: string;
  language: string;
  copy: PageCopy;
  cookieMessage?: RichBlock[];
  cities: { name: string }[];
  faqs: FaqContent[];
  heroImage: Media;
  heroImageRetina: Media;
  heroLocation: string;
  cashbackRate: string;
  cashbackRateText?: string;
  downloadsText?: string;
  footerCopyright?: string;
  appDownloadButton?: string;
};
type StoryRecord = {
  contentKind?: "card" | "article" | "link";
  country: string;
  language: string;
  storyId: string;
  slug: string;
  title: string;
  description: string;
  image: Media;
  imageAlt: string;
  date: string;
  href: string | null;
  supportArticle: Record<string, string> | null;
  body: RichBlock[] | null;
};

function validatedCopy(copy: PageCopy): PageCopy {
  const original = pageCopy(getCopy("by", "ru"));
  if (!copy || typeof copy !== "object")
    throw new Error("Site page is missing localized copy");
  for (const key of Object.keys(original) as (keyof PageCopy)[]) {
    const value = copy[key];
    const expected = original[key];
    if (Array.isArray(expected)) {
      if (
        !Array.isArray(value) ||
        value.length < expected.length ||
        !value.every((item) => typeof item === "string")
      ) {
        throw new Error(
          `Invalid CMS copy array: ${key}. Keep at least ${expected.length} text items.`,
        );
      }
    } else if (key !== "location" && typeof value !== typeof expected) {
      throw new Error(`Invalid CMS copy field: ${key}`);
    }
  }
  // Optional empty text is serialized as null by Strapi.
  return { ...copy, location: copy.location || "" };
}

function mediaBlocks(blocks: RichBlock[]): RichBlock[] {
  return blocks.map((block) => ({
    ...block,
    ...(block.image
      ? { image: { ...block.image, url: cmsMediaUrl(block.image.url) } }
      : {}),
    children: block.children.map((child) =>
      "children" in child && child.type !== "link"
        ? mediaBlocks([child as RichBlock])[0]
        : child,
    ),
  }));
}

export const loadSiteContent = cache(async (): Promise<SiteContentMap> => {
  if (!cmsConfigured()) return localSiteContent();
  const [pages, stories, sharedSettings] = await Promise.all([
    cmsCollection<PageRecord>("site-pages", {
      "populate[sharedSettings]": "true",
      "populate[headerSection]": "true",
      "populate[heroSection][populate][image]": "true",
      "populate[heroSection][populate][retinaImage]": "true",
      "populate[featuresSection]": "true",
      "populate[citiesSection][populate][cities]": "true",
      "populate[cashbackSection]": "true",
      "populate[downloadSection]": "true",
      "populate[faqSection][populate][items]": "true",
      "populate[newsSection]": "true",
      "populate[footerSection]": "true",
      "populate[cookieSection]": "true",
      "populate[copy]": "true",
      "populate[cities]": "true",
      "populate[faqs]": "true",
      "populate[heroImage]": "true",
      "populate[heroImageRetina]": "true",
    }),
    cmsCollection<StoryRecord>("news-stories", {
      "populate[image]": "true",
      "populate[supportArticle]": "true",
      "sort[0]": "order:asc",
      "sort[1]": "date:desc",
    }),
    cmsCollection<SharedSettings>("shared-settings", {
      "populate[header]": "true", "populate[footer]": "true", "populate[cookie]": "true", "populate[accessibility]": "true", "populate[links]": "true",
    }),
  ]);
  const content: SiteContentMap = {};
  for (const storedPage of pages) {
    const shared = sharedSettings.find(settings => settings.documentId === storedPage.sharedSettings?.documentId && settings.language === storedPage.language);
    const page = fromPageSections(applySharedSettings(storedPage, shared));
    if (
      !isCountryCode(page.country) ||
      !isCountryLanguage(page.country, page.language)
    )
      throw new Error("Invalid CMS site country/language");
    const key = `${page.country}:${page.language}`;
    if (content[key]) throw new Error(`Duplicate published site page: ${key}`);
    if (!page.heroImage?.url)
      throw new Error(`Site page ${key} needs a hero image`);
    content[key] = {
      copy: validatedCopy(page.copy),
      cookieMessage: page.cookieMessage || [],
      sharedLinks: shared?.links,
      cities: page.cities.map((city) => city.name),
      faqs: page.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer || "",
        answerContent: faq.answerContent,
        linkHref: faq.linkHref || undefined,
        linkLabel: faq.linkLabel || undefined,
      })),
      heroImage: cmsMediaUrl(page.heroImage.url),
      heroImageRetina: cmsMediaUrl(
        page.heroImageRetina?.url || page.heroImage.url,
      ),
      heroLocation: page.heroLocation,
      cashbackRate: page.cashbackRate,
      cashbackRateText: page.cashbackRateText,
      downloadsText: page.downloadsText,
      footerCopyright: page.footerCopyright,
      appDownloadButton: page.appDownloadButton || page.copy.downloadButton,
      news: [],
    };
  }
  for (const story of stories) {
    const page = content[`${story.country}:${story.language}`];
    if (!page) continue;
    if (!story.image?.url)
      throw new Error(`News story ${story.slug} needs an image`);
    page.news.push({
      id: story.storyId,
      slug: story.slug,
      title: story.title,
      description: story.description || "",
      image: cmsMediaUrl(story.image.url),
      alt: story.imageAlt || "",
      date: story.date,
      dateTime: story.date,
      href:
        story.contentKind === "card" ? undefined : story.contentKind === "article" ? `/news/${story.slug}` : story.href || (story.body?.length ? `/news/${story.slug}` : undefined),
      article: story.supportArticle
        ? supportArticleFields.map((key) => story.supportArticle![key])
        : undefined,
      body: story.body ? mediaBlocks(story.body) : undefined,
    });
  }
  return content;
});
