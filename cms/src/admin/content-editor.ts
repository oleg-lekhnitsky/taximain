/** Keep fields relevant to the chosen news type visible without clearing data. */
export function markContentEditor() {
  if (!document.querySelector('[data-wb-story-kind]')) return;
  document.querySelectorAll<HTMLLabelElement>("main label").forEach(label => {
    const control = label.htmlFor ? document.getElementById(label.htmlFor) : null;
    const name = control?.getAttribute("name");
    const text = label.dataset.wbOriginalLabel ?? label.textContent?.replace(/\*/g, "").trim();
    const kind = name === "href" || text === "href" || text === "Ссылка" ? "link"
      : name === "slug" || text === "slug" || text === "Адрес страницы" ? "slug"
      : name === "body" || text === "Article text" || text === "Текст статьи" ? "body" : null;
    if (!kind) return;
    let field = label.parentElement;
    while (field && field.tagName !== "MAIN") {
      const found = kind === "body" ? field.querySelector('[contenteditable="true"]') : field.querySelector(`input[name="${kind === "link" ? "href" : "slug"}"]`);
      if (found) { field.setAttribute("data-wb-news-field", kind); break; }
      field = field.parentElement;
    }
  });
}
