"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { submitHostInquiry } from "@/app/actions/host-inquiry";
import {
  ApplicationSent,
  Honeypot,
  useApplicationForm,
  useScrollToTop,
} from "@/components/ui/application-form";
import { button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { CO_MARKETING_WORKSHOP_ENABLED } from "@/lib/content/host-with-us";
import {
  MAX_EMAIL_LENGTH,
  MAX_LONG_TEXT_LENGTH,
  MAX_SHORT_TEXT_LENGTH,
} from "@/lib/form-limits";

import styles from "@/components/ui/form.module.css";

const AFTER_HOURS_HINT =
  "Please keep in mind that private events are held outside of normal operating hours.";

const CATERING = [
  { value: "coffee-cart", label: "A coffee cart" },
  { value: "food-vendor", label: "A food vendor from the community" },
];

const SPACE_NEEDS = [
  { value: "additional-table", label: "An additional table" },
  { value: "garden-area", label: "The garden in the back, if available" },
];

export const RENTAL_TYPES = [
  { value: "private-event", label: "Private event" },
  { value: "co-marketing-workshop", label: "Co-marketing workshop" },
  { value: "pitch-an-idea", label: "Pitch an idea" },
] as const;

export type RentalType = (typeof RENTAL_TYPES)[number]["value"];

/** The rental types on offer right now; hidden ones can't be picked or linked. */
export const OFFERED_RENTAL_TYPES = RENTAL_TYPES.filter(
  (type) =>
    CO_MARKETING_WORKSHOP_ENABLED || type.value !== "co-marketing-workshop",
);

const CHOOSE_TYPE = "inquiry:choose-type";

const isRentalType = (value: string | null): value is RentalType =>
  OFFERED_RENTAL_TYPES.some((type) => type.value === value);

/**
 * Jumps to the form with the rental type already chosen. Elsewhere on the
 * site, link to `/host-with-us?type=<value>#inquiry` for the same effect.
 */
export function InquiryTypeLink({
  type,
  className,
  children,
}: {
  type: RentalType;
  className?: string;
  children: ReactNode;
}) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent(CHOOSE_TYPE, { detail: type }));
  };

  return (
    <a href="#inquiry" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

function InquiryFields({
  type,
  onTypeChange,
  onReset,
  onRestart,
  scrollToTop,
}: {
  type: string;
  onTypeChange: (type: string) => void;
  onReset: () => void;
  onRestart: () => void;
  scrollToTop: () => void;
}) {
  const { state, submit, pending, sentTitleRef } = useApplicationForm(
    submitHostInquiry,
    "host_inquiry",
    scrollToTop,
  );

  // Picking a card after sending brings the form back for that choice.
  useEffect(() => {
    if (state.status !== "success") return;
    window.addEventListener(CHOOSE_TYPE, onRestart);
    return () => window.removeEventListener(CHOOSE_TYPE, onRestart);
  }, [state.status, onRestart]);

  // Not <form action>, which resets the form after every attempt: a failed
  // send would wipe the visitor's answers, and React doesn't restore a
  // controlled <select>.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => submit(formData));
  };

  if (state.status === "success") {
    return (
      <ApplicationSent
        message={state.message}
        titleRef={sentTitleRef}
        onReset={onReset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>Get in touch</h3>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Contact name</legend>
        <div className={styles.pair}>
          <Field id="inquiry-first" label="First name" required>
            {(props) => (
              <input
                {...props}
                name="first"
                maxLength={MAX_SHORT_TEXT_LENGTH}
                required
                autoComplete="given-name"
              />
            )}
          </Field>
          <Field id="inquiry-last" label="Last name" required>
            {(props) => (
              <input
                {...props}
                name="last"
                maxLength={MAX_SHORT_TEXT_LENGTH}
                required
                autoComplete="family-name"
              />
            )}
          </Field>
        </div>
      </fieldset>

      <Field id="inquiry-email" label="Email" required>
        {(props) => (
          <input
            {...props}
            type="email"
            name="email"
              maxLength={MAX_EMAIL_LENGTH}
            required
            autoComplete="email"
          />
        )}
      </Field>

      <Field
        id="inquiry-type"
        label="How would you like to use the space?"
        required
      >
        {(props) => (
          <select
            {...props}
            className={`${props.className} ${styles.select}`}
            name="type"
            required
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="" disabled>
              Choose one
            </option>
            {OFFERED_RENTAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field
        id="inquiry-when"
        label="Preferred date/time"
        hint={AFTER_HOURS_HINT}
      >
        {(props) => <input {...props} type="datetime-local" name="when" />}
      </Field>

      <Field id="inquiry-people" label="How many people?">
        {(props) => (
          <input {...props} type="number" name="people" min={1} />
        )}
      </Field>

      <fieldset className={styles.fieldset}>
        <legend className={`${styles.legend} ${styles.legendQuestion}`}>
          Do you need outside catering?
        </legend>
        <div className={styles.choices}>
          {CATERING.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input type="checkbox" name="catering" value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={`${styles.legend} ${styles.legendQuestion}`}>
          What else do you need?
        </legend>
        <div className={styles.choices}>
          {SPACE_NEEDS.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input type="checkbox" name="needs" value={option.value} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        id="inquiry-about"
        label="Tell us about your event or idea"
        required
        multiline
      >
        {(props) => (
          <textarea
            {...props}
            name="about"
            maxLength={MAX_LONG_TEXT_LENGTH}
            required
            rows={4}
          />
        )}
      </Field>
      <Field id="inquiry-notes" label="Any additional information" multiline>
        {(props) => (
          <textarea
            {...props}
            name="notes"
            maxLength={MAX_LONG_TEXT_LENGTH}
            rows={3}
          />
        )}
      </Field>

      <Honeypot />

      <button
        type="submit"
        aria-busy={pending}
        disabled={pending}
        className={button({
          tone: "tealDeep",
          size: "lg",
          className: styles.submit,
        })}
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>

      <p className={styles.error} aria-live="polite">
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}

/**
 * One inquiry for every way to use the space. The dropdown tells us which of
 * the ways it is. "Send another" remounts the fields with a new key, which
 * clears both the values and the action state.
 */
export function InquiryForm() {
  const [attempt, setAttempt] = useState(0);
  const [type, setType] = useState("");
  const { ref, scrollToTop } = useScrollToTop<HTMLDivElement>();
  const restart = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("type");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after hydration
    if (isRentalType(fromUrl)) setType(fromUrl);

    const choose = (event: Event) => {
      setType((event as CustomEvent<RentalType>).detail);
    };
    window.addEventListener(CHOOSE_TYPE, choose);
    return () => window.removeEventListener(CHOOSE_TYPE, choose);
  }, []);

  return (
    <div id="inquiry" ref={ref} className={styles.card}>
      <InquiryFields
        key={attempt}
        type={type}
        onTypeChange={setType}
        onRestart={restart}
        scrollToTop={scrollToTop}
        onReset={() => {
          setType("");
          restart();
          scrollToTop();
        }}
      />
    </div>
  );
}
