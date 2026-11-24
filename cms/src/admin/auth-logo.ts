import authLogo from "./assets/wb-taxi-auth.svg";

/** Follow the actual CMS theme, including a manual override of the OS theme. */
export function markAuthLogoTheme() {
  const images = [...document.images].filter(image => image.getAttribute("src") === authLogo || image.src === new URL(authLogo, location.href).href);
  if (!images.length) return;
  const channels = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
  if (!channels || channels.length < 3) return;
  const [r, g, b] = channels.map(Number);
  const theme = 0.2126 * r + 0.7152 * g + 0.0722 * b < 128 ? "dark" : "light";
  images.forEach(image => { image.setAttribute("data-wb-auth-logo", ""); image.dataset.wbLogoTheme = theme; });
}
