"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Awning } from "./awning";
import { AwningSwitcher } from "./awning-lab/awning-switcher";
import { BrandMark } from "./brand-mark";
import { MobileNav } from "./mobile-nav";
import { SiteNav } from "./site-nav";
import styles from "./site-header.module.css";

/** Gap below the awning at which the hero is considered off-screen. */
const BRAND_REVEAL_SLACK = 40;

type SiteHeaderProps = {
  /**
   * Home only: keep the brand sign tucked behind the awning until the element
   * matching this selector has scrolled past. Everywhere else the sign is
   * visible from the start.
   */
  revealBrandAfter?: string;
};

export function SiteHeader({ revealBrandAfter }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const [brandShown, setBrandShown] = useState(!revealBrandAfter);

  // Publish two heights the rest of the page needs:
  //
  //   --ecs-nav-height        the header's own box, which the drawer sits under
  //   --ecs-header-clearance  the lowest painted pixel, which anchor targets
  //                           must clear
  //
  // They differ because the brand sign hangs 13–31px below the header's box,
  // depending on viewport width. Anything using the box alone lands under the
  // sign.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const publish = () => {
      const root = document.documentElement.style;
      const height = header.getBoundingClientRect().height;
      root.setProperty("--ecs-nav-height", `${height}px`);

      // Summed from layout offsets rather than read off a rect, because on
      // the home page the sign is translated out of sight until the hero
      // scrolls away — a rect would report where it is, not where it sits.
      let signBottom = brandRef.current?.offsetHeight ?? 0;
      for (
        let el: HTMLElement | null = brandRef.current;
        el && el !== header;
        el = el.offsetParent as HTMLElement | null
      ) {
        signBottom += el.offsetTop;
      }

      root.setProperty(
        "--ecs-header-clearance",
        `${Math.max(height, signBottom)}px`,
      );
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    if (brandRef.current) observer.observe(brandRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!revealBrandAfter) return;

    // Its own listener rather than the hero's rAF loop, so anchor jumps and
    // restored scroll positions resolve too.
    const sync = () => {
      const track = document.querySelector(revealBrandAfter);
      const navHeight = headerRef.current?.getBoundingClientRect().height ?? 72;
      if (!track) return;
      setBrandShown(
        track.getBoundingClientRect().bottom <= navHeight + BRAND_REVEAL_SLACK,
      );
    };

    sync();
    document.addEventListener("scroll", sync, { passive: true, capture: true });
    window.addEventListener("resize", sync);
    return () => {
      document.removeEventListener("scroll", sync, { capture: true });
      window.removeEventListener("resize", sync);
    };
  }, [revealBrandAfter]);

  return (
    <header ref={headerRef} className={styles.header}>
      <Awning />
      <AwningSwitcher />

      <div className={styles.row}>
        <Link
          ref={brandRef}
          href="/"
          aria-label="El Cerrito Supply Co. — home"
          aria-hidden={!brandShown}
          tabIndex={brandShown ? undefined : -1}
          className={`${styles.brand} ${brandShown ? "" : styles.brandHidden}`}
        >
          <BrandMark />
        </Link>

        <SiteNav />
        <MobileNav />
      </div>
    </header>
  );
}
