import type { Metadata } from "next";

import {
  InquiryForm,
  InquiryTypeLink,
  type RentalType,
} from "@/components/host-with-us/inquiry-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BlobImage } from "@/components/ui/blob-image";
import { button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageIntro } from "@/components/ui/page-intro";
import { WaveDivider } from "@/components/ui/wave-divider";
import { pageMetadata } from "@/lib/site";

import styles from "@/components/host-with-us/host-with-us-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Host with us",
  description:
    "Rent the shop after hours for a private event, run a co-marketing workshop with us, or pitch us an idea.",
  path: "/host-with-us",
});

const WAYS: {
  type: RentalType;
  label: string;
  title: string;
  body: string;
  cta: string;
}[] = [
  {
    type: "private-event",
    label: "Private event",
    title: "The room is yours.",
    body: "Birthdays, showers, book clubs, meetings or a class of your own. Rent the space after hours and bring your people.",
    cta: "Plan a private event",
  },
  {
    type: "co-marketing-workshop",
    label: "Co-marketing workshop",
    title: "Host it with us.",
    body: "Run a workshop together with the shop. You bring the craft, we bring the room, and we both get the word out to our communities.",
    cta: "Team up on a workshop",
  },
  {
    type: "pitch-an-idea",
    label: "Pitch an idea",
    title: "Got something else?",
    body: "A popup, a collab, a class that doesn't fit a box. Tell us what you have in mind and we'll figure it out together.",
    cta: "Pitch us an idea",
  },
];

const RENTAL_FACTS = [
  { value: "$75", unit: " / hour", note: "Rental rates start here" },
  { value: "12 seats", note: "At our long center table" },
  { value: "Catering + BYOB", note: "Outside catering welcome" },
  { value: "Mornings + evenings", note: "Both are available" },
];

export default function HostWithUsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="After hours"
          eyebrowColor="var(--color-ecs-pink-deep)"
          eyebrowInk="#ffffff"
          title="Book the room."
          lede="Use the shop after hours three ways: throw your own private event, team up with us on a co-marketing workshop, or pitch us an idea."
        />

        <section id="ways" className={`${styles.band} ${styles.ways}`}>
          <WaveDivider edge="top" fill="var(--color-ecs-pink)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-pink)" />

          <div className={styles.waysIntro}>
            <Eyebrow
              color="var(--color-ecs-pink-deep)"
              ink="#ffffff"
              className="mb-[18px]"
            >
              Three ways to use the room
            </Eyebrow>
            <h2 className={styles.heading}>
              Rent it, run it with us, or tell us your idea.
            </h2>
          </div>

          <ol className={styles.cards}>
            {WAYS.map((way, index) => (
              <li key={way.type} className={styles.card}>
                <span className={styles.cardNumber}>{index + 1}</span>
                <span className={styles.cardLabel}>{way.label}</span>
                <h3 className={styles.cardTitle}>{way.title}</h3>
                <p className={styles.cardBody}>{way.body}</p>
                <InquiryTypeLink type={way.type} className={button({
                    variant: "link",
                    tone: "magenta",
                    size: "lg",
                    className: styles.cardCta,
                  })}
                >
                  {way.cta} →
                </InquiryTypeLink>
              </li>
            ))}
          </ol>
        </section>

        <section id="inquire" className={`${styles.band} ${styles.rental}`}>
          <WaveDivider edge="top" fill="var(--color-ecs-teal-deep)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-teal-deep)" />

          <div>
            <Eyebrow
              color="var(--color-ecs-marigold)"
              ink="var(--color-ecs-ink)"
              className="mb-[18px]"
            >
              The space
            </Eyebrow>
            <h2 className={styles.heading}>
              One room, whatever you&rsquo;re planning.
            </h2>
            <p className={styles.lede}>
              Whichever way you use it, here&rsquo;s what you get. Pick your
              rental type in the form and we&rsquo;ll get back to you with
              options and availability.
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

          <InquiryForm />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
