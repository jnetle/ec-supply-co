// Renders the link-preview card to public/og-image.png: the logo lockup on
// the hero's teal, with the address. Rerun after changing the logo or address,
// and keep SHARE_IMAGE in src/lib/site.ts in step with the size and alt text.
//
// Run: npm run og:image
//
// Fonts come straight from Google as TTF, since Satori can't read woff2.
import { readFile, writeFile } from "node:fs/promises";

import { ImageResponse } from "next/og.js";

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  ground: "#0a3940", // --color-ecs-teal-deep
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
