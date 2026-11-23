import { useEffect, useState } from "react";
import { Button } from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import type { PanelComponent } from "@strapi/content-manager/strapi-admin";
const models = new Set(["api::site-page.site-page", "api::news-story.news-story", "api::tariff-document.tariff-document", "api::shared-setting.shared-setting"]);
type Warning = { code: string; en: string; ru: string; path?: string };
function Checks({ model, documentId, version }: { model: string; documentId?: string; version?: unknown }) {
  const { post } = useFetchClient();
  const ru = useIntl().locale.startsWith("ru");
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!documentId) return;
    let active = true;
    setBusy(true);setError(false);
    post<{ warnings: Warning[] }>("/wb-content/checks", { model, documentId }).then(reply => { if (active) setWarnings(reply.data.warnings); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [model, documentId, version, revision, post]);
  return <div className="wb-content-checks">
    <p>{ru ? "Проверяется последний сохранённый черновик. Внешние ссылки проверяются по формату, без запроса к сайту." : "Checks the last saved draft. External URLs are checked for valid syntax, not availability."}</p>
    {!documentId ? <p>{ru ? "Сначала сохраните запись." : "Save this entry first."}</p> : <>
      {error ? <p role="alert">{ru ? "Не удалось выполнить проверку." : "Checks could not be completed."}</p> : !busy && !warnings.length ? <p>{ru ? "Замечаний нет." : "No issues found."}</p> : <ul>{warnings.map((warning,index) => <li key={`${warning.code}-${index}`}>{ru ? warning.ru : warning.en}</li>)}</ul>}
      <Button size="S" variant="secondary" loading={busy} onClick={() => setRevision(value => value + 1)}>{ru ? "Проверить ещё раз" : "Check again"}</Button>
    </>}
    {model === "api::site-page.site-page" && <p>{ru ? "Главное изображение: от 2880 px по ширине. Отличающиеся тексты страницы сохраняются как локальные переопределения общих настроек." : "Hero source: at least 2880px wide. Page-specific wording overrides shared settings."}</p>}
    {model === "api::news-story.news-story" && <p>{ru ? "Изображение новости: от 928 × 626 px. Изображения внутри статьи: от 1352 px по ширине." : "News image: at least 928 × 626px. Article images: at least 1352px wide."}</p>}
  </div>;
}
export const ContentChecksPanel: PanelComponent = ({ model, documentId, document }) => models.has(model) ? { title: globalThis.document.documentElement.lang.startsWith("ru") ? "Проверка контента" : "Content checks", content: <Checks model={model} documentId={documentId} version={document?.updatedAt} /> } : null;
