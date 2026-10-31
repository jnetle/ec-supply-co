"use client";

import { useActionState, useEffect, useRef } from "react";

import { subscribe } from "@/app/actions/newsletter";
import { trackEvent } from "@/components/site/analytics";
import { HONEYPOT_FIELD, MAX_EMAIL_LENGTH } from "@/lib/form-limits";
import { initialSubscribeState } from "@/lib/newsletter";
import { button } from "@/components/ui/button";

import styles from "./newsletter-form.module.css";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribe,
    initialSubscribeState,
  );
  const successRef = useRef<HTMLParagraphElement>(null);

  // The form, and the button that had focus, are gone; keep keyboard and
  // screen reader users on the confirmation instead of the top of the page.
  useEffect(() => {
    if (state.status !== "success") return;
    successRef.current?.focus();
    trackEvent("newsletter_signup");
  }, [state.status]);

  if (state.status === "success") {
    return (
      <p
        ref={successRef}
        tabIndex={-1}
        aria-live="polite"
        className={styles.success}
      >
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
        maxLength={MAX_EMAIL_LENGTH}
        autoComplete="email"
        placeholder="you@example.com"
        aria-describedby="newsletter-message"
        aria-invalid={state.status === "error" || undefined}
        className={styles.input}
      />

      {/* Honeypot: hidden from users and assistive tech, tempting to bots. */}
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <button
        type="submit"
        aria-busy={pending}
        disabled={pending}
        className={button({
          tone: "film",
          size: "lg",
          className: styles.submit,
        })}
      >
        {pending ? "Signing up…" : "Sign up"}
      </button>

      <p id="newsletter-message" aria-live="polite" className={styles.message}>
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
