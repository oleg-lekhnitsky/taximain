import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  countryForHostname,
  defaultCountry,
  isCountryCode,
} from "@/lib/countries";
import { defaultLanguage, isCountryLanguage } from "@/lib/languages";
import { getTariffCopy, tariffCountryName } from "@/lib/tariffs/copy";
import { loadTariffs } from "@/lib/tariffs/load";
import Header from "@/components/taxi/Header";
import Footer from "@/components/taxi/Footer";
import CookieNotice from "@/components/taxi/CookieNotice";
import CountryContent from "@/components/CountrySwitcher/CountryContent";
import Tariffs from "@/components/taxi/Tariffs";

type Props = { searchParams: Promise<{ country?: string; lang?: string }> };
async function requestedLocale(searchParams: Props["searchParams"]) {
  const { country, lang } = await searchParams;
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  const code =
    countryForHostname(host) ??
    (isCountryCode(country) ? country : defaultCountry);
  const language = isCountryLanguage(code, lang) ? lang : defaultLanguage(code);
  return { country: code, language };
}
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { country: code, language } = await requestedLocale(searchParams);
  return {
    title: `${getTariffCopy(language).title} · ${tariffCountryName(code, language)} — WB Taxi`,
    description: getTariffCopy(language).appPrice,
  };
}
export default async function TariffsPage({ searchParams }: Props) {
  const [{ country, language }, documents] = await Promise.all([
    requestedLocale(searchParams),
    loadTariffs(),
  ]);
  return (
    <>
      <div id="root">
        <Header variant="solid" homeHref="/" />
        <CountryContent>
          <Tariffs
            documents={documents}
            initialCountry={country}
            initialLanguage={language}
          />
        </CountryContent>
        <Footer />
      </div>
      <CookieNotice />
    </>
  );
}
