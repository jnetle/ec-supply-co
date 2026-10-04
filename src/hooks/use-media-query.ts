"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * True while the media query matches. Returns false during SSR so the server
 * and the first client render agree; the subscription corrects it
 * immediately afterwards. Layout that must be right at first paint belongs
 * in CSS — this is for behaviour.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
