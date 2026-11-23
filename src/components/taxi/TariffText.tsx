import { cleanTariffBody } from "@/lib/tariffs/format";
import type { ReactNode } from "react";
// Render sheet text as text, never HTML. Only explicit web URLs become links.
function inlineLinks(text: string): ReactNode[] {
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s)]+)/g;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index!;
    if (start > cursor) parts.push(text.slice(cursor, start));
    const raw = match[2] ?? match[3];
    const url = raw.replace(/[.,;!?]+$/, "");
    const label = match[1] ?? url;
    parts.push(
      <a
        key={start}
        href={url.startsWith("www.") ? `https://${url}` : url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>,
    );
    if (!match[1] && raw.length > url.length) parts.push(raw.slice(url.length));
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}
export default function TariffText({ text }: { text: string }) {
  return (
    <>
      {cleanTariffBody(text)
        .split(/\n[\t ]*\n+/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph, index) => (
          <p key={index}>{inlineLinks(paragraph.replace(/\s*\n\s*/g, " "))}</p>
        ))}
    </>
  );
}
