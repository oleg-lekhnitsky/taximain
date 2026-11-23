"use client";

import { useEffect, type RefObject } from "react";

// Measure the browser's balanced word layout without rebuilding its lines.
export default function useHeadingLines(
  ref: RefObject<HTMLElement | null>,
  text: string,
) {
  useEffect(() => {
    const heading = ref.current;
    if (!heading) return;
    let active = true;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!active) return;
      const words = [
        ...heading.querySelectorAll<HTMLElement>("[data-heading-word]"),
      ];
      const rows = [...new Set(words.map((word) => word.offsetTop))].sort(
        (a, b) => a - b,
      );
      words.forEach((word) => {
        word.style.setProperty(
          "--line-delay",
          `${rows.indexOf(word.offsetTop) * 120}ms`,
        );
      });
      heading.dataset.linesReady = "true";
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    document.fonts.ready.then(() => {
      if (!active) return;
      measure();
      resize.observe(heading);
    });
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [ref, text]);
}
