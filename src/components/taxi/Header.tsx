"use client";
import Image from "next/image";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import { contentLanguage } from "@/lib/languages";
import { isPlaceholderUrl } from "@/lib/countries";

import { useCopy } from "@/components/CountrySwitcher/useCopy";
import { useEffect, useRef, useState } from "react";

import IconSwap from "@/components/IconSwap/IconSwap";
import TransitionLink from "@/components/PageTransition/TransitionLink";
import Logo from "@/components/Logo/Logo";
import styles from "./Header.module.scss";
import CountrySwitcher from "@/components/CountrySwitcher/CountrySwitcher";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";

const downloadAppLabels: Record<string, string> = {
  "ru": "скачать приложение",
  "hy": "ներբեռնել հավելվածը",
  "ka": "აპის ჩამოტვირთვა",
  "uz": "ilovani yuklab olish",
  "ky": "тиркемени жүктөп алуу",
  "be": "спампаваць праграму"
};

function HeaderLogo({
  white,
  className,
}: {
  white: boolean;
  className: string;
}) {
  return (
    <span
      className={`${styles.logoSwap} ${className}`}
      data-white={white}
      role="img"
      aria-label="WB Taxi"
    >
      <Logo
        variant="monochrome"
        alt=""
        loading="eager"
        className={styles.whiteLogo}
      />
      <Logo
        variant="light"
        alt=""
        loading="eager"
        className={styles.colorLogo}
      />
    </span>
  );
}

export default function Header({
  variant = "hero",
  homeHref = "",
}: {
  variant?: "hero" | "solid";
  homeHref?: string;
}) {
  const copy = useCopy();
  const { footerCopyright } = useSiteContent();
  const [appleDevice, setAppleDevice] = useState(false);
  const { pageCountry, pageLanguage } = useCountry();
  const partnersUrl = new URL(pageCountry.partnersUrl);
  partnersUrl.searchParams.set("country", pageCountry.code);
  partnersUrl.searchParams.set("lang", pageLanguage);
  const partnersHref = isPlaceholderUrl(partnersUrl)
    ? undefined
    : partnersUrl.href;
  const home = homeHref
    ? `${homeHref}?country=${pageCountry.code}&lang=${pageLanguage}`
    : "";
  const [open, setOpen] = useState(false);
  const [overHero, setOverHero] = useState(variant === "hero");
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const selectors = element.querySelectorAll<HTMLElement>(
      "[data-country-selector]",
    );
    const measure = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${element.offsetHeight}px`,
      );
      const selectorWidth = Math.max(
        0,
        ...[...selectors].map((selector) => selector.offsetWidth),
      );
      if (selectorWidth) {
        document.documentElement.style.setProperty(
          "--country-selector-width",
          `${selectorWidth}px`,
        );
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    selectors.forEach((selector) => observer.observe(selector));
    measure();
    const hero = document.getElementById("sect-hero");
    const heroObserver = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: `-${element.offsetHeight + 12}px 0px 0px 0px` },
    );
    if (hero) heroObserver.observe(hero);
    const close = () => setOpen(false);
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        menuButton.current?.getAttribute("aria-expanded") === "true"
      ) {
        close();
        menuButton.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 1024px)");
    desktop.addEventListener("change", close);
    document.addEventListener("keydown", escape);
    return () => {
      observer.disconnect();
      heroObserver.disconnect();
      desktop.removeEventListener("change", close);
      document.removeEventListener("keydown", escape);
    };
  }, [pageCountry.code, pageLanguage]);
  return (
    <>
      <div
        id="mobile-menu-backdrop"
        className={open ? "is-visible" : ""}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <header
        ref={header}
        lang={contentLanguage(pageLanguage)}
        data-over-hero={overHero}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
        className={styles.header}
      >
        {" "}
        <div className={styles.desktopShell}>
          {" "}
          <div className={styles.desktopToolbar}>
            {" "}
            <TransitionLink
              href={`${home}#sect-hero`}
              className={styles.desktopHome}
            >
              <HeaderLogo white={overHero} className={styles.desktopLogo} />
            </TransitionLink>{" "}
            <div className={styles.desktopActions}>
              <nav className={styles.navigation}>
                {" "}
                <TransitionLink
                  href={`${home}#sect-faqs`}
                  className={styles.navigationLink}
                >
                  {copy.faqNav}
                </TransitionLink>
                <a
                  href={partnersHref}
                  aria-disabled={!partnersHref || undefined}
                  className={styles.navigationLink}
                >
                  {copy.partners}
                </a>{" "}
              </nav>
              <div className={styles.selectorActions}>
              <CountrySwitcher />
              <TransitionLink
                href={`${home}#download`}
                className={styles.downloadButton}
                data-download-cta
              >
                {copy.downloadButton}
              </TransitionLink>
              </div>
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div
          id="mobile-header-shell"
          className={`${styles.mobileShell} ${open ? "menu-open" : ""}`}
        >
          {" "}
          <div className={styles.mobileInset}>
            {" "}
            <div id="mobile-header-toolbar" className={styles.mobileToolbar}>
              {" "}
              <TransitionLink
                href={`${home}#sect-hero`}
                className={styles.mobileHome}
              >
                <HeaderLogo
                  white={overHero && !open}
                  className={styles.mobileLogo}
                />
              </TransitionLink>
              <div className={styles.mobileActions}>
                <CountrySwitcher />
                <button
                  ref={menuButton}
                  onClick={() => {
                    setAppleDevice(/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent));
                    setOpen(!open);
                  }}
                  type="button"
                  className={styles.menuButton}
                  aria-label={open ? copy.closeMenu : copy.openMenu}
                  aria-expanded={open}
                  aria-controls="mobile-header-menu"
                >
                  {" "}
                  <IconSwap
                    active={open}
                    iconA={
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M3 5h18M3 12h18M3 19h18" />
                      </svg>
                    }
                    iconB={
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="m4 4 16 16M20 4 4 20" />
                      </svg>
                    }
                  />
                </button>
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <nav
            id="mobile-header-menu"
            aria-label={copy.navigation}
            aria-hidden={!open}
            inert={!open}
          >
            <div className={styles.mobileMenuActions}>
              <div className={styles.mobileMenuLinks}>
                <a href={partnersHref} aria-disabled={!partnersHref || undefined}
                  onClick={() => { if (partnersHref) setOpen(false); }}>
                  {copy.partners}
                </a>
                <TransitionLink href={`${home}#sect-faqs`} onClick={() => setOpen(false)}>
                  {copy.faqNav}
                </TransitionLink>
                <TransitionLink href={`/tariffs?country=${pageCountry.code}&lang=${pageLanguage}`} onClick={() => setOpen(false)}>
                  {copy.footer[0]}
                </TransitionLink>
              </div>
              <TransitionLink
                href={`/download?country=${pageCountry.code}&lang=${pageLanguage}`}
                className={`${styles.downloadButton} ${styles.mobileMenuDownload}`}
                data-download-cta
                onClick={() => setOpen(false)}
              >
                <span className={appleDevice ? styles.appleIcon : styles.playIcon}>
                  <Image src={`/assets/download/${appleDevice ? "apple" : "play"}-icon.svg`}
                    alt="" width={appleDevice ? 16.1169 : 19.2964} height={appleDevice ? 18 : 23.5034} />
                </span>
                {downloadAppLabels[pageLanguage] ?? copy.downloadButton}
              </TransitionLink>
            </div>
            <p className={styles.menuCopyright}>
              {footerCopyright ?? "© 2026\nООО «Оператор ВБ Такси»"}
            </p>
          </nav>
        </div>{" "}
      </header>
    </>
  );
}
