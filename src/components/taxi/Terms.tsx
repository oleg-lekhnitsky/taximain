"use client";

import { useCopy } from "@/components/CountrySwitcher/useCopy";
import Carousel from "@/components/Carousel/Carousel";
import FlowHeading from "./FlowHeading";

import Image from "next/image";
import styles from "./Terms.module.scss";

const slides = [
  {
    src: "/assets/carousel/tariffs.png",
  },
  {
    src: "/assets/carousel/arrival.png",
  },
  {
    src: "/assets/carousel/services.png",
  },
];

export default function Terms() {
  const copy = useCopy();
  return (
    <>
      <section
        id="sect-send"
        className="terms section carousel-section"
        aria-labelledby="terms-title"
      >
        {" "}
        <FlowHeading id="terms-title" className={styles.heading} text={copy.order} />
        <Carousel label={copy.carousel[0]} trackClassName={styles.track}>
          {slides.map((slide, index) => (
            <article
              key={slide.src}
              className={`term-card ${styles.imageCard}`}
            >
              <div className={styles.artwork}>
                <Image
                  src={slide.src}
                  alt={copy.features[index]}
                  width={1780}
                  height={1996}
                  sizes="(max-width: 767px) calc(85vw - 20px), 444px"
                  className={styles.image}
                  draggable={false}
                />
              </div>
              <h3 className={styles.caption}>{copy.features[index]}</h3>
            </article>
          ))}
        </Carousel>
      </section>
    </>
  );
}
