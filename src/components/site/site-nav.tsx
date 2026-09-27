"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import type { CSSProperties } from "react";

import { NAV_GROUPS, VISIT_HREF } from "@/lib/content/nav";

import styles from "./site-nav.module.css";

/**
 * The desktop nav: four tilted chips, each opening a panel of links.
 * Radix owns the open/close behaviour the design hand-wired — pointer-outside,
 * Escape, hover intent and the ARIA wiring.
 */
export function SiteNav() {
  return (
    <NavigationMenu.Root className={styles.root} delayDuration={0}>
      <NavigationMenu.List className={styles.list}>
        {NAV_GROUPS.map((group) => (
          <NavigationMenu.Item key={group.key} className={styles.group}>
            <NavigationMenu.Trigger
              className={styles.chip}
              style={
                {
                  "--chip-bg": group.color,
                  "--chip-fg": group.ink,
                  "--chip-radius": group.radius,
                  "--chip-tilt": `${group.tilt}deg`,
                } as CSSProperties
              }
            >
              {group.label}
              <span aria-hidden="true" className={styles.caret}>
                ▾
              </span>
            </NavigationMenu.Trigger>

            <NavigationMenu.Content
              className={styles.panelWrap}
              data-align={group.align}
            >
              <ul className={styles.panel}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <NavigationMenu.Link asChild>
                      <Link href={link.href} className={styles.item}>
                        <span className={styles.itemLabel}>{link.label}</span>
                        <span className={styles.itemNote}>{link.note}</span>
                      </Link>
                    </NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <Link href={VISIT_HREF} className={styles.visit}>
              Visit us
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
