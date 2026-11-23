"use client";

import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import Image from "next/image";
import FlowHeading from "./FlowHeading";
import Logo from "@/components/Logo/Logo";
import { useSyncExternalStore } from "react";
import { safeHref } from "@/lib/cms/links";
import { storeForUserAgent, appStores } from "@/lib/download";
import styles from "./AppDownload.module.scss";

const subscribeToPlatform = () => () => {};
const getPlatform = () => storeForUserAgent(navigator.userAgent);
const getServerPlatform = () => null;

export default function AppDownload() {
  const copy = useCopy();
  const { appDownloadButton, sharedLinks } = useSiteContent();
  const { country, language } = useCountry();
  const store = useSyncExternalStore(
    subscribeToPlatform,
    getPlatform,
    getServerPlatform,
  );
  const storeButtons = (
    <div className={styles.stores}>
      <a
        href={safeHref(sharedLinks?.googlePlayUrl || appStores.googlePlay)}
        aria-label={copy.play}
        data-platform-hidden={store === appStores.appStore}
      >
        <Image
          src="/assets/download/google-play.svg"
          alt="Google Play"
          width={119.906}
          height={37.4614}
        />
      </a>
      <a
        href={safeHref(sharedLinks?.appStoreUrl || appStores.appStore)}
        aria-label={copy.appStore}
        data-platform-hidden={store === appStores.googlePlay}
      >
        <Image
          src="/assets/download/app-store.svg"
          alt="App Store"
          width={112.737}
          height={37.4614}
        />
      </a>
    </div>
  );
  return (
    <section
      id="download"
      className={`section ${styles.section}`}
      aria-labelledby="download-title"
    >
      <div className={styles.panel}>
        <Image
          className={`${styles.photo} ${country.code === "kg" ? styles.kyrgyzPhoto : ""}`}
          src={
            country.code === "kg"
              ? "/assets/download/passenger2_ky4.webp"
              : "/assets/download/passenger.png"
          }
          alt=""
          fill
          sizes="100vw"
        />
        <div className={styles.content}>
          <div className={styles.cards}>
            <div className={styles.titleCard} data-banner-reveal>
              <FlowHeading id="download-title" text={copy.download} />
              <div className={styles.desktopLogo}>
                <Logo variant="monochrome" height={59} />
              </div>
              <a
                className={styles.downloadButton}
                href={store ? safeHref(store === appStores.appStore ? sharedLinks?.appStoreUrl || store : sharedLinks?.googlePlayUrl || store) : `/download?country=${country.code}&lang=${language}`}
                data-download-cta
              >
                {appDownloadButton}
              </a>
            </div>
            <div className={styles.qrCard} data-banner-reveal>
              <div className={styles.qr}>
                <Image
                  src={`/api/download-qr?country=${country.code}&lang=${language}`}
                  alt={copy.qrAlt}
                  width={202}
                  height={202}
                  unoptimized
                />
                <span className={styles.qrMark} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <div data-banner-reveal>{storeButtons}</div>
            <p className={styles.hint} data-banner-reveal>
              {copy.scan}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
