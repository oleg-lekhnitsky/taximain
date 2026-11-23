import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const requireCms = createRequire(
  new URL("../cms/package.json", import.meta.url),
);
const dotenv = requireCms("dotenv");
const cmsPath = new URL("../cms/.env", import.meta.url);
const frontendPath = new URL("../.env.local", import.meta.url);
const cms = await readFile(cmsPath, "utf8");
const frontend = await readFile(frontendPath, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const cmsSecret = dotenv.parse(cms).CMS_PREVIEW_SECRET;
const frontendSecret = dotenv.parse(frontend).CMS_PREVIEW_SECRET;
if (cmsSecret && frontendSecret && cmsSecret !== frontendSecret)
  throw new Error(
    "CMS_PREVIEW_SECRET differs between cms/.env and .env.local. Reconcile it before running setup.",
  );
const secret = cmsSecret || frontendSecret || randomBytes(32).toString("hex");
if (secret.length < 32)
  throw new Error("CMS_PREVIEW_SECRET must contain at least 32 characters.");
const set = (content, key, value) =>
  new RegExp(`^${key}=.*$`, "m").test(content)
    ? content.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`)
    : `${content.trimEnd()}\n${key}=${value}\n`;
await writeFile(
  cmsPath,
  set(
    set(cms, "CMS_PREVIEW_SECRET", secret),
    "CLIENT_URL",
    dotenv.parse(cms).CLIENT_URL || "http://localhost:3000",
  ),
  { mode: 0o600 },
);
await writeFile(frontendPath, set(frontend, "CMS_PREVIEW_SECRET", secret), {
  mode: 0o600,
});
console.log(
  "Configured a shared server-only preview secret. Restart the CMS and frontend. No credentials were printed.",
);
