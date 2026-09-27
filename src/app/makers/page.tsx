import type { Metadata } from "next";

import { MakerDirectory } from "@/components/makers/maker-directory";
import { PageFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageIntro } from "@/components/ui/page-intro";
import { SellWithUsBand } from "@/components/ui/sell-with-us-band";
import { MAKERS } from "@/lib/content/makers";

export const metadata: Metadata = {
  title: "Makers",
  description:
    "Every piece in the shop has a name attached. Meet everyone on our shelves right now.",
};

export default function MakersPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <PageIntro
          eyebrow={`${MAKERS.length} makers`}
          eyebrowColor="var(--color-ecs-pink-deep)"
          eyebrowInk="#ffffff"
          title="Who made it"
          lede="Every piece in the shop has a name attached. Here is everyone on our shelves right now."
        />
        <MakerDirectory />
        <SellWithUsBand />
      </main>

      <PageFooter />
    </>
  );
}
