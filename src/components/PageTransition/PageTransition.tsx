"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type Phase = "idle" | "exit" | "enter";
const PageTransitionContext = createContext<{
  phase: Phase;
  navigate: (href: string) => void;
  finishEnter: () => void;
} | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef<URL | null>(null);
  const activePath = useRef(pathname);
  const positions = useRef(new Map<string, { top: number; left: number }>());
  const [route, setRoute] = useState<{ pathname: string; phase: Phase }>({
    pathname,
    phase: "idle",
  });

  // Mark the incoming tree before it paints, including browser Back/Forward.
  if (route.pathname !== pathname) setRoute({ pathname, phase: "enter" });

  const finishEnter = useCallback(() => {
    setRoute((current) =>
      current.phase === "enter" ? { ...current, phase: "idle" } : current,
    );
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      positions.current.set(activePath.current, {
        top: window.scrollY,
        left: window.scrollX,
      });
      pending.current = url;
      router.prefetch(`${url.pathname}${url.search}`);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(`${url.pathname}${url.search}${url.hash}`, {
          scroll: false,
        });
      } else {
        setRoute((current) => ({ ...current, phase: "exit" }));
      }
    },
    [router],
  );

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const remember = () => {
      positions.current.set(activePath.current, {
        top: window.scrollY,
        left: window.scrollX,
      });
    };
    const onPopState = () => {
      if (window.location.pathname === activePath.current) return;
      remember();
      pending.current = null;
      setRoute((current) => ({ ...current, phase: "idle" }));
    };
    window.addEventListener("scroll", remember, { passive: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("scroll", remember);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (route.phase === "idle") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        if (route.phase === "enter") {
          finishEnter();
        } else if (pending.current) {
          const url = pending.current;
          router.push(`${url.pathname}${url.search}${url.hash}`, {
            scroll: false,
          });
        }
      },
      reduced ? 0 : route.phase === "exit" ? 490 : 540,
    );
    return () => window.clearTimeout(timer);
  }, [route.phase, route.pathname, router, finishEnter]);

  useLayoutEffect(() => {
    activePath.current = pathname;
    const destination = pending.current;
    if (!destination || destination.pathname !== pathname) {
      const position = positions.current.get(pathname);
      if (position) window.scrollTo({ ...position, behavior: "instant" });
      return;
    }
    pending.current = null;
    const target = destination.hash
      ? document.getElementById(decodeURIComponent(destination.hash.slice(1)))
      : null;
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <PageTransitionContext.Provider
      value={{ phase: route.phase, navigate, finishEnter }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) throw new Error("PageTransitionProvider is required");
  return context;
}
