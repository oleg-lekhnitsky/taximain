import type { Core } from "@strapi/strapi";

const client = new URL(process.env.CLIENT_URL || "http://localhost:3000");
const frameOrigins = ["'self'", client.origin];
if (["localhost", "127.0.0.1"].includes(client.hostname)) {
  const alias = new URL(client);
  alias.hostname = client.hostname === "localhost" ? "127.0.0.1" : "localhost";
  frameOrigins.push(alias.origin);
}

const config: Core.Config.Middlewares = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "frame-src": frameOrigins,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

export default config;
