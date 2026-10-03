// Shared by Server and Client Components, so free of `server-only`.

/** Where Wix serves CMS uploads; src/lib/makers.ts builds image URLs on it. */
export const WIX_MEDIA = "https://static.wixstatic.com/media/";

export function isWixMedia(src: string) {
  return src.startsWith(WIX_MEDIA);
}
