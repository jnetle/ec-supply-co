import type { Metadata } from 'next';

import {
  InquiryForm,
  InquiryTypeLink,
  type RentalType,
} from '@/components/host-with-us/inquiry-form';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { BlobImage } from '@/components/ui/blob-image';
import { button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PageIntro } from '@/components/ui/page-intro';
import { WaveDivider } from '@/components/ui/wave-divider';
import {
  CO_MARKETING_WORKSHOP_ENABLED,
  HOST_WITH_US_ENABLED,
} from '@/lib/content/host-with-us';
import { pageMetadata } from '@/lib/site';

import styles from '@/components/host-with-us/host-with-us-page.module.css';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Host with us',
    description: CO_MARKETING_WORKSHOP_ENABLED
      ? 'Rent the shop for a private event, run a co-marketing workshop with us, or pitch us an idea.'
      : 'Rent the shop for a private event, or pitch us an idea.',
    path: '/host-with-us',
  }),
  // Reachable by URL for review, but kept out of search until it's public.
  ...(!HOST_WITH_US_ENABLED && { robots: { index: false, follow: false } }),
};

const WAYS: {
  type: RentalType;
  label: string;
  title: string;
  body: string;
  cta: string;
}[] = [
  {
    type: 'private-event',
    label: 'Private event',
    title: 'The space is yours.',
    body: 'Birthdays, showers, book clubs, meetings or a class of your own. Rent the space and bring your people.',
    cta: 'Plan a private event',
  },
  {
    type: 'co-marketing-workshop',
    label: 'Co-marketing workshop',
    title: 'Host it with us.',
    body: 'Run a workshop together with the shop. You bring the craft, we bring the space, and we both get the word out to our communities.',
    cta: 'Team up on a workshop',
  },
  {
    type: 'pitch-an-idea',
    label: 'Pitch an idea',
    title: 'Got something else?',
    body: "A popup, a collab, a class that doesn't fit a box. Tell us what you have in mind and we'll figure it out together.",
    cta: 'Pitch us an idea',
  },
];

const OFFERED_WAYS = WAYS.filter(
  (way) =>
    CO_MARKETING_WORKSHOP_ENABLED || way.type !== 'co-marketing-workshop',
);

const RENTAL_FACTS = [
  { value: 'Catering + BYOB', note: 'Outside catering welcome' },
  { value: 'Outside store hours', note: 'Mornings and evenings' },
];

export default function HostWithUsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="Gather here"
          eyebrowColor="var(--color-ecs-teal-deep)"
          eyebrowInk="#ffffff"
          title="Book the space."
          lede={
            CO_MARKETING_WORKSHOP_ENABLED
              ? 'Use the shop three ways: throw your own private event, team up with us on a co-marketing workshop, or pitch us an idea.'
              : 'Use the shop two ways: throw your own private event, or pitch us an idea.'
          }
        />

        <section id="ways" className={`${styles.band} ${styles.ways}`}>
          <WaveDivider edge="top" fill="var(--color-ecs-teal-pale)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-teal-pale)" />

          <div className={styles.waysIntro}>
            <Eyebrow
              color="var(--color-ecs-teal-deep)"
              ink="#ffffff"
              className="mb-[18px]"
            >
              {CO_MARKETING_WORKSHOP_ENABLED ? 'Three' : 'Two'} ways to use
              the space
            </Eyebrow>
            <h2 className={styles.heading}>
              {CO_MARKETING_WORKSHOP_ENABLED
                ? 'Rent it, run it with us, or tell us your idea.'
                : 'Rent it, or tell us your idea.'}
            </h2>
          </div>

          <ol className={styles.cards}>
            {OFFERED_WAYS.map((way, index) => (
              <li key={way.type} className={styles.card}>
                <span className={styles.cardNumber}>{index + 1}</span>
                <span className={styles.cardLabel}>{way.label}</span>
                <h3 className={styles.cardTitle}>{way.title}</h3>
                <p className={styles.cardBody}>{way.body}</p>
                <InquiryTypeLink
                  type={way.type}
                  className={button({
                    variant: 'link',
                    tone: 'tealDeep',
                    size: 'lg',
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
              Make the space yours, whatever you&rsquo;re planning.
            </h2>
            <p className={styles.lede}>
              Whichever way you use it, here&rsquo;s what you get. Tell us how
              you&rsquo;d like to use it in the form and we&rsquo;ll get back
              to you with options and availability.
            </p>

            <div className={styles.tiles}>
              {RENTAL_FACTS.map((fact) => (
                <div key={fact.note} className={styles.tile}>
                  <div className={styles.tileValue}>{fact.value}</div>
                  <div className={styles.tileNote}>{fact.note}</div>
                </div>
              ))}
            </div>

            <BlobImage
              src="/assets/photos/build/big-table-tight.jpg"
              alt="The long wood table in the middle of the shop, with the pine shelving, the orange sofa and the arched plywood wall behind it"
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
