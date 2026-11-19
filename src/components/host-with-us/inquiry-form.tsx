"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
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

/** How long the event would run, so a request can be checked against a free window. */
const DURATIONS = [
  { value: "1-2", label: "1 to 2 hours" },
  { value: "2-3", label: "2 to 3 hours" },
  { value: "3-4", label: "3 to 4 hours" },
  { value: "4-plus", label: "More than 4 hours" },
  { value: "unsure", label: "Not sure yet" },
];

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
const CHOOSE_WHEN = "inquiry:choose-when";

/**
 * Fills in the form's preferred date/time ("YYYY-MM-DDTHH:MM", shop time),
 * from a free window on the availability calendar. The caller links to
 * #inquiry for the scroll.
 */
export function chooseInquiryWhen(when: string) {
  window.dispatchEvent(new CustomEvent(CHOOSE_WHEN, { detail: when }));
}

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
  when,
  onTypeChange,
  onReset,
  onRestart,
  scrollToTop,
}: {
  type: string;
  /**
   * A time picked on the availability calendar, written into the field. A
   * new object per pick, so picking the same time again still rewrites it.
   */
  when: { value: string } | null;
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

  // Picking a card or a time after sending brings the form back for it.
  useEffect(() => {
    if (state.status !== "success") return;
    window.addEventListener(CHOOSE_TYPE, onRestart);
    window.addEventListener(CHOOSE_WHEN, onRestart);
    return () => {
      window.removeEventListener(CHOOSE_TYPE, onRestart);
      window.removeEventListener(CHOOSE_WHEN, onRestart);
    };
  }, [state.status, onRestart]);

  // The field stays uncontrolled, so the visitor can still change it; a
  // newly picked time just overwrites it.
  const whenRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (when && whenRef.current) whenRef.current.value = when.value;
  }, [when]);

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
        {(props) => (
          <input {...props} ref={whenRef} type="datetime-local" name="when" />
        )}
      </Field>

      <Field id="inquiry-duration" label="How long?">
        {(props) => (
          <select
            {...props}
            className={`${props.className} ${styles.select}`}
            name="duration"
            defaultValue=""
          >
            <option value="">Choose one</option>
            {DURATIONS.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        )}
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
  const [when, setWhen] = useState<{ value: string } | null>(null);
  const { ref, scrollToTop } = useScrollToTop<HTMLDivElement>();
  const restart = useCallback(() => setAttempt((current) => current + 1), []);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("type");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after hydration
    if (isRentalType(fromUrl)) setType(fromUrl);

    const choose = (event: Event) => {
      setType((event as CustomEvent<RentalType>).detail);
    };
    // A time from the availability calendar is for renting the space,
    // unless they've already said otherwise.
    const chooseWhen = (event: Event) => {
      setWhen({ value: (event as CustomEvent<string>).detail });
      setType((current) => current || "private-event");
    };
    window.addEventListener(CHOOSE_TYPE, choose);
    window.addEventListener(CHOOSE_WHEN, chooseWhen);
    return () => {
      window.removeEventListener(CHOOSE_TYPE, choose);
      window.removeEventListener(CHOOSE_WHEN, chooseWhen);
    };
  }, []);

  return (
    <div id="inquiry" ref={ref} className={styles.card}>
      <InquiryFields
        key={attempt}
        type={type}
        when={when}
        onTypeChange={setType}
        onRestart={restart}
        scrollToTop={scrollToTop}
        onReset={() => {
          setType("");
          setWhen(null);
          restart();
          scrollToTop();
        }}
      />
    </div>
  );
}
