"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

export default function FaqItem({
  question,
  children,
  defaultExpanded = false,
}: {
  question: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panel = useRef<HTMLDivElement>(null);
  const answer = useRef<HTMLDivElement>(null);
  const id = useId();

  function toggle() {
    const element = panel.current;
    if (!element || !answer.current) return;
    const from = element.getBoundingClientRect().height;
    const next = !expanded;
    element.style.transition = "none";
    element.style.height = `${from}px`;
    void element.offsetHeight;
    element.style.transition = "";
    element.style.height = next
      ? `${answer.current.getBoundingClientRect().height}px`
      : "0px";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.height = next ? "auto" : "0px";
    }
    setExpanded(next);
  }

  return (
    <div className="faq-card" data-expanded={expanded}>
      <button
        id={`${id}-question`}
        type="button"
        className="faq-toggle"
        aria-expanded={expanded}
        aria-controls={`${id}-answer`}
        onClick={toggle}
      >
        <span className="faq-question">{question}</span>
        <Image
          src="/assets/images/faq-plus.svg"
          alt=""
          className="faq-plus"
          width={24}
          height={24}
        />
      </button>
      <div
        ref={panel}
        id={`${id}-answer`}
        className="faq-panel"
        style={defaultExpanded ? { height: "auto" } : undefined}
        role="region"
        aria-labelledby={`${id}-question`}
        aria-hidden={!expanded}
        inert={!expanded}
        onTransitionEnd={(event) => {
          if (
            event.target === panel.current &&
            event.propertyName === "height" &&
            expanded
          )
            panel.current.style.height = "auto";
        }}
      >
        <div ref={answer} className="faq-answer">
          {children}
        </div>
      </div>
    </div>
  );
}
