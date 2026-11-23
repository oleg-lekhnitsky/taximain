import type { RichBlock, RichInline } from "../news";
export function faqAnswer(answer: string, linkHref?: string, linkLabel?: string): RichBlock[] {
  const children: RichInline[] = [{ type: "text", text: answer }];
  if (linkHref && linkLabel) {
    if (answer) children.push({ type: "text", text: " " });
    children.push({ type: "link", url: linkHref, children: [{ type: "text", text: linkLabel }] });
  }
  return [{ type: "paragraph", children }];
}
