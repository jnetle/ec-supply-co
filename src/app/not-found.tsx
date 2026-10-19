import type { Metadata } from "next";
import Link from "next/link";

import { ErrorScene } from "@/components/errors/error-scene";
import { HangTag } from "@/components/errors/hang-tag";
import { MakerIntro } from "@/components/errors/maker-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { button } from "@/components/ui/button";
import { getSpotlightMakers } from "@/lib/makers";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
};

/** Every unmatched URL, and any route that calls notFound(). */
export default async function NotFound() {
  // Today's first spotlight pick. Missing when Wix is unreachable or the
  // roster is empty, and the page reads fine without the introduction.
  const [maker] = await getSpotlightMakers().catch(() => []);

  return (
    <>
      <SiteHeader />

      <main>
        <ErrorScene
          eyebrow="Error 404"
          eyebrowColor="var(--color-ecs-pink-deep)"
          eyebrowInk="#ffffff"
          title="This one found a home."
          lede="Everything here is one of a kind, and so was this page. Someone took it home before you got here. The maker's probably already working on the next one."
          actions={
            <>
              <Link href="/makers" className={button()}>
                Meet the makers →
              </Link>
              <Link href="/" className={button({ variant: "outline" })}>
                Back to the shop →
              </Link>
              <a
                href={`mailto:${SITE_EMAIL}`}
                className={button({ variant: "link", tone: "ink" })}
              >
                Tell us what you were after
              </a>
            </>
          }
          art={<HangTag />}
        >
          {maker && <MakerIntro maker={maker} />}
        </ErrorScene>
      </main>

      <SiteFooter />
    </>
  );
}
