"use client";

import Image from "next/image";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import { useEffect, useState, type CSSProperties } from "react";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import FlowHeading from "./FlowHeading";
import downloadStyles from "./AppDownload.module.scss";
import styles from "./Hero.module.scss";

export default function Hero() {
  const copy = useCopy();
  const content = useSiteContent();
  const { country, language, pageReady, transitionPhase } = useCountry();
  const [fontsReady, setFontsReady] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);

  if (fontsReady && transitionPhase !== "exit" && !introStarted) {
    setIntroStarted(true);
  }

  useEffect(() => {
    if (!pageReady) return;
    let active = true;
    let frame = 0;
    Promise.allSettled([
      document.fonts.load('500 112px "WB Sans"'),
      document.fonts.ready,
    ]).then(() => {
      frame = requestAnimationFrame(() => {
        if (active) setFontsReady(true);
      });
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [pageReady]);

  return (
    <section
      id="sect-hero"
      aria-labelledby="hero-title"
      data-intro={introStarted ? "ready" : "pending"}
      style={
        {
          "--hero-background-position":
            country.code === "kg" ? "center" : "60% center",
        } as CSSProperties
      }
    >
      <div className={styles.backdrop}>
        {pageReady && <Image src={content.heroImage} alt="" fill preload sizes="(max-aspect-ratio: 16/9) 178svh, (min-width: 1920px) 1920px, 100vw" style={{ objectFit: "cover", objectPosition: country.code === "kg" ? "center" : "60% center" }} />}
      </div>
      <div className="hero-shell">
        <div className="hero-content">
          <div className="hero-copy">
            <FlowHeading as="h1" id="hero-title" text={copy.hero} />
            <a
              className={`${downloadStyles.downloadButton} ${styles.download}`}
              data-download-cta
              href={`/download?country=${country.code}&lang=${language}`}
            >
              {copy.downloadButton}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
