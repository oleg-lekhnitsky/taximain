import { countries } from "../countries";
import { countryLanguages, type LanguageCode } from "../languages";
import { getCopy } from "../copy";
import { getCountryCities } from "../countryCities";
import { newsByCountry } from "../news";
import { getTariffCopy } from "../tariffs/copy";
import { pageCopy, type SiteContentMap } from "./types";
import { legacyCookieMessage } from "./cookie";
import { combineHeroHeading } from "./sections";

// Original content remains the repeatable seed source and the standalone-site mode.
export function localSiteContent(): SiteContentMap {
  const content: SiteContentMap = {};
  for (const country of countries) {
    for (const language of countryLanguages[country.code]) {
      const copy = getCopy(country.code, language);
      content[`${country.code}:${language}`] = {
        copy: {
          ...pageCopy(copy),
          hero: combineHeroHeading(
            copy.hero,
            copy.location || country.heroLocation,
          ),
          location: "",
        },
        cookieMessage: legacyCookieMessage(
          copy.cookiesBefore,
          copy.cookiesAfter,
        ),
        cities: getCountryCities(country.code, language),
        faqs: copy.questions.map((question, index) => ({
          question,
          answer:
            index === 0 ? copy.registration : index === 3 ? "" : copy.soon,
          ...(index === 3
            ? {
                linkHref: "/tariffs",
                linkLabel: getTariffCopy(language as LanguageCode).view,
              }
            : {}),
        })),
        heroImage: country.heroImageRetina,
        heroImageRetina: country.heroImageRetina,
        heroLocation: copy.location || country.heroLocation,
        cashbackRate: "30%",
        appDownloadButton: copy.downloadButton,
        news: newsByCountry[country.code].map((story) => ({
          ...story,
          title:
            language === "ru"
              ? story.title
              : story.id === "grodno-launch"
                ? copy.launchTitle
                : copy.storyTitle,
          description:
            language === "ru"
              ? story.description
              : story.id === "grodno-launch"
                ? copy.launchDescription
                : copy.storyDescription,
          alt: language === "ru" ? story.alt : copy.storyTitle,
          ...(story.id === "support" ? { article: copy.article } : {}),
        })),
      };
    }
  }
  return content;
}
