export const appStores = {
  googlePlay: "https://play.google.com/store/apps/details?id=uz.wildberries.taxi.client",
  appStore: "https://apps.apple.com/app/id6755240054",
} as const;

export function storeForUserAgent(userAgent: string) {
  if (/android/i.test(userAgent)) return appStores.googlePlay;
  if (/iPhone|iPad|iPod/i.test(userAgent) || /Macintosh.*Mobile/i.test(userAgent)) {
    return appStores.appStore;
  }
  return null;
}
