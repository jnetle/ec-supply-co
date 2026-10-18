import { BlobImage } from "@/components/ui/blob-image";
import { LinkIcon } from "@/components/ui/link-icon";
import { MAKER_RADII, makerByline, type Maker } from "@/lib/content/makers";

import styles from "./error-scene.module.css";

/** The 404's way back in: one maker from the roster, introduced by name. */
export function MakerIntro({ maker }: { maker: Maker }) {
  return (
    <aside aria-label="A maker to meet" className={styles.makerIntro}>
      <BlobImage
        src={maker.photo?.src}
        alt={maker.photo?.alt ?? ""}
        radius={MAKER_RADII[0]}
        ratio="1/1"
        sizes="96px"
        parallax={false}
        morphing
      />
      <div className={styles.makerText}>
        <p className={styles.makerLabel}>While you&rsquo;re here, meet</p>
        <p className={styles.makerName}>
          {maker.website ? (
            <a
              href={maker.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.makerLink}
            >
              {/* The no-break space keeps the badge on the name's last line. */}
              {maker.name}&nbsp;
              <span className={styles.linkBadge}>
                <LinkIcon size="0.62em" />
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            maker.name
          )}
        </p>
        <p className={styles.makerCraft}>{makerByline(maker)}</p>
        <p className={styles.makerBio}>{maker.bio}</p>
      </div>
    </aside>
  );
}
