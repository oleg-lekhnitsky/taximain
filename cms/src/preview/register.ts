import { createHmac } from "node:crypto";
import type { Core } from "@strapi/strapi";
import type { Context } from "koa";

const models = [
  "api::shared-setting.shared-setting",
  "api::site-page.site-page",
  "api::news-story.news-story",
  "api::tariff-document.tariff-document",
] as const;

export function registerPreview(strapi: Core.Strapi) {
  strapi.server.routes({
    type: "admin",
    prefix: "/wb-preview",
    routes: [
      {
        method: "POST",
        path: "/session",
        info: { type: "admin" },
        config: { policies: ["admin::isAuthenticatedAdmin"] },
        handler: async (ctx: Context) => {
          ctx.set("Cache-Control", "private, no-store");
          const secret = process.env.CMS_PREVIEW_SECRET;
          if (!secret) {
            ctx.status = 503;
            ctx.body = {
              error: "Run npm run cms:preview:setup and restart both servers.",
            };
            return;
          }
          if (ctx.get("origin") && ctx.get("origin") !== ctx.origin)
            return ctx.forbidden();
          const input = ctx.request.body as
            { model?: string; documentId?: string } | undefined;
          if (
            !input?.model ||
            !models.includes(input.model as (typeof models)[number]) ||
            !input.documentId ||
            !/^[a-zA-Z0-9_-]{1,100}$/.test(input.documentId)
          )
            return ctx.badRequest(
              "Save a supported entry before opening preview.",
            );
          const uid = input.model as (typeof models)[number];
          const checker = strapi
            .plugin("content-manager")
            .service("permission-checker")
            .create({ userAbility: ctx.state.userAbility, model: uid });
          if (checker.cannot.read()) return ctx.forbidden();
          // Full-entry previews require access to every editable field.
          const readable = Object.entries(strapi.contentTypes[uid].attributes)
            .filter(
              ([field, attribute]) =>
                ![
                  "id",
                  "documentId",
                  "createdAt",
                  "updatedAt",
                  "publishedAt",
                  "createdBy",
                  "updatedBy",
                  "localizations",
                  "locale",
                ].includes(field) &&
                attribute.pluginOptions?.["content-manager"]?.visible !== false,
            )
            .map(([field]) => field);
          const document =
            uid === "api::news-story.news-story"
              ? await strapi.documents("api::news-story.news-story").findOne({
                  documentId: input.documentId,
                  status: "draft",
                  populate: { supportArticle: true, image: true },
                })
              : await strapi
                  .documents(uid)
                  .findOne({ documentId: input.documentId, status: "draft" });
          if (!document) return ctx.notFound("Draft not found.");
          if (checker.cannot.read(document)) return ctx.forbidden();
          const superAdmin = ctx.state.user.roles?.some(
            (role: { code: string }) => role.code === "strapi-super-admin",
          );
          if (
            !superAdmin &&
            readable.some((field) => !checker.can.read(document, field))
          )
            return ctx.forbidden(
              "Full-entry read access is required to preview this entry.",
            );
          const record = document as unknown as Record<string, unknown>;
          const country = String(record.country || ({ ru: "by", be: "by", uz: "uz", ky: "kg", hy: "am", ka: "ge" } as Record<string, string>)[String(record.language)] || "");
          const language = String(record.language || "");
          const validLanguages: Record<string, string[]> = {
            uz: ["ru", "uz"],
            kg: ["ru", "ky"],
            am: ["hy", "ru"],
            ge: ["ka", "ru"],
            by: ["ru", "be"],
          };
          if (!validLanguages[country]?.includes(language))
            return ctx.badRequest("Choose a supported country and language.");
          let pathname = "/";
          let hash = "";
          if (uid === "api::tariff-document.tariff-document")
            pathname = "/tariffs";
          if (uid === "api::news-story.news-story") {
            if (!record.image)
              return ctx.badRequest(
                "Add a news image and save before opening preview.",
              );
            if (record.contentKind !== "card" && record.contentKind !== "link" && record.storyId === "support") pathname = "/news/support";
            else if (record.contentKind !== "card" && record.contentKind !== "link" && Array.isArray(record.body) && record.body.length)
              pathname = `/news/${encodeURIComponent(String(record.slug))}`;
            else hash = "#news";
          }
          pathname += `?${new URLSearchParams({ country, lang: language })}${hash}`;
          const frontend = new URL(
            process.env.CLIENT_URL || "http://localhost:3000",
          );
          if (
            ["localhost", "127.0.0.1"].includes(frontend.hostname) &&
            ["localhost", "127.0.0.1"].includes(ctx.hostname)
          )
            frontend.hostname = ctx.hostname;
          const payload = {
            version: 1,
            uid,
            documentId: input.documentId,
            country,
            language,
            pathname,
            cmsOrigin: ctx.origin,
            revision: String(record.updatedAt),
            expiresAt: Date.now() + 30 * 60 * 1000,
          };
          const data = Buffer.from(JSON.stringify(payload)).toString(
            "base64url",
          );
          const signature = createHmac("sha256", secret)
            .update(data)
            .digest("base64url");
          const url = new URL("/api/cms-preview", frontend);
          url.searchParams.set("token", `${data}.${signature}`);
          ctx.body = { url: url.href, expiresAt: payload.expiresAt };
        },
      },
    ],
  });
}
