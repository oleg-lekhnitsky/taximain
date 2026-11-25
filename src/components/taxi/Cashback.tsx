"use client";

import { useCopy } from "@/components/CountrySwitcher/useCopy";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import FlowHeading from "./FlowHeading";
import MelonModel from "./MelonModel";
import styles from "./Cashback.module.scss";

export default function Cashback() {
  const copy = useCopy();
  const { cashbackRate, cashbackRateText } = useSiteContent();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      if (motion.matches) {
        panel.style.setProperty("--phone-parallax", "0px");
        return;
      }
      const bounds = panel.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(
          1,
          (bounds.top + bounds.height / 2 - innerHeight / 2) /
            ((innerHeight + bounds.height) / 2),
        ),
      );
      const distance = innerWidth < 768 ? 40 : 70;
      panel.style.setProperty("--phone-parallax", `${progress * distance}px`);
    };
    const schedule = () => {
      if (visible && !motion.matches && !frame) {
        frame = requestAnimationFrame(update);
      }
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (motion.matches) {
        panel.style.setProperty("--phone-parallax", "0px");
      } else if (visible) {
        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (entry.intersectionRatio >= 0.12) panel.dataset.light = "on";
        sync();
      },
      { threshold: [0, 0.12] },
    );
    observer.observe(panel);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", sync);
      panel.style.removeProperty("--phone-parallax");
    };
  }, []);

  return (
    <section
      id="cashback"
      className={`section ${styles.section}`}
      aria-labelledby="cashback-title"
    >
      <div ref={panelRef} className={styles.panel} data-light="off">
        <div className={styles.phoneStage}>
          <Image
            className={styles.phone}
            src="/assets/cashback/phone.png"
            alt=""
            width={1050}
            height={1659}
            sizes="(max-width: 767px) 360px, 550px"
          />
        </div>
        <MelonModel className={styles.melon} />
        <MelonModel className={`${styles.melon} ${styles.foregroundMelon}`} foreground />
        <div className={styles.intro}>
          <FlowHeading
            id="cashback-title"
            className={styles.heading}
            text={copy.cashback}
          />
          <p className={styles.subtitle}>{copy.cashbackSubtitle}</p>
          <div className={styles.rate} data-suffix={copy.upToAfter}>
            {cashbackRateText ? <span>{cashbackRateText}</span> : <><span className={styles.upTo}>{copy.upTo}</span><span className={styles.percentage}>{cashbackRate}</span></>}
          </div>
        </div>
        <div className={styles.footer}>
          <p className={styles.terms}>{copy.cashbackTerms}</p>
        </div>
      </div>
    </section>
  );
}
