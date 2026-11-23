"use client";

import { useId, useRef, type ReactNode } from "react";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import Image from "next/image";
import useCarousel from "./useCarousel";
import styles from "./Carousel.module.scss";

type CarouselProps = {
  label: string;
  children: ReactNode;
  trackClassName?: string;
};

export default function Carousel({
  label,
  children,
  trackClassName,
}: CarouselProps) {
  const copy = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  useCarousel(root);

  return (
    <div
      ref={root}
      className={styles.root}
      role="region"
      aria-label={label}
      aria-roledescription={copy.carousel[0]}
    >
      <div
        id={viewportId}
        className="delivery-carousel"
        tabIndex={0}
        aria-label={label}
      >
        <div
          className={["carousel-track", trackClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </div>
      </div>
      <div className="carousel-controls">
        <div
          role="progressbar"
          aria-label={copy.carousel[1]}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={0}
        />
        <div className="carousel-arrows">
          <button
            type="button"
            aria-label={copy.carousel[2]}
            data-carousel-previous
            aria-controls={viewportId}
          >
            <Image
              src="/assets/images/carousel-arrow.svg"
              alt=""
              width={17.3828}
              height={13.5234}
            />
          </button>
          <button
            type="button"
            aria-label={copy.carousel[3]}
            data-carousel-next
            aria-controls={viewportId}
          >
            <Image
              src="/assets/images/carousel-arrow.svg"
              alt=""
              width={17.3828}
              height={13.5234}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
