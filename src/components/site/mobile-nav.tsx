"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";

import { button } from "@/components/ui/button";
import { NAV_GROUPS, SHOP_ADDRESS, VISIT_HREF } from "@/lib/content/nav";

import styles from "./mobile-nav.module.css";

/**
 * The full-screen drawer below 900px. Radix Dialog supplies the focus trap,
 * Escape handling, scroll lock and aria-expanded that the design wires by hand.
 */
/** An item's place in the drawer's drop-in stagger, read by the CSS. */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function MobileNav() {
  // Every link closes the drawer itself, so same-page anchors work too.
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // A link to the page you're on ("/#tools", or Home, while on "/") waits
  // until the drawer has gone. While it is open the page is scroll-locked,
  // and lifting the lock cuts off the smooth scroll partway, leaving the page
  // short of the section (or of the top).
  const pendingAnchor = useRef<string | null>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const follow = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const [path] = href.split("#");
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (path === pathname && !modified) {
      event.preventDefault();
      pendingAnchor.current = href;
    }
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        ref={burgerRef}
        className={styles.burger}
        aria-label="Menu"
      >
        <span className={styles.bars} aria-hidden="true">
          <span className={`${styles.bar} ${styles.barTop}`} />
          <span className={`${styles.bar} ${styles.barMid}`} />
          <span className={`${styles.bar} ${styles.barBot}`} />
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.scrim} />
        <Dialog.Content
          className={styles.drawer}
          // Fires once the closing animation has ended and the scroll lock is
          // off, which is the earliest the anchor scroll can run in full.
          onCloseAutoFocus={(event) => {
            const href = pendingAnchor.current;
            if (!href) return;
            pendingAnchor.current = null;
            // Radix's own focus return scrolls to the burger, which cuts the
            // scroll short; hand focus back without moving the page.
            event.preventDefault();
            burgerRef.current?.focus({ preventScroll: true });
            if (href.includes("#")) {
              router.push(href);
              return;
            }
            // The page itself: back to the top, dropping any #section left
            // in the address by an earlier anchor link.
            if (window.location.hash) window.history.replaceState(null, "", href);
            window.scrollTo({ top: 0 });
          }}
        >
          <div className={styles.drawerHeader}>
            <Dialog.Title className="sr-only">Site menu</Dialog.Title>
            {/* The drawer hides the header's logo, so home gets its own way
                back, first in the list. */}
            <Link
              href="/"
              className={styles.link}
              aria-current={pathname === "/" ? "page" : undefined}
              onClick={(event) => follow(event, "/")}
            >
              Home
            </Link>
            <Dialog.Close
              className={button({
                variant: "outline",
                tone: "ink",
                size: "sm",
                icon: true,
              })}
              aria-label="Close menu"
            >
              <span aria-hidden="true">×</span>
            </Dialog.Close>
          </div>

          {NAV_GROUPS.map((group, i) => (
            <div key={group.key} style={stagger(i + 1)}>
              <div className={styles.groupLabel}>
                <span
                  className={styles.dot}
                  style={{ "--dot-color": group.color } as CSSProperties}
                />
                {group.label}
              </div>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.link}
                  onClick={(event) => follow(event, link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          <Link
            href={VISIT_HREF}
            className={button({
              tone: "red",
              size: "lg",
              className: styles.visit,
            })}
            style={stagger(NAV_GROUPS.length + 1)}
            onClick={(event) => follow(event, VISIT_HREF)}
          >
            Visit us
          </Link>

          <div
            className={styles.address}
            style={stagger(NAV_GROUPS.length + 2)}
          >
            {SHOP_ADDRESS.street}
            <br />
            {SHOP_ADDRESS.hours}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
