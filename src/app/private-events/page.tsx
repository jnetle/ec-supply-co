import type { Metadata } from "next";

import { InquiryForm } from "@/components/private-events/inquiry-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Field } from "@/components/ui/field";
import { PageIntro } from "@/components/ui/page-intro";
import { WaveDivider } from "@/components/ui/wave-divider";
import { pageMetadata } from "@/lib/site";

import styles from "@/components/private-events/private-events-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Private events",
  description:
    "Host a private workshop with us, or rent the space for your own meeting, class or party.",
  path: "/private-events",
});

const RENTAL_FACTS = [
  { value: "$75", unit: " / hour", note: "Rental rates start here" },
  { value: "12 seats", note: "At our long center table" },
  { value: "Catering + BYOB", note: "Outside catering welcome" },
  { value: "Mornings + evenings", note: "Both are available" },
];

export default function PrivateEventsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="After hours"
          eyebrowColor="var(--color-ecs-pink-deep)"
          eyebrowInk="#ffffff"
          title="Book the room."
          lede="Host a private workshop with us, or rent the space for your own meeting, class or party."
        />

        <section id="workshops" className={`${styles.band} ${styles.workshops}`}>
          <WaveDivider edge="top" fill="var(--color-ecs-pink)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-pink)" />

          <div>
            <Eyebrow
              color="var(--color-ecs-pink-deep)"
              ink="#ffffff"
              className="mb-[18px]"
            >
              Private workshops
            </Eyebrow>
            <h2 className={styles.heading}>
              Birthdays, showers, book clubs — or just for fun.
            </h2>
            <p className={styles.lede}>
              We offer private workshop events outside of our normal operating
              hours! Our private workshops can be for a birthday party, shower,
              book club, or just for fun! Please reach out below, and we will
              get back to you with options and/or availability.
            </p>

            <BlobImage
              src="/assets/photos/id-106-1200-750.jpg"
              alt="A group gathered around the workshop table"
              radius="46% 54% 18% 22% / 38% 34% 8% 9%"
              ratio="16/10"
              sizes="(max-width: 800px) 100vw, 45vw"
              className={styles.photo}
            />
          </div>

          <InquiryForm
            name="workshop"
            heading="Private workshop inquiry"
            nameLegend="Name of contact"
            confirmation="We will get back to you with options and availability."
            submitBackground="var(--color-ecs-pink-deep)"
            submitForeground="#ffffff"
          />
        </section>

        <section id="rental" className={`${styles.band} ${styles.rental}`}>
          <WaveDivider edge="top" fill="var(--color-ecs-teal-deep)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-teal-deep)" />

          <div>
            <Eyebrow
              color="var(--color-ecs-marigold)"
              ink="#22201c"
              className="mb-[18px]"
            >
              Classroom + event space rental
            </Eyebrow>
            <h2 className={styles.heading}>
              Host your next meeting, class, shower or event.
            </h2>
            <p className={styles.lede}>
              Are you looking for a place to host your next meeting, class,
              shower, or event? Look no further!
            </p>

            <div className={styles.tiles}>
              {RENTAL_FACTS.map((fact) => (
                <div key={fact.note} className={styles.tile}>
                  <div className={styles.tileValue}>
                    {fact.value}
                    {fact.unit ? (
                      <span className={styles.tileUnit}>{fact.unit}</span>
                    ) : null}
                  </div>
                  <div className={styles.tileNote}>{fact.note}</div>
                </div>
              ))}
            </div>

            <BlobImage
              src="/assets/photos/id-195-1200-900.jpg"
              alt="The long center table set up for a private event"
              radius="44% 56% 20% 20% / 40% 36% 8% 10%"
              ratio="4/3"
              sizes="(max-width: 800px) 100vw, 45vw"
              className={styles.photo}
            />
          </div>

          <InquiryForm
            name="rental"
            heading="Event space rental inquiry"
            nameLegend="Contact name"
            confirmation="We will be in touch about availability and next steps."
            submitBackground="var(--color-ecs-magenta)"
            submitForeground="#ffffff"
          >
            <Field
              id="rental-about"
              label="Tell us about your event"
              required
              multiline
            >
              {(props) => <textarea {...props} name="about" required rows={4} />}
            </Field>
            <Field
              id="rental-notes"
              label="Any additional information"
              multiline
            >
              {(props) => <textarea {...props} name="notes" rows={3} />}
            </Field>
          </InquiryForm>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
