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
import { EVENTS_ENABLED } from "@/lib/content/calendar";

/**
 * The whole home page. `previewEvents` fills "What's coming up" with Wix
 * events before they're switched on for everyone (see /home-preview).
 */
export function HomePage({
  previewEvents = false,
}: {
  previewEvents?: boolean;
}) {
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
        {(EVENTS_ENABLED || previewEvents) && (
          <Events preview={previewEvents} />
        )}
        <MakerSpotlight />
        <Visit />
        <Signup />
      </main>

      <SiteFooter />
      <ScrollEffects />
    </>
  );
}
