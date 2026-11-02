import type { Metadata } from "next";

import { PopupApplicationForm } from "@/components/popup-with-us/popup-application-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Blob } from "@/components/ui/blob";
import { BlobImage } from "@/components/ui/blob-image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Tag } from "@/components/ui/tag";
import { WaveDivider } from "@/components/ui/wave-divider";
import { pageMetadata } from "@/lib/site";

import popupStyles from "@/components/popup-with-us/popup-with-us-page.module.css";
// The prose and "Good to know" layout are shared with the maker page.
import styles from "@/components/sell-with-us/sell-with-us-page.module.css";

const TAGS = [
  {
    label: "Coffee + tea",
    color: "var(--color-ecs-cobalt)",
    ink: "#ffffff",
  },
  {
    label: "Baked goods",
    color: "var(--color-ecs-navy)",
    ink: "var(--color-ecs-surface)",
  },
  {
    label: "Street food",
    color: "var(--color-ecs-cerulean)",
    ink: "var(--color-ecs-ink)",
  },
  {
    label: "Sweet treats",
    color: "var(--color-ecs-teal-pale)",
    ink: "var(--color-ecs-teal-deep)",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "Pop up with us",
  description:
    "Apply to bring your food or drink popup to the front of El Cerrito Supply Co.",
  path: "/popup-with-us",
});

export default function PopupWithUsPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className={styles.intro}>
          <div>
            <Eyebrow
              color="var(--color-ecs-cobalt)"
              ink="#ffffff"
              className="mb-5"
            >
              Pop up with us
            </Eyebrow>
            <h1 className={styles.title}>
              Food + drink
              <br />
              popups
            </h1>
            <div className={`${styles.prose} ${popupStyles.introProse}`}>
              <p>
                Got a menu people line up for? Our sidewalk is open to food and
                drink popups, and we love giving a corner of it to someone new.
              </p>
              <p>
                Tell us what you make and how you set up. Popups from El Cerrito
                and the surrounding East Bay get first look.
              </p>
              <div className={popupStyles.tags}>
                {TAGS.map((tag) => (
                  <Tag key={tag.label} color={tag.color} ink={tag.ink}>
                    {tag.label}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <BlobImage
            src="/assets/photos/shop/storefront-awning.jpg"
            alt="The front of the shop: a white storefront under a scalloped blue-and-white awning, the blue door at 7523A, Supply Co. lettering on the window above a red brick sill, and a blue bistro table and two folding chairs on the sidewalk"
            radius="20% 44% 18% 40% / 26% 36% 20% 30%"
            ratio="3/2"
            sizes="(max-width: 700px) 100vw, 50vw"
            parallax={false}
            eager
          />
        </section>

        <section id="good-to-know" className={popupStyles.band}>
          <WaveDivider edge="top" fill="var(--color-ecs-navy)" />
          <WaveDivider edge="bottom" fill="var(--color-ecs-navy)" />
          <Blob
            color="color-mix(in srgb, var(--color-ecs-cobalt) 55%, transparent)"
            style={{
              right: "-4%",
              top: "10%",
              width: "clamp(150px,20vw,300px)",
              height: "clamp(150px,20vw,300px)",
            }}
          />
          <Blob
            color="color-mix(in srgb, var(--color-ecs-cerulean) 35%, transparent)"
            delay="1.4s"
            style={{
              left: "-5%",
              bottom: "8%",
              width: "clamp(110px,14vw,220px)",
              height: "clamp(110px,14vw,220px)",
            }}
          />

          <div className={`${styles.policy} ${popupStyles.bandInner}`}>
            <div>
              <Eyebrow
                color="var(--color-ecs-cerulean)"
                ink="var(--color-ecs-ink)"
                className="mb-5"
              >
                Good to know
              </Eyebrow>
              <h2 className={styles.policyHeading}>How it works</h2>
            </div>

            <div className={styles.prose}>
              <p>
                <strong>We will reach out.</strong> We may not be able to reply
                to every application, but if your popup is a fit, we will get in
                touch to talk about dates.
              </p>
              <p>
                <strong>Bring your own setup.</strong> You will need the health
                permit your food or drinks call for, and a way to take payment.
                If you are still working on either, apply anyway and tell us.
              </p>
              <p>
                <strong>Online only.</strong> So we can keep our attention on
                customers, we do not take applications in the shop or by phone.
              </p>
            </div>
          </div>
        </section>

        <PopupApplicationForm />
      </main>

      <SiteFooter />
    </>
  );
}
