"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  countries,
  countryForHostname,
  isCountryCode,
  isPlaceholderUrl,
  type CountryCode,
} from "@/lib/countries";

import {
  defaultLanguage,
  contentLanguage,
  isCountryLanguage,
  type LanguageCode,
} from "@/lib/languages";

const storageKey = "wb-taxi-country";
const changeEvent = "wb-taxi-country-change";
type CountryContextValue = {
  country: (typeof countries)[number];
  selectCountry: (country: CountryCode) => void;
  language: LanguageCode;
  pageLanguage: LanguageCode;
  selectLanguage: (language: LanguageCode) => void;
  pageCountry: (typeof countries)[number];
  pageReady: boolean;
  transitionPhase: "idle" | "enter" | "exit";
  finishCountryExit: () => void;
  finishCountryEnter: () => void;
};
const CountryContext = createContext<CountryContextValue | null>(null);

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function subscribeMotion(callback: () => void) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  motion.addEventListener("change", callback);
  return () => motion.removeEventListener("change", callback);
}

export function CountryProvider({
  initialCountry,
  children,
}: {
  initialCountry: CountryCode;
  children: ReactNode;
}) {
  const getSnapshot = useCallback(() => {
    const domainCountry = countryForHostname(window.location.hostname);
    if (domainCountry) return domainCountry;
    const queryCountry = new URLSearchParams(window.location.search).get(
      "country",
    );
    if (isCountryCode(queryCountry)) return queryCountry;
    try {
      const saved = localStorage.getItem(storageKey);
      if (isCountryCode(saved)) return saved;
    } catch {
      /* URL selection still works when browser storage is blocked. */
    }
    return initialCountry;
  }, [initialCountry]);
  const selected = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialCountry,
  );
  const getLanguageSnapshot = useCallback(() => {
    const query = new URLSearchParams(window.location.search).get("lang");
    if (isCountryLanguage(selected, query)) return query;
    try {
      const saved = localStorage.getItem(`wb-taxi-language-${selected}`);
      if (isCountryLanguage(selected, saved)) return saved;
    } catch {
      /* Use the default language when storage is unavailable. */
    }
    return defaultLanguage(selected);
  }, [selected]);
  const language = useSyncExternalStore(subscribe, getLanguageSnapshot, () =>
    defaultLanguage(initialCountry),
  );
  const country = countries.find((country) => country.code === selected)!;
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    clientSnapshot,
    serverSnapshot,
  );
  const [page, setPage] = useState<{
    initialized: boolean;
    requested: CountryCode;
    displayed: CountryCode;
    requestedLanguage: LanguageCode;
    displayedLanguage: LanguageCode;
    phase: "idle" | "enter" | "exit";
  }>({
    initialized: false,
    requested: initialCountry,
    displayed: initialCountry,
    requestedLanguage: defaultLanguage(initialCountry),
    displayedLanguage: defaultLanguage(initialCountry),
    phase: "idle",
  });

  // Restore the initial URL/saved country without running a page transition.
  if (hydrated && !page.initialized) {
    setPage({
      initialized: true,
      requested: selected,
      displayed: selected,
      requestedLanguage: language,
      displayedLanguage: language,
      phase: "idle",
    });
  } else if (
    page.initialized &&
    (page.requested !== selected ||
      page.requestedLanguage !== language ||
      (reducedMotion && page.phase === "exit"))
  ) {
    // Later switches retain the outgoing country until its exit completes.
    setPage({
      initialized: true,
      requested: selected,
      displayed: reducedMotion ? selected : page.displayed,
      requestedLanguage: language,
      displayedLanguage: reducedMotion ? language : page.displayedLanguage,
      phase: reducedMotion ? "idle" : "exit",
    });
  }
  const pageCountry = countries.find(
    (country) => country.code === page.displayed,
  )!;
  const finishCountryExit = useCallback(() => {
    setPage((current) =>
      current.phase === "exit"
        ? {
            ...current,
            displayed: current.requested,
            displayedLanguage: current.requestedLanguage,
            phase: "enter",
          }
        : current,
    );
  }, []);

  const finishCountryEnter = useCallback(() => {
    setPage((current) =>
      current.phase === "enter" ? { ...current, phase: "idle" } : current,
    );
  }, []);

  useEffect(() => {
    if (page.phase === "idle") return;
    // Also finish when an animation is interrupted or its event is unavailable.
    const finish =
      page.phase === "exit" ? finishCountryExit : finishCountryEnter;
    const timeout = window.setTimeout(finish, 540);
    return () => window.clearTimeout(timeout);
  }, [page.phase, finishCountryExit, finishCountryEnter]);

  const selectCountry = useCallback((code: CountryCode) => {
    const next = countries.find((country) => country.code === code)!;
    const destination = new URL(next.url);
    let nextLanguage = defaultLanguage(code);
    try {
      const saved = localStorage.getItem(`wb-taxi-language-${code}`);
      if (isCountryLanguage(code, saved)) nextLanguage = saved;
    } catch {
      /* Use the country default. */
    }
    try {
      localStorage.setItem(storageKey, code);
    } catch {
      /* Browser storage is optional. */
    }

    if (
      !isPlaceholderUrl(destination) &&
      destination.origin !== window.location.origin
    ) {
      destination.pathname = window.location.pathname;
      destination.search = window.location.search;
      destination.searchParams.delete("country");
      destination.searchParams.set("lang", nextLanguage);
      destination.hash = window.location.hash;
      window.location.assign(destination.href);
      return;
    }

    const current = new URL(window.location.href);
    current.searchParams.set("country", code);
    current.searchParams.set("lang", nextLanguage);
    window.history.pushState(
      null,
      "",
      `${current.pathname}${current.search}${current.hash}`,
    );
    window.dispatchEvent(new Event(changeEvent));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const selectLanguage = useCallback(
    (nextLanguage: LanguageCode) => {
      if (!isCountryLanguage(selected, nextLanguage)) return;
      try {
        localStorage.setItem(`wb-taxi-language-${selected}`, nextLanguage);
      } catch {
        /* URL still persists the choice. */
      }
      const current = new URL(window.location.href);
      current.searchParams.set("country", selected);
      current.searchParams.set("lang", nextLanguage);
      window.history.pushState(
        null,
        "",
        `${current.pathname}${current.search}${current.hash}`,
      );
      window.dispatchEvent(new Event(changeEvent));
    },
    [selected],
  );

  useEffect(() => {
    document.documentElement.dataset.country = selected;
    document.documentElement.lang = contentLanguage(language);
  }, [selected, language]);

  return (
    <CountryContext.Provider
      value={{
        country,
        selectCountry,
        language,
        pageLanguage: page.displayedLanguage,
        selectLanguage,
        pageCountry,
        pageReady: page.initialized,
        transitionPhase: page.phase,
        finishCountryExit,
        finishCountryEnter,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context)
    throw new Error("useCountry must be used inside CountryProvider");
  return context;
}

export function CountryPageScope({ children }: { children: ReactNode }) {
  const context = useCountry();
  return (
    <CountryContext.Provider
      value={{
        ...context,
        country: context.pageCountry,
        language: context.pageLanguage,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}
