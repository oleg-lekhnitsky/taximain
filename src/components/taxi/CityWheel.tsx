"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import styles from "./CityCoverage.module.scss";

export default function CityWheel() {
  const { country } = useCountry();
  const { cities } = useSiteContent();
  const animated = cities.length > 4;
  const step = 360 / cities.length;
  const rollName = `city-roll-${cities.length}`;
  const rollFrames = `from { transform: rotateX(${step}deg); } to { transform: rotateX(${360 + step}deg); }`;
  const wheel = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const element = wheel.current;
    if (!element || !animated) return;
    let visible = false;
    const sync = () => {
      element.dataset.running = String(visible && !document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [animated, country.code]);

  if (!animated) {
    return (
      <h2 id="cities-title" className={`${styles.cities} ${styles.cityList}`}>
        {cities.map((city) => (
          <span key={city}>{city}</span>
        ))}
      </h2>
    );
  }

  return (
    <h2
      ref={wheel}
      id="cities-title"
      className={`${styles.cities} ${styles.wheel}`}
      aria-label={cities.join(", ")}
      data-running="false"
    >
      <style>{`@keyframes ${rollName} { ${rollFrames} }`}</style>
      <span
        className={styles.drum}
        style={{
          animationName: rollName,
          animationDuration: `${cities.length * 1.2}s`,
        }}
        aria-hidden="true"
      >
        {cities.map((city, index) => (
          <span
            key={`${city}-${index}`}
            className={styles.city}
            style={
              {
                "--city-index": index,
                "--city-angle": `${-index * step}deg`,
                "--city-offset": index % cities.length,
              } as CSSProperties
            }
          >
            <span>{city}</span>
          </span>
        ))}
      </span>
      <span className={styles.staticCities} aria-hidden="true">
        {cities.map((city) => (
          <span className={styles.staticCity} key={city}>
            {city}
          </span>
        ))}
      </span>
    </h2>
  );
}
