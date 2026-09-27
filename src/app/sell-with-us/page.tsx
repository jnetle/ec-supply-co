import type { Metadata } from "next";

import { ApplicationForm } from "@/components/sell-with-us/application-form";
import { PageFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WaveDivider } from "@/components/ui/wave-divider";
import { SUBMISSION_CRITERIA } from "@/lib/content/criteria";

import styles from "@/components/sell-with-us/sell-with-us-page.module.css";

export const metadata: Metadata = {
  title: "Maker submissions",
  description:
    "Apply to sell your work at El Cerrito Supply Co. We review submissions in rounds a few times a year.",
};

export default function SellWithUsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className={styles.intro}>
          <div>
            <Eyebrow
              color="var(--color-ecs-pink-deep)"
              ink="#ffffff"
              className="mb-5"
            >
              Sell with us
            </Eyebrow>
            <h1 className={styles.title}>
              Maker
              <br />
              submissions
            </h1>
          </div>

          <div className={styles.prose}>
            <p>
              We are a small, curated shop with limited shelf space, and we get
              a lot of applications. We are looking for well-made, handmade
              goods that will last — work that fits the feel of the shop and
              that our neighbors will love to bring home.
            </p>
            <p>
              Makers from El Cerrito and the surrounding East Bay get first
              look, and we are especially glad to hear from artists who have not
              had a shelf of their own yet.
            </p>
          </div>
        </section>

        <section id="criteria" className={styles.criteria}>
          <WaveDivider edge="top" fill="var(--color-ecs-pink)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-pink)" />

          <h2 className={styles.criteriaHeading}>What we look for</h2>

          <ol className={styles.criteriaList}>
            {SUBMISSION_CRITERIA.map((criterion, i) => (
              <li key={criterion.title} className={styles.criterion}>
                <span className={styles.criterionNumber}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.criterionText}>
                  <span className={styles.criterionTitle}>
                    {criterion.title}
                  </span>
                  <span className={styles.criterionBody}>{criterion.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="good-to-know" className={styles.policy}>
          <div>
            <Eyebrow
              color="var(--color-ecs-marigold)"
              ink="#22201c"
              className="mb-5"
            >
              Good to know
            </Eyebrow>
            <h2 className={styles.policyHeading}>How reviews work</h2>
          </div>

          <div className={styles.prose}>
            <p>
              <strong>We review in rounds.</strong> Submissions are read in
              batches a few times a year, not one by one as they come in. We may
              not be able to reply to every application, but if your work is a
              fit, we will reach out.
            </p>
            <p>
              <strong>Online only.</strong> So we can keep our attention on
              customers, we do not take submissions in the shop or by phone.
            </p>
            <p>
              <strong>US-based makers.</strong> For now, we can only accept work
              from makers in the United States.
            </p>
          </div>
        </section>

        <ApplicationForm />
      </main>

      <PageFooter />
    </>
  );
}
