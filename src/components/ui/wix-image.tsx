"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

import { WIX_MEDIA } from "@/lib/wix-media";

/**
 * A Wix media image sized by Wix's own CDN instead of the Next.js optimizer,
 * so serving it costs no image transformations on our host. Wix crops to
 * `ratio` around the centre — what `object-fit: cover` would show anyway — and
 * `enc_auto` picks WebP or AVIF per browser.
 *
 * A Client Component only because next/image's `loader` is a function.
 */
export function WixImage({
  ratio,
  ...props
}: Omit<ImageProps, "src" | "loader"> & {
  src: string;
  /** CSS `aspect-ratio` of the frame, e.g. "1/1" or "16/10". */
  ratio: string;
}) {
  const [w, h = 1] = ratio.split("/").map(Number);
  const aspect = w / h || 1;

  const loader: ImageLoader = ({ src, width, quality }) => {
    const mediaId = src.slice(WIX_MEDIA.length);
    const height = Math.round(width / aspect);
    const q = quality ?? 75;
    return `${src}/v1/fill/w_${width},h_${height},al_c,q_${q},enc_auto/${mediaId}`;
  };

  return <Image {...props} loader={loader} />;
}
