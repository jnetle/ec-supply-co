import { BlobImage } from "@/components/ui/blob-image";
import { Eyebrow } from "@/components/ui/eyebrow";

import styles from "./visit.module.css";

const HOURS = [
  { day: "Thu", hours: "12–7" },
  { day: "Fri", hours: "12–9" },
  { day: "Sat", hours: "10–8" },
  { day: "Sun", hours: "10–5" },
  { day: "Mon–Wed", hours: "Private events", closed: true },
];

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
        <h2 className={styles.heading}>Thursday through Sunday</h2>

        <div className={styles.address}>
          7523 Fairmount Ave
          <br />
          El Cerrito, CA 94530
          <br />
          <a href="mailto:hello@elcerritosupply.co">hello@elcerritosupply.co</a>
        </div>

        <dl className={styles.hours}>
          <div className={styles.hoursTitle}>Store hours</div>
          {HOURS.map((row) => (
            <div
              key={row.day}
              className={`${styles.hoursRow} ${row.closed ? styles.hoursClosed : ""}`}
            >
              <dt>{row.day}</dt>
              <dd>{row.hours}</dd>
            </div>
          ))}
        </dl>
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
