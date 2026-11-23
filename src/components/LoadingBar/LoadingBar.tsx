"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import styles from "./LoadingBar.module.scss";
import { usePageTransition } from "@/components/PageTransition/PageTransition";

function subscribeReady(callback: () => void) {
  window.addEventListener("load", callback);
  document.addEventListener("readystatechange", callback);
  return () => {
    window.removeEventListener("load", callback);
    document.removeEventListener("readystatechange", callback);
  };
}

export default function LoadingBar() {
  const { transitionPhase } = useCountry();
  const pageTransition = usePageTransition();
  const ready = useSyncExternalStore(
    subscribeReady,
    () => document.readyState === "complete",
    () => false,
  );
  const loading =
    !ready || transitionPhase !== "idle" || pageTransition.phase !== "idle";
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    let frame = 0;
    let timer = 0;

    if (loading) {
      element.dataset.state = "waiting";
      element.style.setProperty("--loading-progress", "0");
      element.removeAttribute("aria-valuenow");
      timer = window.setTimeout(() => {
        element.dataset.state = "loading";
        element.setAttribute("aria-hidden", "false");
        const start = performance.now();
        const update = (now: number) => {
          // Same asymptotic estimate as Nuxt: only completion reaches 100%.
          const progress = (2 / Math.PI) * Math.atan((now - start) / 1000);
          element.style.setProperty(
            "--loading-progress",
            String(Math.min(progress, 0.99)),
          );
          frame = requestAnimationFrame(update);
        };
        frame = requestAnimationFrame(update);
      }, 200);
    } else if (element.dataset.state === "loading") {
      element.style.setProperty("--loading-progress", "1");
      element.setAttribute("aria-valuenow", "100");
      element.dataset.state = "complete";
      timer = window.setTimeout(() => {
        element.dataset.state = "hidden";
        element.setAttribute("aria-hidden", "true");
      }, 500);
    } else {
      element.dataset.state = "hidden";
      element.setAttribute("aria-hidden", "true");
    }

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [loading]);

  return (
    <div
      ref={bar}
      className={styles.bar}
      data-state="hidden"
      role="progressbar"
      aria-label="Загрузка страницы"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-hidden="true"
    >
      <span className={styles.fill} />
    </div>
  );
}
