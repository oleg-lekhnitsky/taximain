import type { SharedLinks } from "./shared";
import type { SiteCopy } from "../copy";
import type { NewsStory, RichBlock } from "../news";

export const separateContentFields = [
  "conditions",
  "cookiesBefore",
  "cookiesAfter",
  "questions",
  "registration",
  "soon",
  "storyTitle",
  "storyDescription",
  "launchTitle",
  "launchDescription",
  "article",
] as const;
const flowingTextFields = [
  "order",
  "daily",
  "cashback",
  "download",
  "faqTitle",
  "scan",
] as const;
export type PageCopy = Omit<
  SiteCopy,
  (typeof separateContentFields)[number] | (typeof flowingTextFields)[number]
> &
  Record<(typeof flowingTextFields)[number], string>;
export function pageCopy(copy: SiteCopy): PageCopy {
  const result = Object.fromEntries(
    Object.entries(copy).filter(
      ([key]) =>
        !separateContentFields.includes(
          key as (typeof separateContentFields)[number],
        ),
    ),
  );
  for (const key of flowingTextFields) {
    const value = copy[key];
    result[key] = Array.isArray(value)
      ? key === "order"
        ? `**${value.slice(0, 2).join(" ")}** ${value.slice(2).join(" ")}`
        : value.join(" ")
      : value;
  }
  return result as PageCopy;
}

export type FaqContent = {
  question: string;
  answerContent?: RichBlock[];
  answer: string;
  linkHref?: string;
  linkLabel?: string;
};
export type SiteContent = {
  copy: PageCopy;
  cookieMessage: RichBlock[];
  sharedLinks?: SharedLinks;
  footerCopyright?: string;
  cities: readonly string[];
  faqs: FaqContent[];
  heroImage: string;
  heroImageRetina: string;
  heroLocation: string;
  cashbackRate: string;
  cashbackRateText?: string;
  downloadsText?: string;
  appDownloadButton: string;
  news: NewsStory[];
};
export type SiteContentMap = Record<string, SiteContent>;

export const supportArticleFields = [
  "intro",
  "qualityBefore",
  "qualityStrong",
  "qualityAfter",
  "helpHeading",
  "helpBefore",
  "appLinkLabel",
  "tripsLabel",
  "selectTrip",
  "helpLabel",
  "helpAfter",
  "resolutionHeading",
  "resolutionBefore",
  "resolutionStrong",
  "resolutionAfter",
  "contactParagraph",
  "thanks",
  "signature",
] as const;
