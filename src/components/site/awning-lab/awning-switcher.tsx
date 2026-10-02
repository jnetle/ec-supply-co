"use client";

/* TEMPORARY — floating picker for the awning candidates. Arrow buttons or
   number keys or ← → switch; H or the toggle turns the hanging nav on and off.
   Both choices are remembered in this browser. */

import { useEffect, useSyncExternalStore } from "react";

import {
  VARIANTS,
  awningStore,
  hangStore,
  setHang,
  setVariant,
  switcherEnabled,
} from "./store";

const noSubscribe = () => () => {};

export function AwningSwitcher() {
  const enabled = useSyncExternalStore(
    noSubscribe,
    switcherEnabled,
    () => false,
  );
  const variant = useSyncExternalStore(
    awningStore.subscribe,
    awningStore.getSnapshot,
    awningStore.getServerSnapshot,
  );
  const hangToggle = useSyncExternalStore(
    hangStore.subscribe,
    hangStore.getSnapshot,
    hangStore.getServerSnapshot,
  );
  const index = VARIANTS.findIndex((v) => v.slug === variant);
  // The original stays the untouched baseline.
  const hangLocked = variant === "current";
  const hangShown = hangToggle && !hangLocked;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const at = VARIANTS.findIndex(
          (v) => v.slug === awningStore.getSnapshot(),
        );
        const by = e.key === "ArrowLeft" ? -1 : 1;
        setVariant(
          VARIANTS[(at + by + VARIANTS.length) % VARIANTS.length].slug,
        );
        e.preventDefault();
        return;
      }
      if (e.key === "h" || e.key === "H") {
        setHang(!hangStore.getSnapshot());
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && VARIANTS[n]) setVariant(VARIANTS[n].slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  if (!enabled) return null;

  const step = (by: number) =>
    setVariant(VARIANTS[(index + by + VARIANTS.length) % VARIANTS.length].slug);

  const button: React.CSSProperties = {
    all: "unset",
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 16,
    lineHeight: 1,
  };

  return (
    <div
      role="group"
      aria-label="Awning preview"
      style={{
        position: "fixed",
        left: "50%",
        // Clear of the Next.js dev badge in the bottom-left corner.
        bottom: 64,
        transform: "translateX(-50%)",
        maxWidth: "calc(100vw - 24px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "rgba(30, 28, 26, 0.88)",
        color: "#f4f1e8",
        font: "600 13px/1 system-ui, sans-serif",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      }}
    >
      <button
        type="button"
        style={button}
        onClick={() => step(-1)}
        aria-label="Previous awning"
      >
        ‹
      </button>
      <span
        // A fixed width, so the arrows either side never move as the label
        // changes; it only shrinks when the screen is too narrow.
        style={{
          minWidth: 0,
          width: 300,
          flex: "0 1 300px",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {index}. {VARIANTS[index].label}
      </span>
      <button
        type="button"
        style={button}
        onClick={() => step(1)}
        aria-label="Next awning"
      >
        ›
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={hangShown}
        disabled={hangLocked}
        onClick={() => setHang(!hangToggle)}
        title={
          variant === "current"
            ? "The original keeps its own layout"
            : "Hang the nav from a half-height strip (H)"
        }
        style={{
          ...button,
          fontSize: 12,
          padding: "6px 12px",
          marginLeft: 4,
          cursor: hangLocked ? "default" : "pointer",
          opacity: hangLocked ? 0.45 : 1,
          background: hangShown ? "#f4f1e8" : "rgba(244, 241, 232, 0.12)",
          color: hangShown ? "#1e1c1a" : "#f4f1e8",
          whiteSpace: "nowrap",
        }}
      >
        Hanging nav: {hangShown ? "on" : "off"}
      </button>
    </div>
  );
}
