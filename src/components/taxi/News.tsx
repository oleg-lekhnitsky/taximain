"use client";

import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import { languages, contentLanguage } from "@/lib/languages";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import { localizedHref } from "@/lib/cms/links";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import Image from "next/image";
import TransitionLink from "@/components/PageTransition/TransitionLink";
import Carousel from "@/components/Carousel/Carousel";
import styles from "./News.module.scss";

export default function News({
  heading,
  id = "news",
  className = "",
}: {
  heading?: string;
  id?: string;
  className?: string;
}) {
  const copy = useCopy();
  const { country, language } = useCountry();
  const { news: stories } = useSiteContent();
  if (!stories.length) return null;

  return (
    <section
      id={id}
      className={`section carousel-section ${styles.section} ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <h2 id={`${id}-title`}>
        <span className="section-heading-line">
          {heading || (id === "related-news" ? copy.related : copy.news)}
        </span>
      </h2>
      <Carousel label={copy.news} trackClassName={styles.track}>
        {stories.map((story) => (
          <article key={story.id} className={styles.card}>
            <div className={styles.photo}>
              <Image
                src={story.image}
                alt={story.alt}
                fill
                sizes="(max-width: 767px) 85vw, 464px"
                draggable={false}
              />
              {story.date && (
                <time className={styles.date} dateTime={story.dateTime}>
                  {new Intl.DateTimeFormat(
                    languages[contentLanguage(language)].locale,
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  ).format(new Date(`${story.dateTime}T12:00:00Z`))}
                </time>
              )}
            </div>
            <div className={styles.copy}>
              <h3>
                {story.href ? (
                  <TransitionLink
                    href={localizedHref(story.href, country.code, language)}
                    data-carousel-link
                    draggable={false}
                  >
                    {story.title}
                  </TransitionLink>
                ) : (
                  story.title
                )}
              </h3>
              <p>{story.description}</p>
            </div>
          </article>
        ))}
      </Carousel>
    </section>
  );
}
