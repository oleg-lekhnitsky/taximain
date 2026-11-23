import "server-only";

/** Railway's internal request address is not the public address of the site. */
export function publicSiteOrigin(requestUrl: string | URL): string {
  const url = new URL(process.env.SITE_URL || requestUrl);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("SITE_URL must use HTTP or HTTPS");
  return url.origin;
}
