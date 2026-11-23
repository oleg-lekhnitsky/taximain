"use client";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import { useEffect } from "react";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import RichContent from "./RichContent";
import type { RichBlock } from "@/lib/news";
import ArticleHighlight from "./ArticleHighlight";
import TransitionLink from "@/components/PageTransition/TransitionLink";
import styles from "@/app/news/support/page.module.scss";

export default function SupportArticle({
  storyId = "support",
}: {
  storyId?: string;
}) {
  const { country, language } = useCountry();
  const { news } = useSiteContent();
  const story = news.find((story) => story.id === storyId);
  const a = story?.article;
  const title = story?.title || "";
  const description = story?.description || "";
  useEffect(() => {
    document.title = `${title} — WB Taxi`;
  }, [title]);
  if (!story) return null;
  if (!a || story.body !== undefined)
    return (
      <article className={styles.article} aria-labelledby="article-title">
        <h1 id="article-title" className={styles.title}>
          {title}
        </h1>
        <div className={styles.body}>
          <p>{description}</p>
          <EditableArticleBody blocks={story.body || []} />
        </div>
      </article>
    );
  return (
    <article className={styles.article} aria-labelledby="article-title">
      <h1 id="article-title" className={styles.title}>
        {title}
      </h1>
      <div className={styles.body}>
        <div className={styles.paragraphs}>
          <p>{description}</p>
          <p>{a[0]}</p>
          <p>
            {a[1]} <strong>{a[2]}</strong> {a[3]}
          </p>
        </div>
        <ArticleHighlight>
          <section
            className={styles.bodySection}
            aria-labelledby="get-help-title"
          >
            <h2 id="get-help-title">{a[4]}</h2>
            <p>
              {a[5]}{" "}
              <TransitionLink
                href={`/?country=${country.code}&lang=${language}#download`}
              >
                {a[6]}
              </TransitionLink>{" "}
              → <strong>{a[7]}</strong> → {a[8]} → <strong>{a[9]}</strong>.{" "}
              {a[10]}
            </p>
          </section>
        </ArticleHighlight>
        <section
          className={styles.bodySection}
          aria-labelledby="resolution-title"
        >
          <h2 id="resolution-title">{a[11]}</h2>
          <div className={styles.paragraphs}>
            <p>
              {a[12]} <strong>{a[13]}</strong>. {a[14]}
            </p>
            <p>{a[15]}</p>
          </div>
        </section>
        <div className={styles.paragraphs}>
          <p>{a[16]}</p>
          <p className={styles.signature}>{a[17]}</p>
        </div>
      </div>
    </article>
  );
}

function EditableArticleBody({ blocks }: { blocks: RichBlock[] }) {
  const groups: RichBlock[][] = [];
  for (const block of blocks) {
    if (!groups.length || block.type === "heading") groups.push([]);
    groups[groups.length - 1].push(block);
  }
  let headingIndex = 0;
  return groups.map((group, index) => {
    const heading = group[0]?.type === "heading";
    const content = <div className={heading ? styles.bodySection : styles.paragraphs}><RichContent blocks={group} /></div>;
    if (heading && headingIndex++ === 0) return <ArticleHighlight key={index}>{content}</ArticleHighlight>;
    return <div key={index}>{content}</div>;
  });
}
