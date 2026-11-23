import { cmsText } from "./translations";
const names: Record<string, string> = { headerSection: "sect-hero", heroSection: "sect-hero", featuresSection: "sect-send", citiesSection: "cities", cashbackSection: "cashback", downloadSection: "download", faqSection: "sect-faqs", newsSection: "news", footerSection: "foot", cookieSection: "foot" };
export function markPreviewSections() {
  if (!location.pathname.includes("api::site-page.site-page")) return;
  document.querySelectorAll<HTMLLabelElement>('label[data-wb-section-title]').forEach(label => {
    const control = label.htmlFor ? document.getElementById(label.htmlFor) : null;
    const name = control?.getAttribute("name") ?? "";
    const text = label.dataset.wbOriginalLabel ?? label.textContent ?? "";
    const numbered = text.match(/^0([1-7])\./)?.[1];
    const target = names[name] ?? (numbered ? ["sect-hero", "sect-send", "cities", "cashback", "download", "sect-faqs", "news"][Number(numbered)-1] : /Footer|Подвал/.test(text) ? "foot" : /Header|Шапка/.test(text) ? "sect-hero" : undefined);
    if (!target) return;
    let button = label.querySelector<HTMLButtonElement>("[data-wb-preview-block]");
    const title = cmsText("Preview block", "Посмотреть блок");
    if (button) { if (button.textContent !== title) button.textContent = title; return; }
    button = document.createElement("button");button.type = "button";button.className = "wb-preview-block";button.setAttribute("data-wb-preview-block", "");button.textContent = title;
    button.addEventListener("click", event => { event.preventDefault();event.stopPropagation();window.dispatchEvent(new CustomEvent("wb-preview:open-section", { detail: { id: target } })); });
    label.appendChild(button);
  });
}
