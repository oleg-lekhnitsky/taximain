import { existsSync, readFileSync } from "node:fs";
import { defineRailway, github, postgres, preserve, project, service, volume } from "railway/iac";

// Private bootstrap values are never committed. Later plans preserve Railway secrets.
const path = new URL("../.deployment/railway-secrets.json", import.meta.url);
const secrets: Record<string, string> = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
const provisioned = existsSync(new URL("../.deployment/railway-provisioned", import.meta.url));
const secret = (name: string) => !provisioned && secrets[name] ? { value: secrets[name], isSealed: true } : preserve();
const cmsOrigin = "https://cms-production-0286a6e3.up.railway.app";
const webOrigin = "https://web-production-760000c3.up.railway.app";

export default defineRailway(() => {
  const database = postgres("Postgres");
  const uploads = volume("cms-uploads", { region: "europe-west4-drams3a", sizeMB: 1024 });
  const cms = service("cms", {
    source: github("oleg-lekhnitsky/taximain", { branch: "main", rootDirectory: "/cms" }),
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    healthcheck: "/_health", healthcheckTimeout: 300,
    replicas: { "europe-west4-drams3a": 1 },
    volumeMounts: { "/app/public": uploads },
    env: {
      NODE_ENV: "production", HOST: "0.0.0.0", PORT: "1337", PUBLIC_URL: cmsOrigin, CLIENT_URL: webOrigin, TRUST_PROXY: "true",
      DATABASE_CLIENT: "postgres", DATABASE_URL: database.env.DATABASE_URL, DATABASE_SSL: "false", DATABASE_POOL_MIN: "0", DATABASE_POOL_MAX: "5",
      STRAPI_TELEMETRY_DISABLED: "true", CMS_PREVIEW_SECRET: secret("CMS_PREVIEW_SECRET"), FRONTEND_API_TOKEN: secret("FRONTEND_API_TOKEN"),
      APP_KEYS: secret("APP_KEYS"), API_TOKEN_SALT: secret("API_TOKEN_SALT"), ADMIN_JWT_SECRET: secret("ADMIN_JWT_SECRET"), TRANSFER_TOKEN_SALT: secret("TRANSFER_TOKEN_SALT"), JWT_SECRET: secret("JWT_SECRET"), ENCRYPTION_KEY: secret("ENCRYPTION_KEY"),
      BOOTSTRAP_ADMIN_EMAIL: secret("BOOTSTRAP_ADMIN_EMAIL"), BOOTSTRAP_ADMIN_PASSWORD_HASH: secret("BOOTSTRAP_ADMIN_PASSWORD_HASH"), BOOTSTRAP_ADMIN_FIRSTNAME: secret("BOOTSTRAP_ADMIN_FIRSTNAME"), BOOTSTRAP_ADMIN_LASTNAME: secret("BOOTSTRAP_ADMIN_LASTNAME"),
    },
  });
  const web = service("web", {
    source: github("oleg-lekhnitsky/taximain", { branch: "main" }),
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },
    healthcheck: "/api/health", healthcheckTimeout: 300,
    replicas: { "europe-west4-drams3a": 1 },
    env: { NODE_ENV: "production", PORT: "3000", HOSTNAME: "0.0.0.0", NEXT_TELEMETRY_DISABLED: "1", SITE_URL: webOrigin, STRAPI_URL: cmsOrigin, CMS_PREVIEW_ORIGIN: cmsOrigin, STRAPI_API_TOKEN: secret("FRONTEND_API_TOKEN"), CMS_PREVIEW_SECRET: secret("CMS_PREVIEW_SECRET") },
  });
  return project("taximain", { resources: [database, uploads, cms, web] });
});
