/* TEMPORARY — awning exploration. Delete the awning-lab folder once a
   variant is chosen.

   Which variant is showing lives here rather than in React state so the
   awning and the switcher (siblings in the header) share it without a
   provider. A `?awning=<slug>` link wins over the remembered choice, so a
   specific option can be sent to someone. */

export const VARIANTS = [
  { slug: "current", label: "Current" },
  { slug: "reference", label: "Stripes.png match" },
  { slug: "watercolor", label: "Watercolor original" },
  { slug: "watercolor-flat", label: "Watercolor, no scallops" },
  { slug: "subtle", label: "Subtle cream (Home@1x)" },
  { slug: "subtle-flat", label: "Subtle cream, no scallops" },
  { slug: "glass", label: "Frosted cream, no scallops" },
  { slug: "painted", label: "Painted-edge cream" },
  { slug: "painted-flat", label: "Painted-edge cream, wavy hem" },
  { slug: "painted-ink", label: "Painted-edge black & cream, wavy hem" },
  { slug: "subtle-frost", label: "Subtle cream, frosted 70%" },
  { slug: "retro", label: "Retro black & cream, no scallops" },
  { slug: "painted-mono", label: "Painted-edge monotone, wavy hem" },
  { slug: "subtle-mono", label: "Monotone, no scallops" },
  { slug: "doodle", label: "Loose doodle" },
  { slug: "line-art", label: "Line art, no scallops" },
  { slug: "line-art-wash", label: "Line art + monotone watercolor" },
  { slug: "cut-paper", label: "Cut paper (teal)" },
  { slug: "reference-teal", label: "Stripes.png match, teal" },
  { slug: "painted-teal", label: "Painted-edge teal & cream, wavy hem" },
] as const;

export type VariantSlug = (typeof VARIANTS)[number]["slug"];

/** Variants that restyle the original CSS awning instead of being drawn. */
export const CSS_VARIANTS = [
  "current",
  "subtle",
  "subtle-flat",
  "glass",
  "subtle-frost",
  "retro",
  "subtle-mono",
] as const satisfies readonly VariantSlug[];

export type CssVariant = (typeof CSS_VARIANTS)[number];

export const isCssVariant = (v: VariantSlug): v is CssVariant =>
  (CSS_VARIANTS as readonly string[]).includes(v);

const STORAGE_KEY = "ecs-awning-variant";
const isSlug = (value: unknown): value is VariantSlug =>
  VARIANTS.some((v) => v.slug === value);

const listeners = new Set<() => void>();
let current: VariantSlug | null = null;

function read(): VariantSlug {
  if (current) return current;
  const fromUrl = new URLSearchParams(window.location.search).get("awning");
  if (isSlug(fromUrl)) {
    current = fromUrl;
    return current;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSlug(stored)) current = stored;
  } catch {
    // Storage blocked — fall through to the default.
  }
  return (current ??= "current");
}

export function setVariant(slug: VariantSlug) {
  current = slug;
  try {
    window.localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // Not remembered across reloads; still applies now.
  }
  const url = new URL(window.location.href);
  if (url.searchParams.has("awning")) {
    url.searchParams.set("awning", slug);
    window.history.replaceState(null, "", url);
  }
  listeners.forEach((fn) => fn());
}

export const awningStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getSnapshot: read,
  // The server always renders the current awning; the chosen variant swaps
  // in right after hydration.
  getServerSnapshot: (): VariantSlug => "current",
};

/* The hanging-nav toggle: same storage and `?hang=1` URL handling as the
   variant, kept separately so each option can be seen both ways. */
const HANG_KEY = "ecs-awning-hang";
const hangListeners = new Set<() => void>();
let hangOn: boolean | null = null;

function readHang(): boolean {
  if (hangOn !== null) return hangOn;
  const fromUrl = new URLSearchParams(window.location.search).get("hang");
  if (fromUrl !== null) return (hangOn = fromUrl === "1");
  try {
    hangOn = window.localStorage.getItem(HANG_KEY) === "1";
  } catch {
    hangOn = false;
  }
  return hangOn;
}

export function setHang(on: boolean) {
  hangOn = on;
  try {
    window.localStorage.setItem(HANG_KEY, on ? "1" : "0");
  } catch {
    // Not remembered across reloads; still applies now.
  }
  const url = new URL(window.location.href);
  if (url.searchParams.has("awning")) {
    url.searchParams.set("hang", on ? "1" : "0");
    window.history.replaceState(null, "", url);
  }
  hangListeners.forEach((fn) => fn());
}

export const hangStore = {
  subscribe(fn: () => void) {
    hangListeners.add(fn);
    return () => hangListeners.delete(fn);
  },
  getSnapshot: readHang,
  getServerSnapshot: () => false,
};

/** Whether `variant` shows as the hanging-nav strip: when the toggle is
    on, for every variant but the original. */
export const isHanging = (variant: VariantSlug, toggle: boolean) =>
  toggle && variant !== "current";

/** Shown in dev, or anywhere once `?awning` is in the URL. */
export function switcherEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    new URLSearchParams(window.location.search).has("awning")
  );
}
