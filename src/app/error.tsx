"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorScene } from "@/components/errors/error-scene";
import { KilnSign } from "@/components/errors/kiln-sign";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Any page that throws while rendering. The root layout still stands, so
 * the header and footer come along; global-error.tsx covers the layout.
 */
export default function ErrorPage({ error, retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      {/* Error boundaries can't export metadata. */}
      <title>Still in the studio · El Cerrito Supply Co.</title>
      <SiteHeader />

      <main>
        <ErrorScene
          eyebrow="Something broke"
          eyebrowColor="var(--color-ecs-marigold)"
          eyebrowInk="var(--color-ecs-ink)"
          title="Still in the studio."
          lede="This page isn't quite finished. The glaze is still wet. Give it another go, and if it keeps happening, let us know."
          actions={
            <>
              <button type="button" onClick={retry} className={button()}>
                Try again
              </button>
              <Link href="/" className={button({ variant: "outline" })}>
                Back to the shop →
              </Link>
            </>
          }
          footnote={error.digest && <>Reference: {error.digest}</>}
          art={<KilnSign />}
        />
      </main>

      <SiteFooter />
    </>
  );
}
