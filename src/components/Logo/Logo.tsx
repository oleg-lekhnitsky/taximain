import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "./Logo.module.scss";

const variants = {
  light: "/assets/logos/wb-taxi-light.svg",
  dark: "/assets/logos/wb-taxi-dark.svg",
  monochrome: "/assets/logos/wb-taxi-monochrome.svg",
} as const;

export type LogoVariant = keyof typeof variants;

export type LogoProps = {
  /** Light/dark refer to the background. Monochrome is the all-white logo. */
  variant?: LogoVariant;
  /** Defaults to 48px; responsive callers may set --logo-height through className. */
  height?: number;
  className?: string;
  alt?: string;
  loading?: "eager" | "lazy";
};

/** Exact Figma artwork, scaled proportionally without changing the SVG files. */
export default function Logo({
  variant = "light",
  height,
  className,
  alt = "WB Taxi",
  loading = "lazy",
}: LogoProps) {
  const style =
    height === undefined
      ? undefined
      : ({ "--logo-height": `${height}px` } as CSSProperties);

  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(" ")}
      style={style}
      data-logo-variant={variant}
    >
      <Image
        src={variants[variant]}
        alt={alt}
        loading={loading}
        fill
        sizes="200px"
        className={styles.artwork}
      />
    </span>
  );
}
