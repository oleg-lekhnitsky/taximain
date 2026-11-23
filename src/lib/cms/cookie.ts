import type { RichBlock } from "../news";

export const cookiePolicyUrl =
  "https://legal.wildberries.ru/privacypolicy/country/ru/lang/ru/";

export function legacyCookieMessage(
  before: string,
  after: string,
): RichBlock[] {
  return [
    {
      type: "paragraph",
      children: [
        { type: "text", text: before },
        {
          type: "link",
          url: cookiePolicyUrl,
          children: [{ type: "text", text: "cookies" }],
        },
        { type: "text", text: after },
      ],
    },
  ];
}
