import { cmsText } from "./translations";
import { countryLanguages } from "../content/languages";

/** Extend Strapi's existing link popover without replacing its editor. */
export function markLinkPresets() {
  document.querySelectorAll<HTMLInputElement>('input[name="url"]').forEach(input => {
    const field = input.parentElement;
    if (!field) return;
    const existing = field.querySelector<HTMLButtonElement>("[data-wb-download-preset]");
    if (existing) {
      const label = cmsText("↓ Download app", "↓ Скачать приложение");
      if (existing.textContent !== label) existing.textContent = label;
      existing.title = cmsText("Link to the download section for this content’s country and language", "Ссылка на скачивание приложения с учётом страны и языка материала");
      return;
    }
    // Blocks link popovers have these four inputs; do not touch other URL forms.
    let popover: HTMLElement | null = field;
    while (popover && !["BODY", "MAIN", "FORM"].includes(popover.tagName)) {
      if (popover.querySelector('input[name="text"]') && popover.querySelector('input[name="target"]')) break;
      popover = popover.parentElement;
    }
    if (!popover || ["BODY", "MAIN", "FORM"].includes(popover.tagName)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wb-link-preset";
    button.setAttribute("data-wb-download-preset", "");
    button.textContent = cmsText("↓ Download app", "↓ Скачать приложение");
    button.title = cmsText("Link to the download section for this content’s country and language", "Ссылка на скачивание приложения с учётом страны и языка материала");
    button.addEventListener("click", () => {
      const country = document.querySelector<HTMLElement>("[data-wb-country]")?.dataset.wbCountry;
      const language = document.querySelector<HTMLElement>("[data-wb-language]")?.dataset.wbLanguage;
      if (!country || !language || !countryLanguages[country]?.includes(language)) return;
      // Use the native setter so React sees the change and enables Save.
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, `/?country=${country}&lang=${language}#download`);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
    });
    field.appendChild(button);
  });
}
