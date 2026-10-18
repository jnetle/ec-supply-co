import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import { SHOP_ADDRESS } from "@/lib/content/nav";
import { pageMetadata, SITE_EMAIL, SITE_NAME } from "@/lib/site";

import styles from "@/components/privacy/privacy-page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "What El Cerrito Supply Co. collects through this website, why, who handles it, and how to have it changed or deleted.",
  path: "/privacy",
});

/**
 * Bump this whenever the policy's substance changes: a new form, a new
 * service that receives visitor data, or a change to what analytics records.
 */
const EFFECTIVE_DATE = "October 18, 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow="Privacy"
          eyebrowColor="var(--color-ecs-cobalt)"
          eyebrowInk="#ffffff"
          title="What we collect, and why."
          lede="The short version: we only ask for what we need to write back to you, we don't sell it, and the site doesn't track you with cookies."
        />

        <article className={styles.policy}>
          <p className={styles.effective}>Effective {EFFECTIVE_DATE}</p>

          <section>
            <h2>Who we are</h2>
            <p>
              {SITE_NAME} is a shop at {SHOP_ADDRESS.street}, {SHOP_ADDRESS.city}.
              This policy covers this website. It doesn&rsquo;t cover what
              happens in the shop itself, or other sites we link to, like
              Instagram or our makers&rsquo; own shops.
            </p>
          </section>

          <section>
            <h2>What you give us</h2>
            <p>We only collect personal information you choose to send:</p>
            <ul>
              <li>
                <strong>Newsletter sign-up:</strong> your email address, so we
                can send you shop news and events.
              </li>
              <li>
                <strong>Maker submissions:</strong> your name, business name,
                email, a link to your work, your city and your answers to the
                application questions, so we can review your work and get back
                to you.
              </li>
            </ul>
          </section>

          <section>
            <h2>What the site records on its own</h2>
            <p>
              We use privacy-friendly analytics to see how many people visit and
              which pages they read. It counts page views, the page that sent you
              here, your browser, device type and country, and whether a
              newsletter sign-up or maker submission went through.
              It doesn&rsquo;t use cookies, doesn&rsquo;t follow you to other
              sites, and doesn&rsquo;t tell us who you are.
            </p>
          </section>

          <section>
            <h2>Who handles it</h2>
            <p>
              We don&rsquo;t sell or rent your information. It&rsquo;s handled
              only by the companies that host this site and store our form
              submissions and newsletter list, and only to provide those
              services to us. We&rsquo;d also share information if the law
              required us to.
            </p>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <p>
              Newsletter addresses stay on the list until you ask to come off
              it. Maker submissions are kept while we review them and for
              future rounds. Ask us any time and we&rsquo;ll delete yours.
            </p>
          </section>

          <section>
            <h2>Your choices</h2>
            <ul>
              <li>
                To stop getting the newsletter, reply to any issue or email us,
                and we&rsquo;ll take you off the list.
              </li>
              <li>
                Email us to see, correct or delete what we have about you.
                California residents have these rights under state law, and we
                extend them to everyone.
              </li>
              <li>
                If your browser sends a Do Not Track or Global Privacy Control
                signal, there&rsquo;s nothing further for us to switch off:
                we don&rsquo;t track you across sites, and we don&rsquo;t sell
                or share your information for advertising.
              </li>
            </ul>
          </section>

          <section>
            <h2>Children</h2>
            <p>
              This site isn&rsquo;t meant for children under 13, and we
              don&rsquo;t knowingly collect their information. If you think a
              child has sent us something, let us know and we&rsquo;ll delete it.
            </p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>
              If we change what we collect, we&rsquo;ll update this page and the
              date at the top.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions or requests: <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
              , or write to us at {SHOP_ADDRESS.street}, {SHOP_ADDRESS.city}.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
