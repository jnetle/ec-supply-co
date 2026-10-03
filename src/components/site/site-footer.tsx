import Link from "next/link";

import { InstagramIcon } from "@/components/ui/instagram-icon";
import { WaveDivider } from "@/components/ui/wave-divider";
import {
  FOOTER_EXTRA_LINKS,
  NAV_GROUPS,
  SHOP_ADDRESS,
} from "@/lib/content/nav";

import styles from "./site-footer.module.css";

/** The full sitemap footer shown on every page. */
export function SiteFooter() {
  return (
    <footer id="ecs-footer" className={styles.footer}>
      <WaveDivider edge="top" fill="var(--color-ecs-navy)" />

      <nav aria-label="Site map" className={styles.sitemap}>
        {NAV_GROUPS.map((group) => (
          <div key={group.key} className={styles.column}>
            <div className={styles.columnLabel}>{group.label}</div>
            {[
              ...group.links,
              ...(FOOTER_EXTRA_LINKS[group.key] ?? []),
            ].map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.follow}>
        <span className={styles.columnLabel}>Follow along</span>
        <a
          href={SHOP_ADDRESS.instagram}
          target="_blank"
          rel="noopener"
          aria-label="El Cerrito Supply Co. on Instagram"
          className={styles.instagram}
        >
          <InstagramIcon />
        </a>
      </div>

      <div className={styles.colophon}>
        <span>© 2026 El Cerrito Supply Co.</span>
      </div>
    </footer>
  );
}
