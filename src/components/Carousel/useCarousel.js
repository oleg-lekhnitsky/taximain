"use client";

import { useEffect } from "react";

// Preserve the original measured-width carousel, including mouse drag and keyboard navigation.
export default function useCarousel(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const events = new AbortController();
    const listen = (target, type, callback, options = {}) => {
      target.addEventListener(type, callback, {
        ...options,
        signal: events.signal,
      });
    };

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const viewport = root.querySelector(".delivery-carousel");
    const track = viewport.querySelector(".carousel-track");
    const previous = root.querySelector('[data-carousel-previous]');
    const next = root.querySelector('[data-carousel-next]');
    const progress = root.querySelector('[role="progressbar"]');
    const carouselControls = root.querySelector(".carousel-controls");
    function updateCarousel() {
      const cards = [...track.querySelectorAll("article")];
      const layout = getComputedStyle(track);
      const gap = parseFloat(layout.columnGap) || 0;
      // In fitted mode use the page gutters, rather than the extra leading
      // offset that aligns a scrolling track with the narrower content column.
      const pageGutter =
        parseFloat(
          getComputedStyle(viewport).getPropertyValue("--page-gutter"),
        ) || 0;
      const available = viewport.clientWidth - pageGutter * 2;
      const contentWidth =
        cards.reduce(
          (width, card) => width + card.getBoundingClientRect().width,
          0,
        ) +
        gap * Math.max(0, cards.length - 1);
      const fits = contentWidth <= available + 0.5;
      viewport.classList.toggle("carousel-fits", fits);
      carouselControls.hidden = fits;
      viewport.tabIndex = fits ? -1 : 0;
      if (fits) {
        viewport.scrollLeft = 0;
        drag = null;
        dragged = false;
        viewport.classList.remove("is-dragging");
      }
      const max = viewport.scrollWidth - viewport.clientWidth;
      const value = max > 0 ? viewport.scrollLeft / max : 0;
      previous.disabled = viewport.scrollLeft <= 1;
      next.disabled = viewport.scrollLeft >= max - 1;
      progress.setAttribute("aria-valuenow", String(value));
      const positions = [];
      const firstLeft = cards[0]?.offsetLeft || 0;
      cards.forEach((card) => {
        const position = Math.min(
          Math.max(0, max),
          card.offsetLeft - firstLeft,
        );
        if (!positions.length || position - positions[positions.length - 1] > 1)
          positions.push(position);
      });
      if (progress.children.length !== positions.length) {
        progress.replaceChildren(
          ...positions.map(() => document.createElement("span")),
        );
      }
      const activeIndex = positions.reduce(
        (closest, position, i) =>
          Math.abs(position - viewport.scrollLeft) <
          Math.abs(positions[closest] - viewport.scrollLeft)
            ? i
            : closest,
        0,
      );
      [...progress.children].forEach((dot, i) => {
        const active = i === activeIndex;
        dot.style.width = active ? "39px" : "8px";
        dot.style.background = active ? "#f0f" : "#ffd6fd";
      });
    }
    function moveCarousel(direction) {
      if (viewport.classList.contains("carousel-fits")) return;
      viewport.scrollBy({
        left:
          direction *
          (track.querySelector("article").getBoundingClientRect().width +
            (parseFloat(getComputedStyle(track).columnGap) || 0)),
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    }
    listen(previous, "click", () => moveCarousel(-1));
    listen(next, "click", () => moveCarousel(1));
    listen(viewport, "keydown", (event) => {
      if (
        event.target !== viewport ||
        viewport.classList.contains("carousel-fits")
      )
        return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        moveCarousel(event.key === "ArrowRight" ? 1 : -1);
      }
    });
    let drag = null,
      dragged = false;
    listen(viewport, "pointerdown", (event) => {
      if (
        viewport.classList.contains("carousel-fits") ||
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        (event.target.closest("a,button") &&
          !event.target.closest("[data-carousel-link]"))
      )
        return;
      drag = { x: event.clientX, left: viewport.scrollLeft };
      dragged = false;
    });
    listen(viewport, "pointermove", (event) => {
      if (!drag) return;
      if (Math.abs(event.clientX - drag.x) > 5) {
        dragged = true;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add("is-dragging");
        viewport.scrollLeft = drag.left - (event.clientX - drag.x);
      }
    });
    const endDrag = () => {
      drag = null;
      viewport.classList.remove("is-dragging");
    };
    listen(viewport, "pointerup", endDrag);
    listen(viewport, "pointercancel", endDrag);
    listen(viewport, "lostpointercapture", endDrag);
    listen(
      viewport,
      "click",
      (event) => {
        if (dragged) {
          event.preventDefault();
          event.stopPropagation();
          dragged = false;
        }
      },
      { capture: true },
    );
    listen(viewport, "scroll", updateCarousel, { passive: true });
    const carouselResize = new ResizeObserver(updateCarousel);
    carouselResize.observe(viewport);
    carouselResize.observe(track);
    track
      .querySelectorAll("article")
      .forEach((card) => carouselResize.observe(card));
    const mutationObserver = new MutationObserver(() => {
      track
        .querySelectorAll("article")
        .forEach((card) => carouselResize.observe(card));
      updateCarousel();
    });
    mutationObserver.observe(track, { childList: true });
    updateCarousel();

    const revealObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        viewport.classList.add("cards-revealed");
        revealObserver.disconnect();
      },
      { threshold: 0.15 },
    );
    track.querySelectorAll("article").forEach((card, index) => {
      card.style.setProperty("--card-delay", `${index * 120}ms`);
    });
    if (!reducedMotion.matches) {
      viewport.classList.add("cards-reveal-ready");
      revealObserver.observe(viewport);
    }
    const revealAll = () => {
      viewport.classList.add("cards-revealed");
      revealObserver.disconnect();
    };
    listen(reducedMotion, "change", revealAll);

    return () => {
      revealObserver.disconnect();
      viewport.classList.remove("cards-reveal-ready", "cards-revealed");
      events.abort();
      carouselResize.disconnect();
      mutationObserver.disconnect();
    };
  }, [rootRef]);
}
