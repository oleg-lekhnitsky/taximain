import type { Core } from "@strapi/strapi";

/** Optional, idempotent provisioning from sealed deployment variables. */
export async function bootstrapDeployment(strapi: Core.Strapi) {
  if (process.env.NODE_ENV !== "production") return;
  const accessKey = process.env.FRONTEND_API_TOKEN;
  if (accessKey) {
    const tokens = strapi.service("admin::api-token-content-api");
    const existing = await strapi.db.query("admin::api-token").findOne({ where: { name: "Taxi website (read only)" } });
    const data = { name: "Taxi website (read only)", kind: "content-api", type: "read-only", accessKey: tokens.hash(accessKey), encryptedKey: strapi.service("admin::encryption").encrypt(accessKey), lifespan: null, expiresAt: null };
    if (!existing) await strapi.db.query("admin::api-token").create({ data });
    else if (existing.accessKey !== data.accessKey) await strapi.db.query("admin::api-token").update({ where: { id: existing.id }, data });
  }
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD_HASH;
  if (email && password && /^\$2[aby]\$/.test(password) && !await strapi.db.query("admin::user").findOne({ where: { email } })) {
    if (await strapi.db.query("admin::user").count({}) === 0) {
      const role = await strapi.db.query("admin::role").findOne({ where: { code: "strapi-super-admin" } });
      if (!role) throw new Error("Super administrator role is not initialized");
      await strapi.db.query("admin::user").create({ data: { email, password, firstname: process.env.BOOTSTRAP_ADMIN_FIRSTNAME || "Admin", lastname: process.env.BOOTSTRAP_ADMIN_LASTNAME || "", isActive: true, roles: [role.id] } });
    }
  }
  const transferKey = process.env.MIGRATION_TRANSFER_TOKEN;
  const migrationToken = await strapi.db.query("admin::transfer-token").findOne({ where: { name: "Initial Railway migration" } });
  if (transferKey && !migrationToken) {
    await strapi.service("admin::transfer").token.create({ name: "Initial Railway migration", accessKey: transferKey, permissions: ["push"], lifespan: 7 * 24 * 60 * 60 * 1000 });
  } else if (!transferKey && migrationToken) {
    await strapi.service("admin::transfer").token.revoke(migrationToken.id);
  }
}
