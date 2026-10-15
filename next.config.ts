import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
