import { cmsText } from "../translations";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";
import type { PanelComponent } from "@strapi/content-manager/strapi-admin";

const supported = new Set([
  "api::shared-setting.shared-setting",
  "api::site-page.site-page",
  "api::news-story.news-story",
  "api::tariff-document.tariff-document",
]);

function SavedDraftPreview({
  model,
  documentId,
  version,
}: {
  model: string;
  documentId?: string;
  version?: unknown;
}) {
  const { post } = useFetchClient();
  const [section, setSection] = useState("sect-hero");
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(900);
  const frame = useRef<HTMLIFrameElement>(null);
  const closing = useRef(false);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!url || !viewport.current) return;
    const element = viewport.current;
    const resize = new ResizeObserver(() => {
      const nextScale = Math.min(
        1,
        element.clientWidth / (mode === "desktop" ? 1440 : 390),
      );
      setScale(nextScale);
      setHeight(Math.ceil(element.clientHeight / Math.max(nextScale, 0.1)));
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, [mode, url]);
  useEffect(() => {
    if (!url) return;
    const ready = (event: MessageEvent) => {
      if (event.origin === new URL(url).origin && event.source === frame.current?.contentWindow && event.data?.type === "wb-preview:ready") {
        frame.current?.contentWindow?.postMessage({ type: "wb-preview:section", id: section }, new URL(url).origin);
      }
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [url, section]);
  useEffect(() => {
    if (!url) return;
    frame.current?.contentWindow?.postMessage(
      { type: "wb-preview:refresh" },
      new URL(url).origin,
    );
  }, [version, url]);
  useEffect(() => {
    setUrl(undefined);
    setExpanded(false);
    setError("");
  }, [model, documentId]);
  useEffect(() => {
    if (model !== "api::site-page.site-page") return;
    const navigate = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id || !["sect-hero", "sect-send", "cities", "cashback", "download", "sect-faqs", "news", "foot"].includes(id)) return;
      setSection(id);
      if (url) frame.current?.contentWindow?.postMessage({ type: "wb-preview:section", id }, new URL(url).origin);
      else void open();
    };
    window.addEventListener("wb-preview:open-section", navigate);
    return () => window.removeEventListener("wb-preview:open-section", navigate);
  }, [model, documentId, url]);
  async function open() {
    if (!documentId) return;
    setBusy(true);
    setError("");
    try {
      const result = await post<{ url: string }>("/wb-preview/session", {
        model,
        documentId,
      });
      setUrl(result.data.url);
    } catch (cause) {
      const message = (
        cause as {
          response?: { data?: { error?: { message?: string } | string } };
        }
      ).response?.data?.error;
      setError(
        typeof message === "string"
          ? message
          : message?.message ||
              "Could not open preview. Check that both servers are running.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="wb-preview-help">
        {documentId
          ? cmsText("Saved changes appear automatically in the preview.", "Сохранённые изменения автоматически появляются в предпросмотре.")
          : cmsText("Save this entry once to open its preview.", "Сначала сохраните запись, чтобы открыть предпросмотр.")}
      </p>
      <Button onClick={open} disabled={!documentId || busy} loading={busy}>
        {cmsText("Open live preview", "Открыть предпросмотр")}
      </Button>
      {error && (
        <p role="alert" className="wb-preview-error">
          {error}
        </p>
      )}
      {url &&
        createPortal(
          <aside
            className={`wb-preview-panel${expanded ? " is-expanded" : ""}`}
            aria-label="WB Taxi live preview"
          >
            <div className="wb-preview-toolbar">
              <strong>{cmsText("Draft preview", "Предпросмотр черновика")}</strong>
              <div className="wb-preview-controls">
                <button
                  type="button"
                  aria-pressed={mode === "desktop"}
                  onClick={() => setMode("desktop")}
                >
                  {cmsText("Desktop", "Компьютер")}
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "mobile"}
                  onClick={() => setMode("mobile")}
                >
                  {cmsText("Mobile", "Телефон")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (frame.current) frame.current.src = url;
                  }}
                >
                  {cmsText("Refresh", "Обновить")}
                </button>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? cmsText("Compact", "Свернуть") : cmsText("Expand", "Развернуть")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!frame.current) {
                      setUrl(undefined);
                      return;
                    }
                    closing.current = true;
                    frame.current.src = new URL(
                      "/api/cms-preview/exit",
                      url,
                    ).href;
                  }}
                  aria-label="Close live preview"
                >
                  {cmsText("Close", "Закрыть")}
                </button>
              </div>
            </div>
            {(model === "api::site-page.site-page" || model === "api::shared-setting.shared-setting") && <select className="wb-preview-sections" aria-label={cmsText("Preview section", "Раздел предпросмотра")} value={section} onChange={event => {
              const next = event.target.value; setSection(next);
              frame.current?.contentWindow?.postMessage({ type: "wb-preview:section", id: next }, new URL(url).origin);
            }}>
              {[["sect-hero", "Hero", "Главный экран"], ["sect-send", "Benefits", "Преимущества"], ["cities", "Cities", "Города"], ["cashback", "Cashback", "Кешбэк"], ["download", "Download", "Скачивание"], ["sect-faqs", "FAQ", "Вопросы и ответы"], ["news", "News", "Новости"], ["foot", "Footer", "Подвал"]].map(([id,en,ru]) => <option key={id} value={id}>{cmsText(en,ru)}</option>)}
            </select>}
            <p className="wb-preview-caption">
              {cmsText("Saved draft · updates after Save", "Черновик · обновляется после сохранения")}
            </p>
            <div className="wb-preview-viewport" ref={viewport}>
              <iframe
                ref={frame}
                src={url}
                onLoad={() => {
                  frame.current?.contentWindow?.postMessage({ type: "wb-preview:section", id: section }, new URL(url).origin);
                  if (closing.current) {
                    closing.current = false;
                    setUrl(undefined);
                  }
                }}
                title="Saved draft website preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                style={{
                  width: mode === "desktop" ? 1440 : 390,
                  height,
                  transform: `scale(${scale})`,
                }}
              />
            </div>
          </aside>,
          document.body,
        )}
    </>
  );
}

export const LivePreviewPanel: PanelComponent = ({
  model,
  documentId,
  document,
}) =>
  supported.has(model)
    ? {
        title: cmsText("Live preview", "Предпросмотр"),
        content: (
          <SavedDraftPreview
            model={model}
            documentId={documentId}
            version={document?.updatedAt}
          />
        ),
      }
    : null;
