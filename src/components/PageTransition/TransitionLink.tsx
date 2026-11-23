"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePageTransition } from "./PageTransition";

export default function TransitionLink(props: ComponentProps<typeof Link>) {
  const { navigate } = usePageTransition();
  return (
    <Link
      {...props}
      onNavigate={(event) => {
        let prevented = false;
        props.onNavigate?.({
          preventDefault: () => {
            prevented = true;
            event.preventDefault();
          },
        });
        if (prevented) return;
        const href = typeof props.href === "string" ? props.href : null;
        if (!href) return;
        const url = new URL(href, window.location.href);
        if (
          url.origin !== window.location.origin ||
          url.pathname === window.location.pathname
        )
          return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
