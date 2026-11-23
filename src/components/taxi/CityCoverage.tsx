"use client";

import { useCopy } from "@/components/CountrySwitcher/useCopy";
import Image from "next/image";
import styles from "./CityCoverage.module.scss";
import FlowHeading from "./FlowHeading";
import CityWheel from "./CityWheel";

export default function CityCoverage() {
  const copy = useCopy();
  return (
    <section
      id="cities"
      className={`section ${styles.section}`}
      aria-labelledby="cities-title"
    >
      <div className={styles.heading}>
        <FlowHeading as="p" className={styles.label} text={copy.daily} />
        <CityWheel />
      </div>
      <div className={styles.car} data-car-reveal>
        <Image
          className={styles.carBody}
          src="/assets/coverage/taxi.png"
          alt="WB Taxi"
          width={2048}
          height={816}
          sizes="(max-width: 1440px) 100vw, 1800px"
        />
        {[styles.rearWheel, styles.frontWheel].map((position) => (
          <span
            className={`${styles.carWheel} ${position}`}
            key={position}
            aria-hidden="true"
          >
            <Image
              className={styles.rim}
              src="/assets/coverage/wheel.png"
              alt=""
              width={413}
              height={413}
              loading="eager"
              unoptimized
            />
          </span>
        ))}
      </div>
    </section>
  );
}
