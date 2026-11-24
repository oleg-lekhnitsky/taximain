const labels: Record<string, string> = {
  copyright: "Копирайт и название компании", "Copyright and company": "Копирайт и название компании",
  "One text block. Use a new line to separate the copyright and company name.": "Один текстовый блок. Разделите копирайт и название компании переносом строки.",
  rateText: "Текст плашки кешбэка", downloadsText: "Текст о скачиваниях",
  sharedSettings: "Общие настройки", header: "Навигация", footer: "Подвал сайта", cookie: "Уведомление о cookies", accessibility: "Доступность", links: "Ссылки",
  googlePlayUrl: "Ссылка Google Play", appStoreUrl: "Ссылка App Store", userAgreementUrl: "Ссылка на пользовательское соглашение", privacyPolicyUrl: "Ссылка на политику конфиденциальности", serviceRulesUrl: "Ссылка на правила сервиса",
  answerContent: "Ответ", text: "Текст раздела",
  contentKind: "Тип материала", updatedAt: "Обновлено",
  country: "Страна", language: "Язык", title: "Заголовок", heading: "Заголовок", subtitle: "Подзаголовок",
  description: "Краткое описание", body: "Текст статьи", image: "Изображение", imageAlt: "Описание изображения",
  date: "Дата", order: "Порядок", slug: "Адрес страницы", storyId: "Идентификатор новости", href: "Ссылка",
  question: "Вопрос", answer: "Ответ", linkHref: "Адрес ссылки", linkLabel: "Текст ссылки", items: "Вопросы и ответы",
  sections: "Разделы", entries: "Тарифы", sectionId: "Идентификатор раздела", name: "Название",
  buttonLabel: "Текст кнопки", location: "Местоположение", message: "Текст уведомления", accessibilityLabel: "Название для скринридера",
  countryLabel: "Текст выбора страны", languageLabel: "Текст выбора языка", countryAndLanguageLabel: "Выбор страны и языка",
  faqLabel: "Ссылка на вопросы и ответы", partnersLabel: "Ссылка для партнёров", openMenuLabel: "Открытие меню",
  closeMenuLabel: "Закрытие меню", navigationLabel: "Навигация", versionLabel: "Версия сайта",
  carouselLabel: "Название карусели", carouselPositionLabel: "Положение в карусели", previousSlideLabel: "Предыдущий слайд", nextSlideLabel: "Следующий слайд",
  tariffsCardLabel: "Карточка тарифов", arrivalCardLabel: "Карточка подачи машины", servicesCardLabel: "Карточка возможностей",
  cities: "Города", rate: "Процент кешбэка", cashbackRate: "Процент кешбэка", ratePrefix: "Текст перед процентом", ratePrefixAfter: "Текст после процента",
  terms: "Условия", downloadsLabel: "Текст о скачиваниях", downloadsValue: "Количество скачиваний", scanText: "Инструкция для QR-кода",
  scanAppLabel: "Текст сканирования QR-кода", qrImageDescription: "Описание QR-кода", qrAlt: "Описание QR-кода",
  appStoreLabel: "Название ссылки App Store", googlePlayLabel: "Название ссылки Google Play", privacyPolicyLabel: "Политика конфиденциальности",
  userAgreementLabel: "Пользовательское соглашение", serviceRulesLabel: "Правила сервиса", legalHeading: "Юридическая информация",
  relatedNewsHeading: "Заголовок похожих новостей", retinaImage: "Изображение 2×", supportArticle: "Исходный текст поддержки",
  headerSection: "Шапка и навигация", heroSection: "01. Главный экран", featuresSection: "02. Преимущества", citiesSection: "03. Города",
  cashbackSection: "04. Кешбэк", downloadSection: "05. Скачивание приложения", faqSection: "06. Вопросы и ответы", newsSection: "07. Новости",
  footerSection: "Подвал сайта", cookieSection: "Уведомление о cookies",
};
const phrases: Record<string, string> = {
  "Use Shared settings for language-wide changes. Edit this block only for country-specific wording.": "Для изменений во всех странах используйте общие настройки языка. Редактируйте этот блок только для особого текста конкретной страны.",
  "Shared navigation, legal links and accessibility text. Different page wording is preserved as an override.": "Общая навигация, юридические ссылки и тексты доступности. Отличающиеся тексты страницы сохраняются как локальные переопределения.",
  "Write the complete answer here. Select text and use the link button to add a link.": "Введите ответ целиком. Выделите текст и нажмите кнопку ссылки, чтобы добавить ссылку.",
  "Screen reader only": "Только для скринридера",
  "Read aloud by screen readers. Not displayed as website text.": "Озвучивается скринридерами. Не отображается как текст на сайте.",
  "Source image": "Исходное изображение", "Story image": "Изображение новости", "Image description": "Описание изображения", "Article text": "Текст статьи",
  "Full article content. Add paragraphs, headings, bold text and links here.": "Полный текст статьи. Здесь можно добавлять абзацы, заголовки, выделение и ссылки.",
  "Choose or upload the image shown with this story.": "Выберите или загрузите изображение для этой новости.",
  "Describe what is in the image for people using screen readers.": "Опишите изображение для людей, использующих скринридер.",
  "Upload one high-resolution image (2× the displayed size). The website generates responsive sizes automatically.": "Загрузите одно изображение высокого разрешения (2× от размера на экране). Сайт автоматически создаст нужные размеры.",
  "One text block. Lines wrap automatically after fonts load. Use **text** to highlight words.": "Один текстовый блок. Строки переносятся автоматически после загрузки шрифтов. Используйте **текст** для выделения слов.",
  "Edit the complete paragraph here. Select text and use the link button to add or change a link.": "Редактируйте весь абзац здесь. Выделите текст и нажмите кнопку ссылки, чтобы добавить или изменить ссылку.",
  "Header and navigation": "Шапка и навигация", "01. Hero": "01. Главный экран", "02. Features": "02. Преимущества", "03. Cities": "03. Города",
  "04. Cashback": "04. Кешбэк", "05. Download": "05. Скачивание приложения", "06. FAQ": "06. Вопросы и ответы", "07. News": "07. Новости",
  "Footer": "Подвал сайта", "Cookie notice": "Уведомление о cookies",
};
export const isRussian = () => document.documentElement.lang.startsWith("ru");
export const cmsText = (en: string, ru: string) => isRussian() ? ru : en;

// Strapi stores custom field labels as plain metadata rather than message IDs.
// Translate only labels/help; never rewrite editable content or stored values.
export function translateEditorLabels() {
  document.querySelectorAll<HTMLLabelElement>("label").forEach(label => {
    const control = label.htmlFor ? document.getElementById(label.htmlFor) : null;
    const name = control?.getAttribute("name")?.split(".").pop() ?? "";
    const node = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if (!node) return;
    const original = label.dataset.wbOriginalLabel ?? node.textContent ?? "";
    label.dataset.wbOriginalLabel = original;
    const key = original.trim();
    const camel = key.replace(/\s+(.)/g, (_, char: string) => char.toUpperCase()).replace(/^./, char => char.toLowerCase());
    const translated = labels[name] ?? phrases[key] ?? labels[camel];
    const value = isRussian() && translated ? translated : original;
    if (node.textContent !== value) node.textContent = value;
  });
  const selector = '[data-wb-field-badge], .wb-field-purpose, main small, main p';
  document.querySelectorAll<HTMLElement>(selector).forEach(element => {
    if (element.closest('[contenteditable="true"]') || element.children.length) return;
    const original = element.dataset.wbOriginalHelp ?? element.textContent ?? "";
    if (!phrases[original]) return;
    element.dataset.wbOriginalHelp = original;
    const value = isRussian() ? phrases[original] : original;
    if (element.textContent !== value) element.textContent = value;
  });
}
