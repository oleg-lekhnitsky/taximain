import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  countryForHostname,
  defaultCountry,
  isCountryCode,
} from "@/lib/countries";
import { isCountryLanguage, defaultLanguage } from "@/lib/languages";
import { loadSiteContent } from "@/lib/cms/load";
import type { Metadata } from "next";
import Header from "@/components/taxi/Header";
import Footer from "@/components/taxi/Footer";
import CookieNotice from "@/components/taxi/CookieNotice";
import CountryContent from "@/components/CountrySwitcher/CountryContent";
import News from "@/components/taxi/News";
import SupportArticle from "@/components/taxi/SupportArticle";
import styles from "./page.module.scss";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; lang?: string }>;
}): Promise<Metadata> {
  const { country, lang } = await searchParams;
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  const code =
    countryForHostname(host) ??
    (isCountryCode(country) ? country : defaultCountry);
  const language = isCountryLanguage(code, lang) ? lang : defaultLanguage(code);
  const content = await loadSiteContent();
  const story = content[`${code}:${language}`]?.news.find(
    (story) => story.id === "support",
  );
  return {
    title: `${story?.title || "WB Taxi"} — WB Taxi`,
    description: story?.description,
  };
}

export default async function SupportNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; lang?: string }>;
}) {
  const { country, lang } = await searchParams;
  const hostname = (await headers()).get("host")?.split(":")[0] || "";
  const code =
    countryForHostname(hostname) ??
    (isCountryCode(country) ? country : defaultCountry);
  const language = isCountryLanguage(code, lang) ? lang : defaultLanguage(code);
  const content = await loadSiteContent();
  if (
    !content[`${code}:${language}`]?.news.some(
      (story) => story.id === "support",
    )
  )
    notFound();
  return (
    <>
      <div id="root">
        <Header variant="solid" homeHref="/" />
        <CountryContent>
          <SupportArticle />
          <News id="related-news" className={styles.related} />
        </CountryContent>
        <Footer />
      </div>
      <CookieNotice />
    </>
  );
}
