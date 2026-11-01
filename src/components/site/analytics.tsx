"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";
import { useEffect, useState } from "react";

import { button } from "@/components/ui/button";

import styles from "./analytics.module.css";

type Choice = "granted" | "denied";
type Mode = "pending" | "load" | "ask" | "off";

const CHOICE_KEY = "ecs-analytics-consent";
const COUNTRY_KEY = "ecs-country";
const REOPEN_EVENT = "ecs:cookie-choices";

// Set once Google Analytics is on the page, so events sent before then (or
// for visitors who said no) are dropped rather than warned about.
let gaLoaded = false;

/** Sends a GA event, if the visitor has Google Analytics running. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (gaLoaded) sendGAEvent("event", name, params);
}

/**
 * Google Analytics, loaded only for visitors it's allowed for. US visitors get
 * it unless their browser sends Global Privacy Control or Do Not Track;
 * everyone else is asked first. A choice, once made, is remembered.
 */
export function Analytics({ gaId }: { gaId: string }) {
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    let cancelled = false;
    decide().then((next) => {
      if (!cancelled) setMode(next);
    });
    const reopen = () => setMode("ask");
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => {
      cancelled = true;
      window.removeEventListener(REOPEN_EVENT, reopen);
    };
  }, []);

  // Stays set while the banner is reopened: gtag is still on the page.
  useEffect(() => {
    if (mode === "load") gaLoaded = true;
  }, [mode]);

  // Once GA is running, report every link and button click. One listener for
  // the whole page, so nothing has to be wired up per button.
  useEffect(() => {
    if (mode !== "load") return;
    document.addEventListener("click", reportClick, { capture: true });
    return () =>
      document.removeEventListener("click", reportClick, { capture: true });
  }, [mode]);

  const choose = (choice: Choice) => {
    write(localStorage, CHOICE_KEY, choice);
    if (choice === "granted") {
      setMode("load");
    } else if (gaLoaded) {
      // gtag can't be unloaded. Stop it writing cookies, clear the ones it
      // set, and start the page over without it.
      sendGAEvent("consent", "update", { analytics_storage: "denied" });
      clearGaCookies();
      window.location.reload();
    } else {
      setMode("off");
    }
  };

  if (mode === "load") return <GoogleAnalytics gaId={gaId} />;
  if (mode !== "ask") return null;

  return (
    <section
      aria-label="Cookie choices"
      className={styles.banner}
      data-no-track
    >
      <p className={styles.text}>
        We use cookies to improve your experience and analyze website
        traffic. By clicking “Allow,” you agree to our use of cookies as
        described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={button({ variant: "outline", tone: "ink", size: "sm" })}
          onClick={() => choose("denied")}
        >
          No thanks
        </button>
        <button
          type="button"
          className={button({ variant: "outline", tone: "ink", size: "sm" })}
          onClick={() => choose("granted")}
        >
          Allow
        </button>
      </div>
    </section>
  );
}

/** Reopens the cookie banner, so a visitor can change their mind. */
export function CookieChoicesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
    >
      Cookie choices
    </button>
  );
}

const CLICKABLE = "a[href], button, [role='button'], summary";
const AREA = "[role='dialog'], section, nav, header, footer, aside, main";

/**
 * Sends a `site_click` event for a click on a link or button: what it said,
 * where it goes, and which part of the page it was in. Page path comes along
 * with every GA event already.
 */
function reportClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const el = target.closest<HTMLElement>(CLICKABLE);
  if (!el || el.closest("[data-no-track]")) return;

  const params: Record<string, unknown> = {
    link_text: label(el),
    click_section: section(el),
  };
  if (el instanceof HTMLAnchorElement) {
    const url = new URL(el.href, location.href);
    const outbound = url.origin !== location.origin;
    params.link_url = outbound
      ? url.href
      : url.pathname + url.search + url.hash;
    params.outbound = outbound;
  }
  trackEvent("site_click", params);
}

function label(el: HTMLElement) {
  const text =
    el.getAttribute("aria-label") ||
    el.innerText ||
    el.querySelector("img")?.alt ||
    "";
  return text.replace(/\s+/g, " ").trim().slice(0, 100) || "(no label)";
}

/** The nearest named part of the page: its aria-label, or its id. */
function section(el: HTMLElement) {
  for (
    let node = el.closest(AREA);
    node;
    node = node.parentElement?.closest(AREA) ?? null
  ) {
    if (node.getAttribute("role") === "dialog") {
      const heading = node.getAttribute("aria-labelledby");
      const title = heading && document.getElementById(heading)?.innerText;
      return `dialog: ${(title || "untitled").trim().slice(0, 60)}`;
    }
    const name = node.getAttribute("aria-label") || node.id;
    if (name) return name;
  }
  return el.closest(AREA)?.tagName.toLowerCase() ?? "page";
}

async function decide(): Promise<Mode> {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || nav.doNotTrack === "1") return "off";

  const choice = read(localStorage, CHOICE_KEY);
  if (choice === "granted") return "load";
  if (choice === "denied") return "off";

  // An unknown country is treated as outside the US: ask.
  return (await country()) === "US" ? "load" : "ask";
}

async function country(): Promise<string | null> {
  const cached = read(sessionStorage, COUNTRY_KEY);
  if (cached) return cached;
  try {
    const res = await fetch("/api/region");
    const { country } = (await res.json()) as { country: string | null };
    if (country) write(sessionStorage, COUNTRY_KEY, country);
    return country;
  } catch {
    return null;
  }
}

function clearGaCookies() {
  const host = location.hostname;
  // GA sets its cookies on the widest domain it can, usually the apex, or
  // host-only where there's no wider one (localhost).
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0];
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      const scope = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/${scope}`;
    }
  }
}

// Storage can throw in private windows or with site data blocked.
function read(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {}
}
