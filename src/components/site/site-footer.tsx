import Link from 'next/link';

import { CookieChoicesButton } from '@/components/site/analytics';
import { button } from '@/components/ui/button';
import { InstagramIcon } from '@/components/ui/instagram-icon';
import { WaveDivider } from '@/components/ui/wave-divider';
import {
  FOOTER_EXTRA_LINKS,
  NAV_GROUPS,
  SHOP_ADDRESS,
} from '@/lib/content/nav';
import { vercel } from '@/lib/env';

import styles from './site-footer.module.css';

/** The full sitemap footer shown on every page. */
export function SiteFooter() {
  return (
    <footer id="ecs-footer" className={styles.footer}>
      <WaveDivider edge="top" fill="var(--color-ecs-navy)" />

      <nav aria-label="Site map" className={styles.sitemap}>
        {NAV_GROUPS.map((group) => (
          <div key={group.key} className={styles.column}>
            <div className={styles.columnLabel}>{group.label}</div>
            {[...group.links, ...(FOOTER_EXTRA_LINKS[group.key] ?? [])].map(
              (link) => (
                <Link key={link.href} href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ),
            )}
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
          className={button({ tone: 'marigold', icon: true })}
        >
          <InstagramIcon />
        </a>
      </div>

      <div className={styles.colophon}>
        <span>
          © {new Date().getFullYear()} El Cerrito Supply Co. All Rights
          Reserved.
        </span>
        <span className={styles.colophonLinks}>
          {/* Google Analytics, and so its cookie banner, only runs on the
              live site; elsewhere this button would have nothing to open. */}
          {vercel.isProduction() && (
            <CookieChoicesButton className={styles.colophonLink} />
          )}
          <Link href="/privacy" className={styles.colophonLink}>
            Privacy
          </Link>
        </span>
      </div>
    </footer>
  );
}
