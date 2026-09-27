import { NewsletterForm } from "@/components/newsletter-form";
import { Blob } from "@/components/ui/blob";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SHOP_ADDRESS } from "@/lib/content/nav";

import styles from "./signup.module.css";

export function Signup() {
  return (
    <section id="signup" className={styles.section}>
      <Blob
        color="rgba(255,178,13,0.20)"
        parallax={-0.22}
        style={{
          left: "-4%",
          top: "6%",
          width: "clamp(120px,16vw,250px)",
          height: "clamp(120px,16vw,250px)",
        }}
      />

      <div data-reveal className={styles.panel}>
        <Blob
          color="rgba(255,178,13,0.10)"
          parallax={0.16}
          style={{
            right: "-6%",
            bottom: "-30%",
            width: "clamp(180px,26vw,420px)",
            height: "clamp(180px,26vw,420px)",
          }}
        />

        <div className={styles.inner}>
          <div className={styles.copy}>
            <Eyebrow
              color="var(--color-ecs-marigold)"
              ink="#22201c"
              className="justify-self-start"
            >
              Still building
            </Eyebrow>
            <h2 className={styles.heading}>Nosy neighbors, sign up here.</h2>
            <p className={styles.lede}>
              The shelves are still filling up. Get a note when something opens
              — a new maker, a workshop night, the day the coffee machine
              finally lands — or follow along on Instagram.
            </p>
          </div>

          <div className={styles.row}>
            <NewsletterForm />

            <div className={styles.alternative}>
              <span className={styles.or}>or</span>
              <a
                href={SHOP_ADDRESS.instagram}
                target="_blank"
                rel="noopener"
                className={styles.instagram}
              >
                Follow @elcerritosupplyco
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
