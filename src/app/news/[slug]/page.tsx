import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  countryForHostname,
  defaultCountry,
  isCountryCode,
} from "@/lib/countries";
import { defaultLanguage, isCountryLanguage } from "@/lib/languages";
import { loadSiteContent } from "@/lib/cms/load";
import Header from "@/components/taxi/Header";
import Footer from "@/components/taxi/Footer";
import CookieNotice from "@/components/taxi/CookieNotice";
import CountryContent from "@/components/CountrySwitcher/CountryContent";
import SupportArticle from "@/components/taxi/SupportArticle";
import News from "@/components/taxi/News";
import styles from "../support/page.module.scss";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ country?: string; lang?: string }>;
};
async function getStory({ params, searchParams }: Props) {
  const [{ slug }, { country, lang }, content] = await Promise.all([
    params,
    searchParams,
    loadSiteContent(),
  ]);
  const hostname = (await headers()).get("host")?.split(":")[0] || "";
  const code =
    countryForHostname(hostname) ??
    (isCountryCode(country) ? country : defaultCountry);
  const language = isCountryLanguage(code, lang) ? lang : defaultLanguage(code);
  return content[`${code}:${language}`]?.news.find(
    (story) => story.slug === slug,
  );
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const story = await getStory(props);
  return {
    title: story ? `${story.title} — WB Taxi` : "WB Taxi",
    description: story?.description,
  };
}
export default async function NewsPage(props: Props) {
  const story = await getStory(props);
  if (!story) notFound();
  return (
    <>
      <div id="root">
        <Header variant="solid" homeHref="/" />
        <CountryContent>
          <SupportArticle storyId={story.id} />
          <News id="related-news" className={styles.related} />
        </CountryContent>
        <Footer />
      </div>
      <CookieNotice />
    </>
  );
}
