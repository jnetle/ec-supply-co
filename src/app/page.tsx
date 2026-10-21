import type { Metadata } from "next";

import { About } from "@/components/home/about";
import { Carts, Hennai, Tools } from "@/components/home/bands";
import { Events } from "@/components/home/events";
import { Hero } from "@/components/home/hero";
import { MakerSpotlight } from "@/components/home/maker-spotlight";
import { ManifestoTeaser } from "@/components/home/manifesto-teaser";
import { Marquee } from "@/components/home/marquee";
import { Signup } from "@/components/home/signup";
import { Visit } from "@/components/home/visit";
import { StoreJsonLd } from "@/components/seo/store-json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ScrollEffects } from "@/components/ui/scroll-effects";
import { HOME_EVENTS_ENABLED } from "@/lib/content/calendar";
import { SITE_DESCRIPTION, SITE_NAME, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: { absolute: `${SITE_NAME} · Local makers shop in El Cerrito, CA` },
  description: SITE_DESCRIPTION,
  path: "/",
});

// Picks up maker edits in the Wix CMS, turns the daily maker spotlight over,
// and rolls the upcoming events forward, within five minutes.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <StoreJsonLd />
      {/* The brand sign stays behind the awning until the hero scrolls away. */}
      <SiteHeader revealBrandAfter="#hero-track" />

      <main>
        <Hero />
        <Marquee />
        <About />
        <ManifestoTeaser />
        <Hennai />
        <Carts />
        <Tools />
        {HOME_EVENTS_ENABLED && <Events />}
        <MakerSpotlight />
        <Visit />
        <Signup />
      </main>

      <SiteFooter />
      <ScrollEffects />
    </>
  );
}
