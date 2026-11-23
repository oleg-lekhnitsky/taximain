import type { CountryCode } from "./countries";

export type NewsStory = {
  id: string;
  image: string;
  alt: string;
  date: string;
  dateTime: string;
  title: string;
  description: string;
  href?: string;
  slug?: string;
  article?: string[];
  body?: RichBlock[];
};

const support: NewsStory = {
  id: "support",
  image: "/assets/news/support.png",
  alt: "Пассажир с телефоном в салоне такси",
  date: "29 окт 2026",
  dateTime: "2026-10-29",
  title: "мы всегда на вашей стороне и рады помочь вам",
  description: "Каждая поездка с WB Taxi должна проходить спокойно и честно.",
  href: "/news/support",
};

const passengers: NewsStory = {
  ...support,
  id: "passengers",
  image: "/assets/news/passengers.png",
  alt: "Две пассажирки в салоне такси",
};

const grodno: NewsStory = {
  id: "grodno-launch",
  image: "/assets/news/grodno.png",
  alt: "Приложение WB Taxi на телефоне рядом с автомобилем",
  date: "29 окт 2026",
  dateTime: "2026-10-29",
  title: "запуск в Бресте",
  description: "Сейчас работаем в тестовом режиме по приглашениям",
};

// Shared stories can be reused; each country controls its own selection and order.
export const newsByCountry: Record<CountryCode, readonly NewsStory[]> = {
  uz: [support, passengers],
  kg: [support, passengers],
  am: [support, passengers],
  ge: [support, passengers],
  by: [support, passengers, grodno],
};

export type RichText = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};
export type RichInline =
  RichText | { type: "link"; url: string; children: RichText[] };
export type RichBlock = {
  type: string;
  level?: number;
  format?: string;
  children: (RichInline | RichBlock)[];
  image?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
};
