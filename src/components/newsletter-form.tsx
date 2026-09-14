"use client";

import { useActionState } from "react";

import { subscribe } from "@/app/actions/newsletter";
import { initialSubscribeState } from "@/lib/newsletter";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initialSubscribeState);

  if (state.status === "success") {
    return (
      <p
        aria-live="polite"
        className="text-base font-medium text-zinc-950 dark:text-zinc-50"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3">
      <label htmlFor="newsletter-email" className="text-sm font-medium">
        Get restock alerts and new arrivals
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={state.status === "error" ? "newsletter-error" : undefined}
          aria-invalid={state.status === "error" || undefined}
          className="h-12 flex-1 rounded-full border border-black/[.08] bg-transparent px-5 text-base outline-none placeholder:text-zinc-500 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-white/[.145] dark:focus-visible:ring-zinc-50"
        />

        {/* Honeypot: hidden from users and assistive tech, tempting to bots. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
        />

        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          {pending ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      <p
        id="newsletter-error"
        aria-live="polite"
        className="min-h-5 text-sm text-red-600 dark:text-red-400"
      >
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
