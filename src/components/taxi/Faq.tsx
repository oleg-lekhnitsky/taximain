"use client";
import { useCountry } from "@/components/CountrySwitcher/CountryProvider";
import TransitionLink from "@/components/PageTransition/TransitionLink";
import { useSiteContent } from "@/components/CountrySwitcher/ContentProvider";
import { localizedHref } from "@/lib/cms/links";
import { useCopy } from "@/components/CountrySwitcher/useCopy";
import RichContent from "./RichContent";
import FlowHeading from "./FlowHeading";
import FaqItem from "./FaqItem";
import styles from "./Faq.module.scss";

function BrandQuestion({ text }: { text: string }) {
  const [before, after] = text.split("wb taxi");
  return (
    <>
      {before}
      {after !== undefined && (
        <>
          w<span className="brand-glyph">b</span> t
          <span className="brand-glyph">a</span>xi{after}
        </>
      )}
    </>
  );
}
export default function Faq() {
  const copy = useCopy();
  const { faqs } = useSiteContent();
  const { country, language } = useCountry();
  return (
    <section
      id="sect-faqs"
      className={`faq section ${styles.layout}`}
      aria-labelledby="faq-title"
    >
      <FlowHeading id="faq-title" text={copy.faqTitle} />
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <FaqItem key={index} question={<BrandQuestion text={faq.question} />}>
            {faq.answerContent ? <RichContent blocks={faq.answerContent} localizeLinks={{ country: country.code, language }} /> : faq.answer}
            {!faq.answerContent && faq.linkHref && faq.linkLabel && (
              <>
                {faq.answer ? " " : ""}
                <TransitionLink
                  href={localizedHref(faq.linkHref, country.code, language)}
                >
                  {faq.linkLabel}
                </TransitionLink>
              </>
            )}
          </FaqItem>
        ))}
      </div>
    </section>
  );
}
