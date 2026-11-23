export const countries = [
  {
    code: "uz",
    heroImage: "/assets/hero/passenger_uz.webp",
    heroImageRetina: "/assets/hero/passenger_uz@2x.webp",
    heroLocation: "в Узбекистане",
    name: "O‘zbekiston",
    language: "uz",
    url: process.env.NEXT_PUBLIC_COUNTRY_UZ_URL || "https://uz.wb-taxi.example",
    partnersUrl:
      process.env.NEXT_PUBLIC_PARTNERS_UZ_URL ||
      "https://uz.partners.wb-taxi.example",
  },
  {
    code: "kg",
    heroImage: "/assets/hero/passenger_ky2.webp",
    heroImageRetina: "/assets/hero/passenger_ky2@2x.webp",
    heroLocation: "в Кыргызстане",
    name: "Кыргызстан",
    language: "ky",
    url: process.env.NEXT_PUBLIC_COUNTRY_KG_URL || "https://kg.wb-taxi.example",
    partnersUrl:
      process.env.NEXT_PUBLIC_PARTNERS_KG_URL ||
      "https://kg.partners.wb-taxi.example",
  },
  {
    code: "am",
    heroImage: "/assets/hero/passenger_arm.webp",
    heroImageRetina: "/assets/hero/passenger_arm@2x.webp",
    heroLocation: "в Армении",
    name: "Հայաստան",
    language: "hy",
    url: process.env.NEXT_PUBLIC_COUNTRY_AM_URL || "https://am.wb-taxi.example",
    partnersUrl:
      process.env.NEXT_PUBLIC_PARTNERS_AM_URL ||
      "https://am.partners.wb-taxi.example",
  },
  {
    code: "ge",
    heroImage: "/assets/hero/passenger_ge3.webp",
    heroImageRetina: "/assets/hero/passenger_ge3@2x.webp",
    heroLocation: "в Грузии",
    name: "საქართველო",
    language: "ka",
    url: process.env.NEXT_PUBLIC_COUNTRY_GE_URL || "https://ge.wb-taxi.example",
    partnersUrl:
      process.env.NEXT_PUBLIC_PARTNERS_GE_URL ||
      "https://ge.partners.wb-taxi.example",
  },
  {
    code: "by",
    heroImage: "/assets/hero/passenger_by.webp",
    heroImageRetina: "/assets/hero/passenger_by@2x.webp",
    heroLocation: "в Беларуси",
    name: "Беларусь",
    language: "be",
    url: process.env.NEXT_PUBLIC_COUNTRY_BY_URL || "https://by.wb-taxi.example",
    partnersUrl:
      process.env.NEXT_PUBLIC_PARTNERS_BY_URL ||
      "https://by.partners.wb-taxi.example",
  },
] as const;

export type CountryCode = (typeof countries)[number]["code"];
export const defaultCountry: CountryCode = "by";

export function isCountryCode(value: unknown): value is CountryCode {
  return countries.some((country) => country.code === value);
}

export function countryForHostname(hostname: string): CountryCode | undefined {
  return countries.find((country) => new URL(country.url).hostname === hostname)
    ?.code;
}

export function isPlaceholderUrl(url: URL): boolean {
  return url.hostname.endsWith(".example");
}
