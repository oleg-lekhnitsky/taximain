"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PreviewBridge.module.scss";

export default function PreviewBridge({
  cmsOrigin,
  initialRevision,
}: {
  cmsOrigin: string;
  initialRevision: string;
}) {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    let revision: string | undefined = initialRevision;
    let active = true;
    let checking = false;
    let requestedSection = "";
    const check = async () => {
      if (checking || document.hidden) return;
      checking = true;
      try {
        const response = await fetch("/api/cms-preview/status", {
          cache: "no-store",
        });
        if (!active) return;
        if (!response.ok) {
          if (response.status === 401) setExpired(true);
          return;
        }
        setExpired(false);
        const next = await response.json();
        if (revision && revision !== next.updatedAt) router.refresh();
        revision = next.updatedAt;
      } catch {
        /* Keep the current preview during a local server restart. */
      } finally {
        checking = false;
      }
    };
    const message = (event: MessageEvent) => {
      if (event.origin !== cmsOrigin || event.source !== window.parent) return;
      if (event.data?.type === "wb-preview:refresh") router.refresh();
      if (event.data?.type === "wb-preview:section" && ["sect-hero", "sect-send", "cities", "cashback", "download", "sect-faqs", "news", "foot"].includes(event.data.id)) {
        const id = String(event.data.id);
        requestedSection = id;
        void document.fonts.ready.then(() => {
          requestAnimationFrame(() => {
            if (active && requestedSection === id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });
      }
    };
    window.addEventListener("message", message);
    window.parent.postMessage({ type: "wb-preview:ready" }, cmsOrigin);
    void check();
    const timer = window.setInterval(() => {
      void check();
    }, 2500);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("message", message);
    };
  }, [cmsOrigin, initialRevision, router]);
  return (
    <aside className={styles.notice} aria-label="Draft preview">
      <span>
        {expired
          ? "Preview expired — reopen from the CMS"
          : "Draft preview · updates after saving"}
      </span>
      <a href="/api/cms-preview/exit">Exit preview</a>
    </aside>
  );
}
