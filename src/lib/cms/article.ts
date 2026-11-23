import type { RichBlock, RichInline, RichText } from "../news";

/** Convert the original support copy into editable paragraphs and headings. */
export function supportArticleBody(a: readonly string[], country: string, language: string): RichBlock[] {
  const text = (value: string, bold = false): RichText => ({ type: "text", text: value, ...(bold ? { bold: true } : {}) });
  const paragraph = (...children: RichInline[]): RichBlock => ({ type: "paragraph", children });
  const heading = (value: string): RichBlock => ({ type: "heading", level: 2, children: [text(value)] });
  return [
    paragraph(text(a[0])),
    paragraph(text(`${a[1]} `), text(a[2], true), text(` ${a[3]}`)),
    heading(a[4]),
    paragraph(text(`${a[5]} `), { type: "link", url: `/?country=${country}&lang=${language}#download`, children: [text(a[6])] }, text(" → "), text(a[7], true), text(` → ${a[8]} → `), text(a[9], true), text(`. ${a[10]}`)),
    heading(a[11]),
    paragraph(text(`${a[12]} `), text(a[13], true), text(`. ${a[14]}`)),
    paragraph(text(a[15])), paragraph(text(a[16])), paragraph(text(a[17])),
  ];
}
