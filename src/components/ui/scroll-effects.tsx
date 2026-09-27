"use client";

import { useCallback, useEffect, useRef } from "react";

import { useRafScroll } from "@/hooks/use-raf-scroll";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/** Reveal transition, matching the design's easing and duration. */
const REVEAL_TRANSITION =
  "opacity 760ms cubic-bezier(.2,.7,.2,1), transform 760ms cubic-bezier(.2,.7,.2,1)";
/** Siblings stagger, capped so a long list doesn't trail off. */
const STAGGER_MS = 80;
const MAX_STAGGER_STEPS = 5;
/** Fire a little before the element reaches the bottom edge. */
const REVEAL_MARGIN = "0px 0px -12% 0px";

/** Images are overscaled so they have room to drift inside their mask. */
const IMG_SCALE = 1.16;
const IMG_DRIFT = 0.07;

/**
 * Drives the two document-wide scroll effects so that the sections
 * themselves can stay server components carrying only data attributes:
 *
 *  - `[data-reveal]`          fades and rises into view, once.
 *  - `[data-parallax="n"]`    translates by scroll distance × n.
 *  - `[data-parallax-img]`    drifts inside its clipping parent.
 *
 * Mount once per page, after the content.
 */
export function ScrollEffects() {
  const reducedMotion = useReducedMotion();
  // Parallax is relative to each blob's own last offset, so it needs to
  // persist across frames.
  const blobOffsets = useRef(new WeakMap<Element, number>());

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!targets.length) return;

    // Reduced motion still needs the elements visible — just not animated.
    if (reducedMotion) {
      targets.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
      return;
    }

    targets.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0,24px,0)";
      el.style.transition = REVEAL_TRANSITION;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = Array.from(el.parentElement?.children ?? []).indexOf(el);
          el.style.transitionDelay = `${Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}ms`;
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.unobserve(el);
        });
      },
      { rootMargin: REVEAL_MARGIN },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reducedMotion]);

  const runParallax = useCallback(() => {
    const vh = window.innerHeight;

    document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Skip anything well outside the viewport; its offset is still correct
      // from the last time it was near.
      if (rect.bottom < -vh || rect.top > vh * 2) return;

      const previous = blobOffsets.current.get(el) ?? 0;
      const distance = rect.top + rect.height / 2 - vh / 2 - previous;
      const y = -distance * Number(el.dataset.parallax);
      blobOffsets.current.set(el, y);
      el.style.translate = `0 ${y.toFixed(1)}px`;
    });

    document
      .querySelectorAll<HTMLElement>("[data-parallax-img]")
      .forEach((el) => {
        const frame = el.parentElement?.getBoundingClientRect();
        if (!frame || frame.bottom < 0 || frame.top > vh) return;

        // -1 when the frame sits below the fold, +1 when it has passed above.
        const t =
          (frame.top + frame.height / 2 - vh / 2) / (vh / 2 + frame.height / 2);
        el.style.translate = `0 ${(t * frame.height * IMG_DRIFT).toFixed(1)}px`;
      });
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const images = document.querySelectorAll<HTMLElement>("[data-parallax-img]");
    images.forEach((el) => {
      el.style.scale = String(IMG_SCALE);
      el.style.willChange = "translate";
    });
    return () => {
      images.forEach((el) => {
        el.style.scale = "";
        el.style.willChange = "";
        el.style.translate = "";
      });
    };
  }, [reducedMotion]);

  useRafScroll(runParallax, !reducedMotion);

  return null;
}
