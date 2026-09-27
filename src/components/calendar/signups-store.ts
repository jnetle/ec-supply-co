"use client";

import { useCallback, useSyncExternalStore } from "react";

import { SIGNUPS_STORAGE_KEY } from "@/lib/content/calendar";

import { todayKey } from "./event-model";

/** Seats this visitor has saved, keyed by event id. */
export type MySeats = Readonly<Record<string, number>>;

const EMPTY: MySeats = {};

/**
 * Seats live in localStorage, which is an external system rather than React
 * state: it is per-browser, absent during SSR, and can be changed by another
 * tab. Reading it through a store keeps the server and first client render
 * agreeing on `EMPTY` and corrects them in the same pass.
 */
const listeners = new Set<() => void>();

// getSnapshot must return a stable reference between changes, so the parsed
// value is cached and only replaced when it actually changes.
let snapshot: MySeats = EMPTY;
let parsedFrom: string | null = null;

function read(): MySeats {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SIGNUPS_STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: nothing is remembered.
    return EMPTY;
  }

  if (raw === parsedFrom) return snapshot;
  parsedFrom = raw;

  try {
    snapshot = raw ? JSON.parse(raw) : EMPTY;
  } catch {
    snapshot = EMPTY;
  }
  return snapshot;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab booking a seat should show up here too.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(next: MySeats) {
  snapshot = next;
  try {
    const serialized = JSON.stringify(next);
    parsedFrom = serialized;
    localStorage.setItem(SIGNUPS_STORAGE_KEY, serialized);
  } catch {
    // The seats stay in memory for this page view even if they can't persist.
    parsedFrom = null;
  }
  listeners.forEach((listener) => listener());
}

export function useMySeats() {
  const seats = useSyncExternalStore(subscribe, read, () => EMPTY);

  const reserve = useCallback((eventId: string, count: number) => {
    const current = read();
    write({ ...current, [eventId]: (current[eventId] ?? 0) + count });
  }, []);

  return { seats, reserve };
}

/**
 * Today's date, as the visitor's browser sees it. Empty during SSR so no
 * event is marked past before the client can say what day it is.
 */
export function useToday() {
  return useSyncExternalStore(
    () => () => {},
    () => todayKey(),
    () => "",
  );
}
