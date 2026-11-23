import type { CountryCode } from "./countries";
export const languages = {
  ru: { name: "Русский", locale: "ru-RU" },
  hy: { name: "Հայերեն", locale: "hy-AM" },
  ka: { name: "ქართული", locale: "ka-GE" },
  uz: { name: "O‘zbekcha", locale: "uz-UZ" },
  ky: { name: "Кыргызча", locale: "ky-KG" },
  be: { name: "Беларуская", locale: "be-BY" },
} as const;
export type LanguageCode = keyof typeof languages;
export const countryLanguages: Record<CountryCode, readonly LanguageCode[]> = {
  uz: ["ru", "uz"],
  kg: ["ru", "ky"],
  am: ["hy", "ru"],
  ge: ["ka", "ru"],
  by: ["ru", "be"],
};
export function contentLanguage(language: LanguageCode): LanguageCode {
  return language;
}
export function defaultLanguage(country: CountryCode): LanguageCode {
  return countryLanguages[country][0];
}
export function isCountryLanguage(
  country: CountryCode,
  value: unknown,
): value is LanguageCode {
  return (
    typeof value === "string" &&
    countryLanguages[country].includes(value as LanguageCode)
  );
}
