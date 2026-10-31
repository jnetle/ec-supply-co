import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The whole stylesheet is ~18KB, so shipping it in the HTML costs less
    // than the render-blocking requests it replaces.
    inlineCss: true,
    serverActions: {
      // The largest real submission, a maker application at every field's
      // limit, is about 15KB. The 1MB default only helps junk.
      bodySizeLimit: "64kb",
    },
  },
  images: {
    // AVIF is about 20% smaller than WebP; browsers without it get WebP.
    formats: ["image/avif", "image/webp"],
    // The shop's own photography is graded and sharp; 75 smeared it.
    qualities: [85],
    // Placeholder photos on /the-build, served straight from Unsplash.
    remotePatterns: [new URL("https://images.unsplash.com/photo-**")],
  },
};

export default nextConfig;
