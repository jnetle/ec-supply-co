"use client";

import { useActionState } from "react";

import { subscribe } from "@/app/actions/newsletter";
import { initialSubscribeState } from "@/lib/newsletter";

import styles from "./newsletter-form.module.css";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribe,
    initialSubscribeState,
  );

  if (state.status === "success") {
    return (
      <p aria-live="polite" className={styles.success}>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>

      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        aria-describedby="newsletter-message"
        aria-invalid={state.status === "error" || undefined}
        className={styles.input}
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

      <button type="submit" disabled={pending} className={styles.button}>
        {pending ? "Signing up…" : "Sign up"}
      </button>

      <p id="newsletter-message" aria-live="polite" className={styles.message}>
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
