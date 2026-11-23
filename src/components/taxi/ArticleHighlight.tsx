import type { ReactNode } from "react";
import styles from "./ArticleHighlight.module.scss";

export default function ArticleHighlight({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <figure className={styles.highlight}>
      <div className={styles.content}>{children}</div>
      {attribution && (
        <figcaption className={styles.attribution}>{attribution}</figcaption>
      )}
    </figure>
  );
}
