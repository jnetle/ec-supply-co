"use client";

import { useSyncExternalStore } from "react";

import { todayKey } from "./event-model";

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
