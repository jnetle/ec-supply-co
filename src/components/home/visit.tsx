import { BlobImage } from "@/components/ui/blob-image";
import { button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SHOP_ADDRESS } from "@/lib/content/nav";
import { getShopHours } from "@/lib/google-hours";

import { HoursTable } from "./hours-table";
import styles from "./visit.module.css";

/** Where to find the shop, with its hours straight from the Google profile. */
export async function Visit() {
  const hours = await getShopHours();

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
        <h2 className={styles.heading}>Now open</h2>

        <div className={styles.address}>
          {SHOP_ADDRESS.street}
          <br />
          {SHOP_ADDRESS.city}
        </div>

        <div className={`film ${styles.hours}`}>
          <h3 className={styles.hoursTitle}>Hours</h3>
          {hours ? (
            <>
              <HoursTable hours={hours} />
              <p className={styles.hoursNote}>
                We&rsquo;re soft-opening while we settle on our regular hours,
                so these may shift. Any last-minute changes go up on
                Instagram.
              </p>
              <p className={styles.credit}>Hours from Google</p>
            </>
          ) : (
            <p className={styles.hoursNote}>
              We&rsquo;re soft-opening while we settle on our regular hours.
              For the latest on hours, visit us on Google or Instagram.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <a
            href={SHOP_ADDRESS.maps}
            target="_blank"
            rel="noreferrer"
            className={button()}
          >
            Find us on Google
          </a>
          <a
            href={SHOP_ADDRESS.instagram}
            target="_blank"
            rel="noreferrer"
            className={button({ variant: "outline" })}
          >
            Follow on Instagram
          </a>
        </div>
      </div>

      <div data-reveal>
        <BlobImage
          src="/assets/photos/shop/storefront-street.jpg"
          alt="The shop seen from across Fairmount Ave: a low white storefront with a striped awning, the blue door at 7523A, Supply Co. lettering on the window and a blue bistro set out front, with Fat Apple's next door"
          radius="44% 56% 20% 20% / 40% 36% 8% 10%"
          ratio="4/3"
          sizes="(max-width: 700px) 100vw, 50vw"
          style={{ minHeight: "260px" }}
        />
      </div>
    </section>
  );
}
