import type { LanguageCode } from "../languages";
import type { CountryCode } from "../countries";
export type TariffRow = {
  heading: string;
  meta: string;
  subheading: string;
  body: string;
};
export type TariffSection = {
  id: string;
  title: string;
  text?: string;
  entries: { title: string; body: string }[];
};
export type TariffDocument = {
  country: CountryCode;
  heading: string;
  language: LanguageCode;
  sections: TariffSection[];
};
export type CountryTariffs = Record<
  CountryCode,
  | (TariffDocument & {
      translations?: Partial<Record<LanguageCode, TariffDocument>>;
    })
  | null
>;
