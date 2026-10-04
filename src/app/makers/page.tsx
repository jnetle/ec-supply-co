import type { Metadata } from "next";

import { MakerDirectory } from "@/components/makers/maker-directory";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import { ScrollEffects } from "@/components/ui/scroll-effects";
import { SellWithUsBand } from "@/components/ui/sell-with-us-band";
import { getMakers } from "@/lib/makers";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Makers",
  description:
    "Every piece in the shop has a name attached. Meet the local makers in El Cerrito and the East Bay on our shelves right now.",
  path: "/makers",
});

// Picks up edits in the Wix CMS within five minutes.
export const revalidate = 300;

export default async function MakersPage() {
  const makers = await getMakers();

  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow={`${makers.length} makers`}
          eyebrowColor="var(--color-ecs-pink-deep)"
          eyebrowInk="#ffffff"
          title="Who made it"
          lede="Every piece in the shop has a name attached. Here is everyone on our shelves right now."
        />
        <MakerDirectory makers={makers} />
        <SellWithUsBand />
      </main>

      <SiteFooter />
      <ScrollEffects />
    </>
  );
}
