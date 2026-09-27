import { About } from "@/components/home/about";
import { Carts, Hennai, Tools } from "@/components/home/bands";
import { Events } from "@/components/home/events";
import { Hero } from "@/components/home/hero";
import { MakerSpotlight } from "@/components/home/maker-spotlight";
import { ManifestoTeaser } from "@/components/home/manifesto-teaser";
import { Marquee } from "@/components/home/marquee";
import { Signup } from "@/components/home/signup";
import { Visit } from "@/components/home/visit";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ScrollEffects } from "@/components/ui/scroll-effects";

export default function HomePage() {
  return (
    <>
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
        <Events />
        <MakerSpotlight />
        <Visit />
        <Signup />
      </main>

      <SiteFooter />
      <ScrollEffects />
    </>
  );
}
