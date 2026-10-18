import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The whole stylesheet is ~18KB, so shipping it in the HTML costs less
    // than the render-blocking requests it replaces.
    inlineCss: true,
  },
  images: {
    // AVIF is about 20% smaller than WebP; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    // Placeholder photos on /the-build, served straight from Unsplash.
    remotePatterns: [new URL("https://images.unsplash.com/photo-**")],
  },
  async redirects() {
    return [
      // The page started as /thanks; old links and shared photo credits land here.
      { source: "/thanks", destination: "/the-build", permanent: true },
      // Was /private-events before the inquiries merged into one form.
      {
        source: "/private-events",
        destination: "/host-with-us",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
