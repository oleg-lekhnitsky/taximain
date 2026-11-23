import { bootstrapDeployment } from "./deployment/bootstrap";
import { randomUUID } from "node:crypto";
import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { countryLanguages } from "./content/languages";
import { registerContentChecks } from "./content/checks";
import { registerPreview } from "./preview/register";

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({ name: "country-language", type: "enumeration", inputSize: { default: 6, isResizable: true } });
    strapi.customFields.register({ name: "country-select", type: "enumeration", inputSize: { default: 6, isResizable: true } });
    strapi.customFields.register({ name: "story-kind", type: "enumeration", inputSize: { default: 12, isResizable: true } });
    registerPreview(strapi);
    registerContentChecks(strapi);
  },
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await bootstrapDeployment(strapi);
    const components = strapi.plugin("content-manager").service("components");
    const component = strapi.components["tariff.section"];
    const configuration = await components.findConfiguration(component);
    configuration.settings.mainField = "title";
    configuration.layouts.edit = [
      [{ name: "title", size: 12 }],
      [{ name: "text", size: 12 }],
      [{ name: "entries", size: 12 }],
    ];
    await components.updateConfiguration(component, configuration);
    const faq = strapi.components["site.faq"];
    const faqConfiguration = await components.findConfiguration(faq);
    faqConfiguration.settings.mainField = "question";
    faqConfiguration.layouts.edit = [[{ name: "question", size: 12 }], [{ name: "answerContent", size: 12 }]];
    faqConfiguration.metadatas.answerContent.edit.label = "Answer";
    faqConfiguration.metadatas.answerContent.edit.description = "Write the complete answer here. Select text and use the link button to add a link.";
    await components.updateConfiguration(faq, faqConfiguration);
    const hero = strapi.components["page.hero"];
    const heroConfiguration = await components.findConfiguration(hero);
    heroConfiguration.layouts.edit = heroConfiguration.layouts.edit
      .map((row: Array<{ name: string; size: number }>) => row.filter(field => field.name !== "retinaImage"))
      .filter((row: unknown[]) => row.length);
    heroConfiguration.metadatas.image.edit.label = "Source image";
    heroConfiguration.metadatas.image.edit.description = "Upload one high-resolution image (2× the displayed size). The website generates responsive sizes automatically.";
    await components.updateConfiguration(hero, heroConfiguration);
    const contentTypes = strapi.plugin("content-manager").service("content-types");
    const news = strapi.contentTypes["api::news-story.news-story"];
    const newsConfiguration = await contentTypes.findConfiguration(news);
    newsConfiguration.layouts.edit = newsConfiguration.layouts.edit.flatMap((row: Array<{ name: string; size: number }>) => {
      if (!row.some(field => ["image", "imageAlt"].includes(field.name))) return [row];
      return row.map(field => [{ ...field, size: 12 }]);
    });
    newsConfiguration.layouts.edit = newsConfiguration.layouts.edit
      .map((row: Array<{ name: string; size: number }>) => row.filter(field => !["supportArticle", "layout", "storyId"].includes(field.name)))
      .filter((row: unknown[]) => row.length);
    newsConfiguration.layouts.edit = [
      [{ name: "country", size: 6 }, { name: "language", size: 6 }],
      [{ name: "contentKind", size: 12 }],
      [{ name: "title", size: 12 }],
      [{ name: "description", size: 12 }],
      [{ name: "body", size: 12 }],
      [{ name: "href", size: 12 }],
      [{ name: "image", size: 12 }],
      [{ name: "imageAlt", size: 12 }],
      [{ name: "date", size: 6 }, { name: "order", size: 6 }],
      [{ name: "slug", size: 12 }],
    ];
    newsConfiguration.layouts.list = ["title", "country", "language", "contentKind", "date"];
    newsConfiguration.settings.defaultSortBy = "date";
    newsConfiguration.settings.defaultSortOrder = "DESC";
    newsConfiguration.metadatas.body.edit.label = "Article text";
    newsConfiguration.metadatas.body.edit.description = "Full article content. Add paragraphs, headings, bold text and links here.";
    newsConfiguration.metadatas.image.edit.label = "Story image";
    newsConfiguration.metadatas.image.edit.description = "Choose or upload the image shown with this story.";
    newsConfiguration.metadatas.imageAlt.edit.label = "Image description";
    newsConfiguration.metadatas.imageAlt.edit.description = "Describe what is in the image for people using screen readers.";
    await contentTypes.updateConfiguration(news, newsConfiguration);
    for (const [uid, fields] of [
      ["api::site-page.site-page", ["country", "language", "updatedAt"]],
      ["api::tariff-document.tariff-document", ["heading", "country", "language", "updatedAt"]],
    ] as const) {
      const model = strapi.contentTypes[uid];
      const settings = await contentTypes.findConfiguration(model);
      settings.layouts.list = [...fields];
      settings.settings.defaultSortBy = "updatedAt";
      settings.settings.defaultSortOrder = "DESC";
      await contentTypes.updateConfiguration(model, settings);
    }
    const cashbackComponent = strapi.components["page.cashback"];
    const cashbackConfig = await components.findConfiguration(cashbackComponent);
    cashbackConfig.layouts.edit = ["heading", "subtitle", "rateText", "terms", "downloadsText"].map(name => [{ name, size: 12 }]);
    await components.updateConfiguration(cashbackComponent, cashbackConfig);
    const pageModel = strapi.contentTypes["api::site-page.site-page"];
    const pageConfig = await contentTypes.findConfiguration(pageModel);
    pageConfig.layouts.edit = pageConfig.layouts.edit.map((row: Array<{ name: string; size: number }>) => row.filter(field => !["sharedSettings", "sharedBaseline"].includes(field.name))).filter((row: unknown[]) => row.length);
    if (pageConfig.metadatas.sharedBaseline?.edit) pageConfig.metadatas.sharedBaseline.edit.visible = false;
    pageConfig.layouts.edit.splice(1, 0, [{ name: "sharedSettings", size: 12 }]);
    pageConfig.metadatas.sharedSettings.edit.description = "Shared navigation, legal links and accessibility text. Different page wording is preserved as an override.";
    for (const field of ["headerSection", "footerSection", "cookieSection"]) if (pageConfig.metadatas[field]?.edit) pageConfig.metadatas[field].edit.description = "Use Shared settings for language-wide changes. Edit this block only for country-specific wording.";
    await contentTypes.updateConfiguration(pageModel, pageConfig);
    strapi.documents.use(async (context, next) => {
      if (context.uid !== "api::shared-setting.shared-setting" || !["create", "update", "publish"].includes(context.action)) return next();
      const params = context.params as { documentId?: string; data?: { language?: string } };
      const existing = params.documentId ? await strapi.documents("api::shared-setting.shared-setting").findOne({ documentId: params.documentId, status: "draft" }) : null;
      const language = params.data?.language ?? existing?.language;
      if (existing && language !== existing.language) throw new errors.ValidationError("Create settings for a new language instead of changing the language of linked settings. / Создайте настройки для нового языка вместо изменения языка существующих настроек.");
      if (language) {
        const other = await strapi.documents("api::shared-setting.shared-setting").findFirst({ status: "draft", filters: { language: language as "ru" | "uz" | "ky" | "hy" | "ka" | "be", ...(params.documentId ? { documentId: { $ne: params.documentId } } : {}) } });
        if (other) throw new errors.ValidationError("Shared settings already exist for this language. / Общие настройки для этого языка уже существуют.");
      }
      return next();
    });
    strapi.documents.use(async (context, next) => {
      if (context.uid !== "api::site-page.site-page" || !["create", "update"].includes(context.action)) return next();
      const params = context.params as { documentId?: string; data?: Record<string, unknown> };
      if (!params.data) return next();
      const current = params.documentId ? await strapi.documents("api::site-page.site-page").findOne({ documentId: params.documentId, status: "draft", populate: ["sharedSettings"] }) : null;
      const language = params.data.language ?? current?.language;
      const relation = params.data.sharedSettings as string | number | { connect?: Array<{ documentId?: string; id?: number }>; disconnect?: unknown[]; set?: Array<{ documentId?: string; id?: number }> } | null | undefined;
      if (relation === null || (typeof relation === "object" && relation?.set?.length === 0)) { params.data.sharedBaseline = null; return next(); }
      const reference = typeof relation === "object" && relation ? (relation.connect?.at(-1) ?? relation.set?.at(-1)) : null;
      const requested = typeof relation === "string" ? relation : reference?.documentId;
      const requestedId = typeof relation === "number" ? relation : reference?.id;
      const changed = relation !== undefined && (requested || requestedId);
      if (!changed && current?.sharedBaseline) return next();
      let target;
      if (requested) target = await strapi.documents("api::shared-setting.shared-setting").findOne({ documentId: requested, status: "published", populate: ["header", "footer", "cookie", "accessibility"] });
      else if (requestedId) target = await strapi.db.query("api::shared-setting.shared-setting").findOne({ where: { id: requestedId }, populate: ["header", "footer", "cookie", "accessibility"] });
      else if (language && !current) target = await strapi.documents("api::shared-setting.shared-setting").findFirst({ status: "published", filters: { language: language as "ru" | "uz" | "ky" | "hy" | "ka" | "be" }, populate: ["header", "footer", "cookie", "accessibility"] });
      if (target) {
        if (target.language !== language) throw new errors.ValidationError("Choose shared settings for the page language. / Выберите общие настройки для языка страницы.");
        params.data.sharedSettings = target.documentId;
        params.data.sharedBaseline = { header: target.header, footer: target.footer, cookie: target.cookie, accessibility: target.accessibility };
      }
      return next();
    });
    const sharedModel = strapi.contentTypes["api::shared-setting.shared-setting"];
    const sharedConfig = await contentTypes.findConfiguration(sharedModel);
    sharedConfig.settings.mainField = "language";
    sharedConfig.layouts.list = ["language", "updatedAt"];
    sharedConfig.layouts.edit = [[{ name: "language", size: 12 }], ...["header", "footer", "cookie", "accessibility", "links"].map(name => [{ name, size: 12 }])];
    await contentTypes.updateConfiguration(sharedModel, sharedConfig);
    const models = new Set(["api::site-page.site-page", "api::news-story.news-story", "api::tariff-document.tariff-document"]);
    strapi.documents.use(async (context, next) => {
      if (!models.has(context.uid) || !["create", "update", "publish"].includes(context.action)) return next();
      const params = context.params as { documentId?: string; data?: { country?: string; language?: string; sections?: Array<{ sectionId?: string }>; contentKind?: string; storyId?: string; title?: string; body?: unknown[]; href?: string } };
      if (context.uid === "api::tariff-document.tariff-document") {
        for (const section of params.data?.sections ?? []) {
          if (!section.sectionId) section.sectionId = `tariff-section-${randomUUID()}`;
        }
      }
      const existing = params.documentId
        ? await strapi.documents(context.uid).findOne({ documentId: params.documentId, status: "draft" }) as { country?: string; language?: string } | null
        : null;
      if (context.uid === "api::news-story.news-story" && params.data && context.action === "create") {
        params.data.storyId ||= `news-${randomUUID()}`;
        params.data.contentKind ||= params.data.body?.length ? "article" : params.data.href ? "link" : "card";
      }
      if (context.uid === "api::news-story.news-story" && context.action === "publish") {
        const article = existing as { contentKind?: string; body?: unknown[]; href?: string } | null;
        if (article?.contentKind === "article" && !article.body?.length) throw new errors.ValidationError("Add article text before publishing. / Добавьте текст статьи перед публикацией.");
        if (article?.contentKind === "link" && !article.href?.trim()) throw new errors.ValidationError("Add a link before publishing. / Добавьте ссылку перед публикацией.");
      }
      const country = params.data?.country ?? existing?.country;
      const language = params.data?.language ?? existing?.language ?? "ru";
      if (country && !countryLanguages[country]?.includes(language)) {
        throw new errors.ValidationError("Choose a language supported in the selected country.");
      }
      return next();
    });
  },
};
