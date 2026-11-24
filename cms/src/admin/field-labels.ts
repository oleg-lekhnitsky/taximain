import { cmsText } from "./translations";
const screenReaderFields = new Set([
  "header.countryAndLanguageLabel", "header.openMenuLabel", "header.closeMenuLabel", "header.navigationLabel", "header.versionLabel", "footer.legalHeading", "cookie.accessibilityLabel",
  "accessibility.carouselLabel", "accessibility.carouselPositionLabel", "accessibility.previousSlideLabel", "accessibility.nextSlideLabel", "accessibility.qrImageDescription", "accessibility.googlePlayLabel", "accessibility.appStoreLabel",
  "headerSection.countryAndLanguageLabel",
  "headerSection.openMenuLabel",
  "headerSection.closeMenuLabel",
  "headerSection.navigationLabel",
  "headerSection.versionLabel",
  "featuresSection.carouselLabel",
  "featuresSection.carouselPositionLabel",
  "featuresSection.previousSlideLabel",
  "featuresSection.nextSlideLabel",
  "downloadSection.googlePlayLabel",
  "downloadSection.appStoreLabel",
  "footerSection.legalHeading",
  "cookieSection.accessibilityLabel",
]);

export function markFieldLabels() {
  // Strapi initializes this optional newsletter field to false. Hide the whole
  // opt-in row without changing its value or the registration form itself.
  if (document.querySelector('input[type="password"]') && !document.querySelector("nav")) {
    document.body.setAttribute("data-wb-auth", "");
    let card = document.querySelector('form input[type="password"]')?.closest("form")?.parentElement;
    while (card && !["MAIN", "BODY"].includes(card.tagName)) {
      if (card.querySelector('img[data-wb-auth-logo]')) {
        card.setAttribute("data-wb-auth-card", "");
        break;
      }
      card = card.parentElement;
    }
    document.querySelectorAll<HTMLElement>("h1").forEach(heading => {
      if (heading.textContent?.trim() === "WB Taxi CMS") {
        heading.setAttribute("data-wb-auth-brand-heading", "");
      }
    });
    const terms = document.querySelector<HTMLAnchorElement>('a[href="https://strapi.io/terms"]');
    let row = terms?.parentElement;
    while (row && !["FORM", "MAIN", "BODY"].includes(row.tagName)) {
      if (row.querySelector('[role="checkbox"], input[type="checkbox"]')) {
        row.setAttribute("data-wb-newsletter-opt-in", "");
        break;
      }
      row = row.parentElement;
    }
  }
  // Mark only the single-asset rows in editor forms, not the media-library grid.
  document.querySelectorAll<HTMLImageElement>('main img[draggable="false"]').forEach(image => {
    const preview = image.parentElement;
    const row = preview?.parentElement;
    if (!preview || !row || row.children.length !== 3 || row.querySelectorAll("button").length !== 3) return;
    row.setAttribute("data-wb-asset-row", "");
    preview.setAttribute("data-wb-asset-preview", "");
    const filename = row.children[1] as HTMLElement;
    filename.title = filename.textContent ?? "";
  });
  document
    .querySelectorAll<HTMLLabelElement>("main label[for]")
    .forEach((label) => {
      const control = document.getElementById(label.htmlFor);
      if (!control) return;
      const name = control.getAttribute("name") || "";
      const hintId = `${label.htmlFor}-wb-purpose`;
      const existing = label.querySelector<HTMLElement>(
        "[data-wb-field-badge]",
      );
      let hint = document.getElementById(hintId);
      if (!screenReaderFields.has(name)) {
        existing?.remove();
        hint?.remove();
        delete label.dataset.wbFieldKind;
        control.removeAttribute("data-wb-screen-reader");
        const other = (control.getAttribute("aria-describedby") || "")
          .split(" ")
          .filter((id) => id && id !== hintId);
        if (other.length)
          control.setAttribute("aria-describedby", other.join(" "));
        else control.removeAttribute("aria-describedby");
        return;
      }
      const help =
        cmsText("Read aloud by screen readers. Not displayed as website text.", "Озвучивается скринридерами. Не отображается как текст на сайте.");
      label.dataset.wbFieldKind = "screen-reader";
      control.setAttribute("data-wb-screen-reader", "");
      const badge = existing || document.createElement("span");
      badge.setAttribute("data-wb-field-badge", "");
      badge.title = help;
      const badgeText = cmsText("Screen reader only", "Только для скринридера");
      if (badge.textContent !== badgeText) badge.textContent = badgeText;
      if (!existing) label.appendChild(badge);
      if (!hint) {
        hint = document.createElement("small");
        hint.id = hintId;
        hint.className = "wb-field-purpose";
        label.parentElement?.insertAdjacentElement("afterend", hint);
      }
      if (hint.textContent !== help) hint.textContent = help;
      const describedBy = new Set(
        (control.getAttribute("aria-describedby") || "")
          .split(" ")
          .filter(Boolean),
      );
      describedBy.add(hintId);
      control.setAttribute("aria-describedby", [...describedBy].join(" "));
    });
}
