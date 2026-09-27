"use client";

import { useEffect } from "react";

/**
 * Runs `onScroll` at most once per frame, on scroll and resize.
 *
 * Scroll is watched in the capture phase because on mobile the scrolling
 * element is often an ancestor container rather than the window, and a
 * bubbling listener on window would never hear it.
 */
export function useRafScroll(onScroll: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const run = () => {
      frame = 0;
      onScroll();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };

    schedule();
    document.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [onScroll, enabled]);
}
