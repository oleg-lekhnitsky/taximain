import type { CountryCode } from "./countries";

// Demo lists for layout previews; replace with confirmed service coverage.
export const countryCities: Record<CountryCode, readonly string[]> = {
  kg: [
    "Бишкек",
    "Ош",
    "Манас",
    "Каракол",
    "Токмок",
    "Нарын",
    "Талас",
    "Баткен",
    "Кара-Балта",
    "Балыкчы",
  ],
  uz: [
    "Ташкент",
    "Самарканд",
    "Бухара",
    "Наманган",
    "Андижан",
    "Фергана",
    "Нукус",
    "Карши",
    "Джизак",
    "Ургенч",
  ],
  am: ["Երևան", "Գյումրի", "Վանաձոր"],
  ge: ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი"],
  by: ["Минск", "Брест"],
};

export function getCountryCities(
  country: CountryCode,
  language: string,
): readonly string[] {
  if (language === "uz")
    return [
      "Toshkent",
      "Samarqand",
      "Buxoro",
      "Namangan",
      "Andijon",
      "Farg‘ona",
      "Nukus",
      "Qarshi",
      "Jizzax",
      "Urganch",
    ];
  if (language === "be") return ["Мінск", "Брэст"];
  if (language === "ru" && country === "am")
    return ["Ереван", "Гюмри", "Ванадзор"];
  if (language === "ru" && country === "ge")
    return ["Тбилиси", "Батуми", "Кутаиси", "Рустави"];
  return countryCities[country];
}
