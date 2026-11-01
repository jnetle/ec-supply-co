// Renders the link-preview card to public/og-image.png: the logo lockup on
// ultramarine under a faint iridescent film, with the address. Rerun after
// changing the logo or address, and keep SHARE_IMAGE in src/lib/site.ts in step with the size and alt text.
//
// Run: npm run og:image
//
// Fonts come straight from Google as TTF, since Satori can't read woff2.
import { readFile, writeFile } from "node:fs/promises";

import { ImageResponse } from "next/og.js";

const WIDTH = 1200;
// Square. The lockup stays in the middle band, so it survives the 1.91:1
// centre crop that X and Facebook apply to large link previews.
const HEIGHT = 1200;

const COLORS = {
  ground: "#130284", // --color-ecs-ultramarine
  paper: "#ffffff",
  ply: "#eddfc0", // --color-ecs-ply-pale
};

const FONTS = {
  figtree:
    "https://fonts.gstatic.com/s/figtree/v9/_Xmz-HUzqDCFdgfMsYiV_F7wfS-Bs_ehR15e.ttf",
};

async function font(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font ${url}: ${response.status}`);
  return response.arrayBuffer();
}

// Satori takes React elements; this is the same shape without JSX.
function h(type, style, ...children) {
  return {
    type,
    props: { style, children: children.length === 1 ? children[0] : children },
  };
}

// The .film sheet from globals.css: two soft bands of the pearly colour run
// with clear glass between, and a white glint. Satori has no blend modes, so
// low opacity stands in for the site's screen blend.
const FILM_STRENGTH = 0.16;
const film = [
  "linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.55) 48%, transparent 56%)",
  "linear-gradient(115deg, transparent 10%, #8ee6d8 20%, #a9b6ff 28%, #f2a9de 36%, transparent 46%, transparent 56%, #ffe1a4 64%, #a2f0cb 72%, #9cc3ff 80%, transparent 90%)",
].map((backgroundImage) =>
  h("div", {
    display: "flex",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage,
    opacity: FILM_STRENGTH,
  }),
);

const logo = await readFile(
  new URL("../public/assets/brand/ecsc-logo-color.png", import.meta.url),
);

const card = h(
  "div",
  {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.ground,
  },
  ...film,
  {
    type: "img",
    props: {
      src: `data:image/png;base64,${logo.toString("base64")}`,
      width: 1040,
      height: 257,
    },
  },
  h(
    "div",
    {
      fontFamily: "Figtree",
      fontSize: 34,
      marginTop: 48,
      color: COLORS.ply,
    },
    "7523A Fairmount Ave · El Cerrito, CA",
  ),
);

const response = new ImageResponse(card, {
  width: WIDTH,
  height: HEIGHT,
  fonts: [
    { name: "Figtree", data: await font(FONTS.figtree), weight: 600 },
  ],
});

const out = new URL("../public/og-image.png", import.meta.url);
await writeFile(out, Buffer.from(await response.arrayBuffer()));
console.log(`Wrote ${out.pathname} (${WIDTH}×${HEIGHT})`);
