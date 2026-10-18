"use client";

import { useEffect } from "react";

import { ErrorScene } from "@/components/errors/error-scene";
import { KilnSign } from "@/components/errors/kiln-sign";
import { button } from "@/components/ui/button";
import { FONT_VARIABLES } from "@/lib/fonts";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * When the root layout itself fails. This replaces the whole document, so it
 * brings its own <html>, fonts and global styles, and leaves out the header
 * and footer in case they're what broke. The home link is a plain <a> so it
 * reloads the page rather than reusing the broken client state.
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={FONT_VARIABLES}>
      <body>
        <title>Still in the studio · El Cerrito Supply Co.</title>
        <main>
          <ErrorScene
            eyebrow="Something broke"
            eyebrowColor="var(--color-ecs-marigold)"
            eyebrowInk="var(--color-ecs-ink)"
            title="Still in the studio."
            lede="The whole site's still in the kiln. Give it another go, and if it keeps happening, let us know."
            actions={
              <>
                <button type="button" onClick={retry} className={button()}>
                  Try again
                </button>
                {/* A full reload on purpose; see the note above. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/" className={button({ variant: "outline" })}>
                  Back to the shop →
                </a>
              </>
            }
            footnote={error.digest && <>Reference: {error.digest}</>}
            art={<KilnSign />}
          />
        </main>
      </body>
    </html>
  );
}
