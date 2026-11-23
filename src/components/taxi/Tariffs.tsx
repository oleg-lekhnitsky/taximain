"use client";
import { useEffect, useState } from "react";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import { countries, type CountryCode } from "@/lib/countries";
import TransitionLink from "@/components/PageTransition/TransitionLink";
import { type LanguageCode } from "@/lib/languages";
import {
  getTariffCopy,
  tariffSectionLabel,
  tariffCountryName,
} from "@/lib/tariffs/copy";
import { cleanTariffTitle } from "@/lib/tariffs/format";
import type { CountryTariffs } from "@/lib/tariffs/types";
import FaqItem from "./FaqItem";
import TariffText from "./TariffText";
import styles from "./Tariffs.module.scss";

export default function Tariffs({
  documents,
  initialCountry,
  initialLanguage,
}: {
  documents: CountryTariffs;
  initialCountry: CountryCode;
  initialLanguage: LanguageCode;
}) {
  const {
    country: displayedCountry,
    language: displayedLanguage,
    pageReady,
  } = useCountry();
  const country = pageReady
    ? displayedCountry
    : countries.find((country) => country.code === initialCountry)!;
  const language = pageReady ? displayedLanguage : initialLanguage;
  const copy = getTariffCopy(language);
  const countryDocument = documents[country.code];
  const document = countryDocument?.translations?.[language] ?? countryDocument;
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (!document) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = document.sections[0]?.id ?? "";
      for (const section of document.sections) {
        const element = window.document.getElementById(section.id);
        if (!element) continue;
        const inset = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
        if (element.getBoundingClientRect().top <= inset + 1) current = section.id;
      }
      if (
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >=
          window.document.documentElement.scrollHeight - 2
      ) {
        current = document.sections.at(-1)?.id ?? current;
      }
      setActiveSection(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [document]);
  const downloadHref = `/?country=${country.code}&lang=${language}#download`;
  return (
    <section
      id="tariffs"
      className={`section ${styles.page}`}
      aria-labelledby="tariffs-title"
    >
      <div className={`${styles.intro} ${document ? styles.withSidebar : ""}`}>
        <h1 id="tariffs-title" className={styles.title}>
          {copy.title}{" "}
          <span className={styles.country}>
            {tariffCountryName(country.code, language)}
          </span>
        </h1>
      </div>
      {document ? (
        <>
          <div className={styles.layout}>
            <nav className={styles.navigation} aria-label={copy.cities}>
              {document.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-current={
                    (activeSection || document.sections[0]?.id) === section.id
                      ? "location"
                      : undefined
                  }
                >
                  {tariffSectionLabel(section.title, language)}
                </a>
              ))}
            </nav>
            <div className={styles.sections}>
              {document.sections.map((section) => (
                <section
                  className={styles.city}
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                >
                  <h2 id={`${section.id}-title`}>
                    {tariffSectionLabel(section.title, language)}
                  </h2>
                  {section.text && <div className={styles.text} lang={document.language}><TariffText text={section.text} /></div>}
                  <div className={styles.cards}>
                    {section.entries.map((entry, index) =>
                      entry.title ? (
                        <FaqItem
                          key={index}
                          question={
                            <span lang={document.language}>
                              {cleanTariffTitle(entry.title)}
                            </span>
                          }
                        >
                          <div className={styles.text} lang={document.language}>
                            <TariffText text={entry.body} />
                          </div>
                        </FaqItem>
                      ) : (
                        <div
                          key={index}
                          className={styles.text}
                          lang={document.language}
                        >
                          <TariffText text={entry.body} />
                        </div>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
          <TransitionLink href={downloadHref}>
            {copy.download} <span aria-hidden="true">↗</span>
          </TransitionLink>
        </div>
      )}
    </section>
  );
}
