"use client";

import RichContent from "./RichContent";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import styles from "./FloatingNotices.module.scss";

const key = "wb-track-cookie-notice-dismissed";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cookie-notice-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie-notice-change", callback);
  };
}
function isDismissed() {
  try {
    return localStorage.getItem(key) === "1" || dismissedInMemory;
  } catch {
    return dismissedInMemory;
  }
}
let dismissedInMemory = false;
export default function CookieNotice() {
  const copy = useCopy();
  const { cookieMessage } = useSiteContent();
  const { pageLanguage, pageCountry } = useCountry();
  const pathname = usePathname();
  const [showDownload, setShowDownload] = useState(false);
  useEffect(() => {
    const banner = document.getElementById("download");
    const inset =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--site-header-height",
        ),
      ) || 0;
    const update = () => {
      const bounds = banner?.getBoundingClientRect();
      setShowDownload(
        !bounds ||
          bounds.top >= window.innerHeight ||
          bounds.bottom <= inset + 12,
      );
    };
    const frame = requestAnimationFrame(update);
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${inset + 12}px 0px 0px 0px`,
    });
    if (banner) observer.observe(banner);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname, pageCountry.code, pageLanguage]);
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  function dismiss() {
    dismissedInMemory = true;
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* Continue when browser storage is blocked. */
    }
    window.dispatchEvent(new Event("cookie-notice-change"));
  }
  return (
    <div className={styles.stack}>
      <a
        className={styles.download}
        href="/download"
        aria-label={copy.qrAlt}
        title={copy.scanApp}
        data-visible={showDownload}
        aria-hidden={!showDownload}
        inert={!showDownload}
      >
        <span className={styles.qr}>
          <Image
            src="/api/download-qr?surface=soft"
            alt=""
            width={78}
            height={78}
            unoptimized
          />
          <span className={styles.mark} aria-hidden="true" />
        </span>
      </a>
      <aside
        className="compensation-cookies"
        id="cookiePolicyRoot"
        aria-label={copy.cookiesLabel}
        hidden={dismissed}
      >
        {" "}
        <RichContent blocks={cookieMessage} linksNewTab />
        <button type="button" onClick={dismiss}>
          <span>{copy.okay}</span>
        </button>{" "}
      </aside>
    </div>
  );
}
