"use client";

import { Fragment, useRef } from "react";
import useHeadingLines from "./useHeadingLines";

function words(text: string) {
  return text
    .split(/([ \t\n]+)/)
    .filter(Boolean)
    .map((word, index) =>
      /^[ \t\n]+$/.test(word) ? (
        <Fragment key={index}>{word}</Fragment>
      ) : (
        <span data-heading-word key={index}>
          {word}
        </span>
      ),
    );
}

export default function FlowHeading({
  text,
  as: Tag = "h2",
  id,
  className = "",
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useHeadingLines(ref, text);
  return (
    <Tag ref={ref} id={id} className={`flow-heading ${className}`}>
      {text
        .trim()
        .replace(/[ \t\r\n]+/g, " ")
        .split(/(\*\*[\s\S]+?\*\*)/)
        .map((part, index) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <span className="accent" key={index}>
              {words(part.slice(2, -2))}
            </span>
          ) : (
            <Fragment key={index}>{words(part)}</Fragment>
          ),
        )}
    </Tag>
  );
}
