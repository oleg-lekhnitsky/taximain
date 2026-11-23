import type { CountryCode } from "../countries";
import type { LanguageCode } from "../languages";
type TariffCopy = {
  title: string;
  cities: string;
  conditions: string;
  emptyTitle: string;
  emptyBody: string;
  download: string;
  view: string;
  appPrice: string;
};
const copy: Record<LanguageCode, TariffCopy> = {
  ru: {
    title: "действующие тарифы",
    cities: "Города и условия",
    conditions: "Прочие условия",
    emptyTitle: "Тарифы пока недоступны",
    emptyBody:
      "Скоро здесь появятся тарифы для этой страны. Пока стоимость поездки можно посмотреть в приложении WB Taxi.",
    download: "Открыть страницу приложения",
    view: "Смотреть тарифы",
    appPrice: "Актуальная стоимость поездки отображается в приложении.",
  },
  hy: {
    title: "Գործող սակագներ",
    cities: "Քաղաքներ և պայմաններ",
    conditions: "Այլ պայմաններ",
    emptyTitle: "Սակագները դեռ հասանելի չեն",
    emptyBody:
      "Այս երկրի սակագները շուտով կհայտնվեն այստեղ։ Մինչ այդ ուղևորության արժեքը կարող եք տեսնել WB Taxi հավելվածում։",
    download: "Բացել հավելվածի էջը",
    view: "Տեսնել սակագները",
    appPrice: "Ուղևորության ընթացիկ արժեքը ցուցադրվում է հավելվածում։",
  },
  ka: {
    title: "მოქმედი ტარიფები",
    cities: "ქალაქები და პირობები",
    conditions: "სხვა პირობები",
    emptyTitle: "ტარიფები ჯერ ხელმისაწვდომი არ არის",
    emptyBody:
      "ამ ქვეყნის ტარიფები მალე აქ გამოჩნდება. მანამდე მგზავრობის ღირებულება შეგიძლიათ ნახოთ WB Taxi-ის აპლიკაციაში.",
    download: "აპლიკაციის გვერდის გახსნა",
    view: "ტარიფების ნახვა",
    appPrice: "მგზავრობის მიმდინარე ღირებულება ნაჩვენებია აპლიკაციაში.",
  },
  uz: {
    title: "Amaldagi tariflar",
    cities: "Shaharlar va shartlar",
    conditions: "Boshqa shartlar",
    emptyTitle: "Tariflar hali mavjud emas",
    emptyBody:
      "Bu mamlakat uchun tariflar tez orada shu yerda paydo bo‘ladi. Hozircha safar narxini WB Taxi ilovasida ko‘rishingiz mumkin.",
    download: "Ilova sahifasini ochish",
    view: "Tariflarni ko‘rish",
    appPrice: "Safarning amaldagi narxi ilovada ko‘rsatiladi.",
  },
  ky: {
    title: "Учурдагы тарифтер",
    cities: "Шаарлар жана шарттар",
    conditions: "Башка шарттар",
    emptyTitle: "Тарифтер азырынча жеткиликтүү эмес",
    emptyBody:
      "Бул өлкөнүн тарифтери жакында ушул жерде пайда болот. Азырынча сапардын баасын WB Taxi колдонмосунан көрө аласыз.",
    download: "Колдонмонун барагын ачуу",
    view: "Тарифтерди көрүү",
    appPrice: "Сапардын учурдагы баасы колдонмодо көрсөтүлөт.",
  },
  be: {
    title: "Дзейныя тарыфы",
    cities: "Гарады і ўмовы",
    conditions: "Іншыя ўмовы",
    emptyTitle: "Тарыфы пакуль недаступныя",
    emptyBody:
      "Хутка тут з’явяцца тарыфы для гэтай краіны. Пакуль кошт паездкі можна паглядзець у дадатку WB Taxi.",
    download: "Адкрыць старонку дадатку",
    view: "Паглядзець тарыфы",
    appPrice: "Актуальны кошт паездкі паказаны ў дадатку.",
  },
};
export function getTariffCopy(language: LanguageCode) {
  return copy[language];
}
export function tariffSectionLabel(
  title: string,
  language: LanguageCode,
): string {
  if (title === "Прочие условия") return copy[language].conditions;
  if (language === "uz")
    return (
      (
        {
          Ташкент: "Toshkent",
          Самарканд: "Samarqand",
          Бухара: "Buxoro",
        } as Record<string, string>
      )[title] ?? title
    );
  return title;
}

const countryNames: Record<LanguageCode, Record<CountryCode, string>> = {
  ru: {
    uz: "Узбекистан",
    kg: "Кыргызстан",
    am: "Армения",
    ge: "Грузия",
    by: "Беларусь",
  },
  hy: {
    uz: "Ուզբեկստան",
    kg: "Ղրղզստան",
    am: "Հայաստան",
    ge: "Վրաստան",
    by: "Բելառուս",
  },
  ka: {
    uz: "უზბეკეთი",
    kg: "ყირგიზეთი",
    am: "სომხეთი",
    ge: "საქართველო",
    by: "ბელარუსი",
  },
  uz: {
    uz: "O‘zbekiston",
    kg: "Qirg‘iziston",
    am: "Armaniston",
    ge: "Gruziya",
    by: "Belarus",
  },
  ky: {
    uz: "Өзбекстан",
    kg: "Кыргызстан",
    am: "Армения",
    ge: "Грузия",
    by: "Беларусь",
  },
  be: {
    uz: "Узбекістан",
    kg: "Кыргызстан",
    am: "Арменія",
    ge: "Грузія",
    by: "Беларусь",
  },
};
export function tariffCountryName(
  country: CountryCode,
  language: LanguageCode,
) {
  return countryNames[language][country];
}
