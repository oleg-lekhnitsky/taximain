import type { Core } from "@strapi/strapi";
import { countryLanguages } from "./languages";
const models = ["api::site-page.site-page", "api::news-story.news-story", "api::tariff-document.tariff-document", "api::shared-setting.shared-setting"] as const;
export function registerContentChecks(strapi: Core.Strapi) {
  strapi.server.routes({ type: "admin", prefix: "/wb-content", routes: [{ method: "POST", path: "/checks", info: { type: "admin" }, config: { policies: ["admin::isAuthenticatedAdmin"] }, handler: async ctx => {
    ctx.set("Cache-Control", "private, no-store");
    if (ctx.get("origin") && ctx.get("origin") !== ctx.origin) return ctx.forbidden();
    const input = ctx.request.body as { model?: string; documentId?: string } | undefined;
    if (!input?.model || !models.includes(input.model as typeof models[number]) || !input.documentId || !/^[a-zA-Z0-9_-]{1,100}$/.test(input.documentId)) return ctx.badRequest();
    const uid = input.model as typeof models[number];
    const checker = strapi.plugin("content-manager").service("permission-checker").create({ userAbility: ctx.state.userAbility, model: uid });
    if (checker.cannot.read()) return ctx.forbidden();
    const populate = uid === "api::site-page.site-page" ? { heroSection: { populate: ["image"] }, faqSection: { populate: ["items"] }, footerSection: true, cookieSection: true, sharedSettings: true }
      : uid === "api::news-story.news-story" ? { image: true } : uid === "api::shared-setting.shared-setting" ? { header: true, footer: true, cookie: true, links: true } : { sections: { populate: ["entries"] } };
    const record = await strapi.documents(uid).findOne({ documentId: input.documentId, status: "draft", populate: populate as never });
    if (!record) return ctx.notFound();
    if (checker.cannot.read(record)) return ctx.forbidden();
    const superAdmin = ctx.state.user.roles?.some((role: { code: string }) => role.code === "strapi-super-admin");
    if (!superAdmin && Object.keys(strapi.contentTypes[uid].attributes).filter(key => !["id", "documentId", "createdAt", "updatedAt", "publishedAt", "createdBy", "updatedBy"].includes(key)).some(key => !checker.can.read(record, key))) return ctx.forbidden();
    const data = record as unknown as Record<string, any>;
    const warnings: { code: string; en: string; ru: string; path?: string }[] = [];
    const warn = (code: string, en: string, ru: string, path?: string) => warnings.push({ code, en, ru, path });
    const peers = await strapi.documents(uid).findMany({ status: "published", filters: uid === "api::shared-setting.shared-setting" ? {} : { country: data.country, ...(uid === "api::news-story.news-story" ? { storyId: data.storyId } : {}) } } as never);
    const expected = uid === "api::shared-setting.shared-setting" ? ["ru", "uz", "ky", "hy", "ka", "be"] : countryLanguages[data.country] ?? [];
    for (const language of expected) if (language !== data.language && !peers.some(peer => (peer as any).language === language)) warn("translation", `No published ${language} translation.`, `Нет опубликованного перевода: ${language}.`);
    const allStories = await strapi.documents("api::news-story.news-story").findMany({ status: "published", filters: { country: data.country, language: data.language }, fields: ["slug"] });
    const paths = new Set(["/", "/download", "/tariffs", "/news/support", ...allStories.map(story => `/news/${story.slug}`)]);
    const anchors = new Set(["sect-hero", "sect-send", "cities", "cashback", "download", "sect-faqs", "news", "foot", "faq-title"]);
    const checkLink = (value: unknown, path: string) => {
      if (typeof value !== "string" || !value.trim()) return;
      try {
        if (/[\u0000-\u001f\\]/.test(value) || value.startsWith("//")) throw Error();
        const link = new URL(value, "https://site.invalid");
        if (!["http:", "https:", "mailto:", "tel:"].includes(link.protocol) || (!value.startsWith("/") && !value.startsWith("#") && !/^(https?:|mailto:|tel:)/i.test(value))) throw Error();
        if (link.hostname === "site.invalid" && (!paths.has(link.pathname) || (link.pathname === "/" && link.hash && !anchors.has(link.hash.slice(1))))) warn("internal-link", `Unknown site destination: ${value}`, `Неизвестный адрес на сайте: ${value}`, path);
      } catch { warn("invalid-link", `Invalid or unsafe link: ${value}`, `Некорректная ссылка: ${value}`, path); }
    };
    const walk = (value: unknown, path = "") => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) return value.forEach((item,index) => walk(item, `${path}.${index}`));
      const block = value as { type?: string; image?: { width?: number; alternativeText?: string } };
      if (block.type === "image" && block.image?.width && block.image.width < 1352) warn("article-image-size", "Article image should be at least 1352px wide.", "Изображение в статье рекомендуется загрузить шириной от 1352 px.", path);
      for (const [key, item] of Object.entries(value)) {
        if ((key === "url" && (value as { type?: string }).type === "link") || ["href", "linkHref"].includes(key) || key.endsWith("Url")) checkLink(item, `${path}.${key}`);
        if (!["formats", "provider_metadata", "sharedBaseline"].includes(key)) walk(item, `${path}.${key}`);
      }
    };
    walk(data);
    const image = data.heroSection?.image ?? data.image;
    const minimum = uid === "api::site-page.site-page" ? 2880 : 928;
    if (image?.width && image.width < minimum) warn("image-size", `Image is ${image.width}px wide; recommended minimum is ${minimum}px.`, `Ширина изображения — ${image.width}px, рекомендуется от ${minimum}px.`, "image");
    if (uid === "api::news-story.news-story" && !data.imageAlt?.trim()) warn("image-alt", "Add an image description for screen readers.", "Добавьте описание изображения для скринридера.", "imageAlt");
    if (data.contentKind === "article" && !data.body?.length) warn("article-body", "Full article has no text.", "У полной статьи нет текста.", "body");
    if (data.contentKind === "link" && !data.href?.trim()) warn("link-required", "Linked card has no destination.", "У карточки со ссылкой не указан адрес.", "href");
    if (uid === "api::shared-setting.shared-setting") for (const key of ["userAgreementUrl", "privacyPolicyUrl", "serviceRulesUrl"]) if (!data.links?.[key]) warn("legal-link", `Legal link is not configured: ${key}`, `Не настроена юридическая ссылка: ${key}`, `links.${key}`);
    ctx.body = { warnings: warnings.slice(0, 50), checkedAt: new Date().toISOString() };
  } }] });
}
