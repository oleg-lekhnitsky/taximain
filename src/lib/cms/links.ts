import type { CountryCode } from "../countries";
import type { LanguageCode } from "../languages";

export function safeHref(value: string): string {
  value = value.trim();
  if (Array.from(value).some((character) => character.charCodeAt(0) < 32))
    return "#";
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return value;
  try {
    const url = new URL(value);
    if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol))
      return value;
  } catch {
    /* Invalid editor links are inert. */
  }
  return "#";
}

export function localizedHref(
  value: string,
  country: CountryCode,
  language: LanguageCode,
): string {
  const href = safeHref(value);
  if (!href.startsWith("/")) return href;
  const url = new URL(href, "https://site.invalid");
  url.searchParams.set("country", country);
  url.searchParams.set("lang", language);
  return `${url.pathname}${url.search}${url.hash}`;
}
