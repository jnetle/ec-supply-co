import { BlobImage } from "@/components/ui/blob-image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SHOP_ADDRESS } from "@/lib/content/nav";

import styles from "./visit.module.css";

export function Visit() {
  return (
    <section id="visit" className={styles.section}>
      <div data-reveal>
        <Eyebrow
          color="var(--color-ecs-teal)"
          ink="#ffffff"
          className="mb-[18px]"
        >
          Come by
        </Eyebrow>
        <h2 className={styles.heading}>Opening soon on Fairmount</h2>

        <div className={styles.address}>
          {SHOP_ADDRESS.street}
          <br />
          {SHOP_ADDRESS.city}
        </div>

        {/* Holds the hours card's place until the hours are set. */}
        <div className={`film ${styles.hours}`}>
          <div className={styles.hoursTitle}>Hours coming soon</div>
          <p className={styles.hoursNote}>
            We&rsquo;re still setting our schedule. Get the newsletter or
            follow along on Instagram to hear first when the doors open.
          </p>
          <div className={styles.hoursLinks}>
            <a href="#signup">Get the newsletter</a>
            <a href={SHOP_ADDRESS.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div data-reveal>
        <BlobImage
          src="/assets/photos/id-195-1200-900.jpg"
          alt="The storefront on Fairmount Ave"
          radius="44% 56% 20% 20% / 40% 36% 8% 10%"
          ratio="4/3"
          sizes="(max-width: 700px) 100vw, 50vw"
          style={{ minHeight: "260px" }}
        />
      </div>
    </section>
  );
}
