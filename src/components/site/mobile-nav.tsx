"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

import { NAV_GROUPS, SHOP_ADDRESS, VISIT_HREF } from "@/lib/content/nav";

import styles from "./mobile-nav.module.css";

/**
 * The full-screen drawer below 900px. Radix Dialog supplies the focus trap,
 * Escape handling, scroll lock and aria-expanded that the design wires by hand.
 */
export function MobileNav() {
  // Every link closes the drawer itself, so same-page anchors work too.
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={styles.burger} aria-label="Menu">
        <span className={styles.bars} aria-hidden="true">
          <span className={`${styles.bar} ${styles.barTop}`} />
          <span className={`${styles.bar} ${styles.barMid}`} />
          <span className={`${styles.bar} ${styles.barBot}`} />
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.scrim} />
        <Dialog.Content className={styles.drawer}>
          <div className={styles.drawerHeader}>
            <Dialog.Title className="sr-only">Site menu</Dialog.Title>
            <Dialog.Close className={styles.close} aria-label="Close menu">
              <span aria-hidden="true">×</span>
            </Dialog.Close>
          </div>

          {NAV_GROUPS.map((group) => (
            <div key={group.key}>
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
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          <Link
            href={VISIT_HREF}
            className={styles.visit}
            onClick={() => setOpen(false)}
          >
            Visit us
          </Link>

          <div className={styles.address}>
            {SHOP_ADDRESS.street}
            <br />
            {SHOP_ADDRESS.hours}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
