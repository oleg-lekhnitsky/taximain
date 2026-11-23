import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import type { RichBlock, RichInline, RichText } from "@/lib/news";
import type { CountryCode } from "@/lib/countries";
import type { LanguageCode } from "@/lib/languages";
import { localizedHref, safeHref } from "@/lib/cms/links";

type LinkLocale = { country: CountryCode; language: LanguageCode };

function inline(node: RichInline, linksNewTab = false, locale?: LinkLocale): ReactNode {
  if (node.type === "link")
    return (
      <a
        href={locale ? localizedHref(node.url, locale.country, locale.language) : safeHref(node.url)}
        target={linksNewTab ? "_blank" : undefined}
        rel={linksNewTab ? "noopener noreferrer" : undefined}
      >
        {node.children.map((child, i) => (
          <Fragment key={i}>{inline(child, linksNewTab, locale)}</Fragment>
        ))}
      </a>
    );
  const text = node as RichText;
  let result: ReactNode = text.text;
  if (text.bold) result = <strong>{result}</strong>;
  if (text.italic) result = <em>{result}</em>;
  if (text.underline) result = <u>{result}</u>;
  if (text.strikethrough) result = <s>{result}</s>;
  if (text.code) result = <code>{result}</code>;
  return result;
}
function block(node: RichBlock, linksNewTab = false, locale?: LinkLocale): ReactNode {
  const children = node.children?.map((child, i) => (
    <Fragment key={i}>
      {child.type === "text" || child.type === "link"
        ? inline(child as RichInline, linksNewTab, locale)
        : block(child as RichBlock, linksNewTab, locale)}
    </Fragment>
  ));
  switch (node.type) {
    case "heading": {
      const Tag = `h${Math.max(2, Math.min(node.level || 2, 6))}` as "h2";
      return <Tag>{children}</Tag>;
    }
    case "list":
      return node.format === "ordered" ? (
        <ol>{children}</ol>
      ) : (
        <ul>{children}</ul>
      );
    case "list-item":
      return <li>{children}</li>;
    case "image":
      return node.image ? (
        <Image
          src={safeHref(node.image.url)}
          alt={node.image.alternativeText || ""}
          width={node.image.width || 1200}
          height={node.image.height || 800}
          style={{ maxWidth: "100%", height: "auto" }}
          sizes="(max-width: 767px) calc(100vw - 32px), 676px"
        />
      ) : null;
    case "quote":
      return <blockquote>{children}</blockquote>;
    case "code":
      return (
        <pre>
          <code>{children}</code>
        </pre>
      );
    default:
      return <p>{children}</p>;
  }
}
export default function RichContent({
  blocks,
  linksNewTab = false,
  localizeLinks,
}: {
  blocks: RichBlock[];
  linksNewTab?: boolean;
  localizeLinks?: LinkLocale;
}) {
  return blocks.map((item, i) => (
    <Fragment key={i}>{block(item, linksNewTab, localizeLinks)}</Fragment>
  ));
}
