import type { ReactNode } from "react";
import styles from "./IconSwap.module.scss";

export default function IconSwap({
  active,
  iconA,
  iconB,
}: {
  active: boolean;
  iconA: ReactNode;
  iconB: ReactNode;
}) {
  return (
    <span className={styles.swap} data-active={active} aria-hidden="true">
      <span className={styles.icon} data-icon="a">
        {iconA}
      </span>
      <span className={styles.icon} data-icon="b">
        {iconB}
      </span>
    </span>
  );
}
