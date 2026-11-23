"use client";

import { useEffect } from "react";

export default function SectionReveals() {
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const headings = document.querySelectorAll<HTMLElement>("#body h2");
    const cards = [
      ...document.querySelectorAll<HTMLElement>(
        "#sect-faqs .faq-card, #download [data-banner-reveal], #cities [data-car-reveal]",
      ),
    ];

    const headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("heading-revealed");
          headingObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    headings.forEach((heading) => {
      heading
        .querySelectorAll<HTMLElement>(".section-heading-line")
        .forEach((line, index) => {
          line.style.setProperty("--heading-delay", `${index * 120}ms`);
        });
      heading.classList.add("heading-reveal-ready");
      headingObserver.observe(heading);
    });

    const cardObserver = new IntersectionObserver(
      (entries) => {
        let faqIndex = 0;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        visible.forEach((entry) => {
          if (entry.target.closest("#sect-faqs")) {
            (entry.target as HTMLElement).style.setProperty(
              "--card-delay",
              `${Math.min(faqIndex++, 2) * 120}ms`,
            );
          }
          entry.target.classList.add("card-revealed");
          cardObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    cards.forEach((card) => {
      const banner = card.closest("#download");
      const siblings = [
        ...(banner
          ? banner.querySelectorAll("[data-banner-reveal]")
          : (card.parentElement?.children ?? [])),
      ].filter((element) => cards.includes(element as HTMLElement));
      card.style.setProperty(
        "--card-delay",
        `${Math.min(siblings.indexOf(card), 2) * 120}ms`,
      );
      card.classList.add("card-reveal-ready");
      cardObserver.observe(card);
    });

    const disconnect = () => {
      headingObserver.disconnect();
      cardObserver.disconnect();
    };
    const revealAll = () => {
      disconnect();
      headings.forEach((heading) => heading.classList.add("heading-revealed"));
      cards.forEach((card) => card.classList.add("card-revealed"));
    };
    motion.addEventListener("change", revealAll);
    return () => {
      disconnect();
      motion.removeEventListener("change", revealAll);
      headings.forEach((heading) =>
        heading.classList.remove("heading-reveal-ready", "heading-revealed"),
      );
      cards.forEach((card) =>
        card.classList.remove("card-reveal-ready", "card-revealed"),
      );
    };
  }, []);
  return null;
}
