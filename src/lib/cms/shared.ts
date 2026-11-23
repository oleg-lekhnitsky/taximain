import type { PageSections } from "./sections";
export type SharedLinks = { googlePlayUrl?: string; appStoreUrl?: string; userAgreementUrl?: string; privacyPolicyUrl?: string; serviceRulesUrl?: string };
export type SharedSettings = { documentId: string; language: string; header?: Record<string, unknown>; footer?: Record<string, unknown>; cookie?: Record<string, unknown>; accessibility?: Record<string, unknown>; links?: SharedLinks };
const groups = { header: "headerSection", footer: "footerSection", cookie: "cookieSection" } as const;
const accessibilitySections: Record<string, "featuresSection" | "downloadSection"> = { carouselLabel: "featuresSection", carouselPositionLabel: "featuresSection", previousSlideLabel: "featuresSection", nextSlideLabel: "featuresSection", qrImageDescription: "downloadSection", googlePlayLabel: "downloadSection", appStoreLabel: "downloadSection" };
const clean = (value: unknown): unknown => Array.isArray(value) ? value.map(clean) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).filter(([key]) => key !== "id").sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, clean(item)])) : value;
export function applySharedSettings<T extends PageSections & { sharedBaseline?: Partial<SharedSettings> }>(page: T, shared?: SharedSettings): T {
  if (!shared || !page.sharedBaseline) return page;
  const result = structuredClone(page);
  const merge = (section: keyof PageSections, key: string, value: unknown, baseline: unknown) => {
    const target = result[section] as Record<string, unknown> | undefined;
    if (target && value !== undefined && (target[key] === undefined || JSON.stringify(clean(target[key])) === JSON.stringify(clean(baseline)))) target[key] = value;
  };
  for (const [group, section] of Object.entries(groups) as [keyof typeof groups, typeof groups[keyof typeof groups]][]) {
    for (const [key, value] of Object.entries(shared[group] ?? {})) if (key !== "id") merge(section, key, value, page.sharedBaseline[group]?.[key]);
  }
  for (const [key, value] of Object.entries(shared.accessibility ?? {})) {
    const section = accessibilitySections[key];
    if (section) merge(section, key, value, page.sharedBaseline.accessibility?.[key]);
  }
  return result;
}
