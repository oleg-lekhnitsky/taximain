"use client";

import { contentLanguage } from "@/lib/languages";
import type { ReactNode } from "react";
import { CountryPageScope, useCountry } from "./CountryProvider";
import SectionReveals from "@/components/taxi/SectionReveals";
import styles from "./CountryContent.module.scss";
import { usePageTransition } from "@/components/PageTransition/PageTransition";

export default function CountryContent({ children }: { children: ReactNode }) {
  const pageTransition = usePageTransition();
  const {
    pageCountry,
    pageLanguage,
    transitionPhase,
    finishCountryExit,
    finishCountryEnter,
  } = useCountry();

  return (
    <main
      id="body"
      key={`${pageCountry.code}-${pageLanguage}`}
      data-country-version={pageCountry.code}
      lang={contentLanguage(pageLanguage)}
      data-transition={
        pageTransition.phase !== "idle" ? pageTransition.phase : transitionPhase
      }
      onAnimationEnd={(event) => {
        // Movement finishes at 460ms; wait for the full 490ms fade before swapping.
        if (event.target === event.currentTarget && event.elapsedTime >= 0.49) {
          if (pageTransition.phase !== "idle") {
            if (pageTransition.phase === "enter") pageTransition.finishEnter();
            return;
          }
          if (transitionPhase === "exit") finishCountryExit();
          else if (transitionPhase === "enter") finishCountryEnter();
        }
      }}
      className={styles.content}
    >
      <CountryPageScope>
        {children}
        <SectionReveals />
      </CountryPageScope>
    </main>
  );
}
