"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
} from "react";

import { trackEvent } from "@/components/site/analytics";
import { button } from "@/components/ui/button";
import {
  initialApplicationState,
  type ApplicationState,
} from "@/lib/application-state";

import styles from "@/components/ui/form.module.css";

// The pieces the maker and popup applications share: the section that holds
// the card, the bot checks, the thank-you that replaces the form, and the
// running character count.

/** Clears the sticky header when the form scrolls itself into view. */
const SCROLL_OFFSET = 80;

/** "Up to 5,000 characters" when empty, then a running count. Fixed to
 * en-US so the prerender and the client agree. */
export function lengthHint(value: string, max: number) {
  const limit = max.toLocaleString("en-US");
  return value.length === 0
    ? `Up to ${limit} characters`
    : `${value.length.toLocaleString("en-US")} of ${limit} characters`;
}

export type ApplicationFieldsProps = {
  onReset: () => void;
  scrollToTop: () => void;
};

/** Scrolls the element the returned ref is on to just below the header. */
export function useScrollToTop<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const scrollToTop = useCallback(() => {
    const top = ref.current?.getBoundingClientRect().top ?? 0;
    window.scrollTo({
      top: window.scrollY + top - SCROLL_OFFSET,
      behavior: "smooth",
    });
  }, []);

  return { ref, scrollToTop };
}

type ApplicationAction = (
  state: ApplicationState,
  formData: FormData,
) => Promise<ApplicationState>;

/**
 * Wires a form to its Server Action. On success it sends `analyticsEvent`,
 * scrolls the card back into view and moves focus to the thank-you heading.
 */
export function useApplicationForm(
  action: ApplicationAction,
  analyticsEvent: string,
  scrollToTop: () => void,
) {
  const [state, formAction, pending] = useActionState(
    action,
    initialApplicationState,
  );
  // When the form appeared, for the server's too-fast-to-be-human check. Added
  // at submit rather than as a hidden input, which React resets after each
  // attempt, and set after mount so it isn't the prerender's build time.
  const startedRef = useRef(0);
  const sentTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedRef.current = Date.now();
  }, []);

  const submit = (formData: FormData) => {
    formData.set("started", String(startedRef.current));
    formAction(formData);
  };

  useEffect(() => {
    if (state.status !== "success") return;
    trackEvent(analyticsEvent);
    scrollToTop();
    // The submit button that had focus is gone; land on the thank-you
    // instead. scrollToTop already handles the scroll.
    sentTitleRef.current?.focus({ preventScroll: true });
  }, [state.status, analyticsEvent, scrollToTop]);

  return { state, submit, pending, sentTitleRef };
}

/** Replaces the form once it has been sent. */
export function ApplicationSent({
  message,
  titleRef,
  onReset,
}: {
  message: string;
  titleRef: RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
}) {
  return (
    <div className={styles.sent} aria-live="polite">
      <h2 ref={titleRef} tabIndex={-1} className={styles.sentTitle}>
        Thank you so much!
      </h2>
      <p className={styles.sentBody}>{message}</p>
      <button
        type="button"
        className={button({ variant: "outline", tone: "ply" })}
        onClick={onReset}
      >
        Submit another
      </button>
    </div>
  );
}

/** Hidden from users and assistive tech, tempting to bots. */
export function Honeypot() {
  return (
    <input
      type="text"
      name="fax"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="sr-only"
    />
  );
}

/**
 * The `#apply` section and card. "Submit another" remounts the fields with a
 * new key, which clears both the values and the action state.
 */
export function ApplicationSection({
  fields: Fields,
}: {
  fields: ComponentType<ApplicationFieldsProps>;
}) {
  const [attempt, setAttempt] = useState(0);
  const { ref: sectionRef, scrollToTop } = useScrollToTop<HTMLElement>();

  return (
    <section
      id="apply"
      ref={sectionRef}
      className="px-[clamp(14px,4vw,52px)] py-[clamp(24px,4vh,48px)] pb-[clamp(56px,10vh,120px)]"
    >
      <div className={styles.card}>
        <Fields
          key={attempt}
          scrollToTop={scrollToTop}
          onReset={() => {
            setAttempt((current) => current + 1);
            scrollToTop();
          }}
        />
      </div>
    </section>
  );
}
