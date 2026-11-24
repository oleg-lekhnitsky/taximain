"use client";
import TransitionLink from "@/components/PageTransition/TransitionLink";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import { safeHref } from "@/lib/cms/links";
import { contentLanguage } from "@/lib/languages";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";

export default function Footer() {
  const copy = useCopy();
  const { sharedLinks, footerCopyright } = useSiteContent();
  const { pageCountry, pageLanguage } = useCountry();
  return (
    <footer id="foot" lang={contentLanguage(pageLanguage)}>
      <p style={{ whiteSpace: "pre-line" }}>{footerCopyright ?? "© 2026\nООО «Оператор ВБ Такси»"}</p>
      <nav aria-label={copy.legal}>
        <TransitionLink
          href={`/tariffs?country=${pageCountry.code}&lang=${pageLanguage}`}
        >
          {copy.footer[0]}
        </TransitionLink>
        {(["userAgreementUrl", "privacyPolicyUrl", "serviceRulesUrl"] as const).map((field, index) => sharedLinks?.[field] ? (
          <a key={field} href={safeHref(sharedLinks[field])}>{copy.footer[index + 1]}</a>
        ) : <span key={field}>{copy.footer[index + 1]}</span>)}
      </nav>
    </footer>
  );
}
