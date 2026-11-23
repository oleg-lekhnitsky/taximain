import { loadSiteContent } from "@/lib/cms/load";
import { isCountryCode, defaultCountry, countryForHostname } from "@/lib/countries";
import { defaultLanguage, isCountryLanguage } from "@/lib/languages";
import { safeHref } from "@/lib/cms/links";
import { appStores, storeForUserAgent } from "@/lib/download";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedCountry = url.searchParams.get("country");
  const country = countryForHostname(url.hostname) ?? (isCountryCode(requestedCountry) ? requestedCountry : defaultCountry);
  const requestedLanguage = url.searchParams.get("lang");
  const language = isCountryLanguage(country, requestedLanguage) ? requestedLanguage : defaultLanguage(country);
  const content = await loadSiteContent();
  const links = content[`${country}:${language}`]?.sharedLinks;
  const store = storeForUserAgent(request.headers.get("user-agent") ?? "");
  const destination = store ? safeHref(store === appStores.appStore ? links?.appStoreUrl || store : links?.googlePlayUrl || store) : null;
  return new Response(null, {
    status: 307,
    headers: {
      Location: destination ?? new URL(`/?country=${country}&lang=${language}#download`, request.url).href,
      "Cache-Control": "private, no-store",
      Vary: "User-Agent",
    },
  });
}
