"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContentMap } from "@/lib/cms/types";
import { useCountry } from "./CountryProvider";

const ContentContext = createContext<SiteContentMap | null>(null);

export function ContentProvider({
  content,
  children,
}: {
  content: SiteContentMap;
  children: ReactNode;
}) {
  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useSiteContent() {
  const content = useContext(ContentContext);
  const { pageCountry, pageLanguage } = useCountry();
  if (!content) throw new Error("ContentProvider is required");
  const page = content[`${pageCountry.code}:${pageLanguage}`];
  if (!page)
    throw new Error(
      `No published site page for ${pageCountry.code}/${pageLanguage}`,
    );
  return page;
}
