"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { submitMakerApplication } from "@/app/actions/maker-application";
import { trackEvent } from "@/components/site/analytics";
import { button } from "@/components/ui/button";
import { Field, Required } from "@/components/ui/field";
import {
  MAX_EMAIL_LENGTH,
  MAX_LONG_TEXT_LENGTH,
  MAX_SHORT_TEXT_LENGTH,
  MAX_URL_LENGTH,
} from "@/lib/form-limits";
import { initialMakerApplicationState } from "@/lib/maker-application";

import styles from "@/components/ui/form.module.css";

/** Clears the sticky header when the form scrolls itself into view. */
const SCROLL_OFFSET = 80;

/** "Up to 5,000 characters" when empty, then a running count. Fixed to
 * en-US so the prerender and the client agree. */
function lengthHint(value: string, max: number) {
  const limit = max.toLocaleString("en-US");
  return value.length === 0
    ? `Up to ${limit} characters`
    : `${value.length.toLocaleString("en-US")} of ${limit} characters`;
}

const WHOLESALE_UNDERSTANDING = [
  { value: "yes", label: "Yes" },
  { value: "learning", label: "Still learning" },
  { value: "no", label: "No" },
];

const PRICING_READY = [
  { value: "yes", label: "Yes" },
  { value: "working", label: "Working on it" },
  { value: "no", label: "No" },
];

type ApplicationFormValues = {
  first: string;
  last: string;
  business: string;
  email: string;
  link: string;
  about: string;
  city: string;
  connection: string;
  wholesale: string;
  pricing: string;
};

const EMPTY_APPLICATION: ApplicationFormValues = {
  first: "",
  last: "",
  business: "",
  email: "",
  link: "",
  about: "",
  city: "",
  connection: "",
  wholesale: "",
  pricing: "",
};

type ApplicationFormFieldsProps = {
  onReset: () => void;
  scrollToTop: () => void;
};

function ApplicationFormFields({
  onReset,
  scrollToTop,
}: ApplicationFormFieldsProps) {
  const [state, formAction, pending] = useActionState(
    submitMakerApplication,
    initialMakerApplicationState,
  );
  const [values, setValues] = useState(EMPTY_APPLICATION);
  // When the form appeared, for the server's too-fast-to-be-human check. Added
  // at submit rather than as a hidden input, which React resets after each
  // attempt, and set after mount so it isn't the prerender's build time.
  const startedRef = useRef(0);
  const sentTitleRef = useRef<HTMLHeadingElement>(null);

  const updateValue = (name: keyof ApplicationFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    startedRef.current = Date.now();
  }, []);

  const submit = (formData: FormData) => {
    formData.set("started", String(startedRef.current));
    formAction(formData);
  };

  useEffect(() => {
    if (state.status !== "success") return;
    trackEvent("maker_application");
    scrollToTop();
    // The submit button that had focus is gone; land on the thank-you
    // instead. scrollToTop already handles the scroll.
    sentTitleRef.current?.focus({ preventScroll: true });
  }, [state.status, scrollToTop]);

  if (state.status === "success") {
    return (
      <div className={styles.sent} aria-live="polite">
        <h2 ref={sentTitleRef} tabIndex={-1} className={styles.sentTitle}>
          Thank you so much!
        </h2>
        <p className={styles.sentBody}>{state.message}</p>
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

  return (
    <form action={submit} className={styles.form}>
      <div>
        <h2 className={styles.heading}>Apply</h2>
        <p className={styles.intro}>
          Fields marked <Required /> must be filled in.
        </p>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Name</legend>
        <div className={styles.pair}>
          <Field id="first" label="First name" required>
            {(props) => (
              <input
                {...props}
                name="first"
                maxLength={MAX_SHORT_TEXT_LENGTH}
                required
                autoComplete="given-name"
                value={values.first}
                onChange={(event) => updateValue("first", event.target.value)}
              />
            )}
          </Field>
          <Field id="last" label="Last name" required>
            {(props) => (
              <input
                {...props}
                name="last"
                maxLength={MAX_SHORT_TEXT_LENGTH}
                required
                autoComplete="family-name"
                value={values.last}
                onChange={(event) => updateValue("last", event.target.value)}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <div className={styles.pair}>
        <Field id="business" label="Business name" required>
          {(props) => (
            <input
              {...props}
              name="business"
              maxLength={MAX_SHORT_TEXT_LENGTH}
              required
              autoComplete="organization"
              value={values.business}
              onChange={(event) => updateValue("business", event.target.value)}
            />
          )}
        </Field>
        <Field id="email" label="Email" required>
          {(props) => (
            <input
              {...props}
              type="email"
              name="email"
              maxLength={MAX_EMAIL_LENGTH}
              required
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field
        id="link"
        label="Website or social media"
        required
        hint="We need to see your work. Applications without a link can't be considered."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            name="link"
            maxLength={MAX_URL_LENGTH}
            required
            placeholder="yourshop.com"
            value={values.link}
            onChange={(event) => updateValue("link", event.target.value)}
          />
        )}
      </Field>

      <Field
        id="about"
        label="Tell us about yourself and your work"
        required
        multiline
        hint={lengthHint(values.about, MAX_LONG_TEXT_LENGTH)}
      >
        {(props) => (
          <textarea
            {...props}
            name="about"
            maxLength={MAX_LONG_TEXT_LENGTH}
            required
            rows={5}
            value={values.about}
            onChange={(event) => updateValue("about", event.target.value)}
          />
        )}
      </Field>

      <Field id="city" label="Current city of residence">
        {(props) => (
          <input
            {...props}
            name="city"
            maxLength={MAX_SHORT_TEXT_LENGTH}
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => updateValue("city", event.target.value)}
          />
        )}
      </Field>

      <Field
        id="connection"
        label="Your connection to El Cerrito"
        multiline
        hint={lengthHint(values.connection, MAX_LONG_TEXT_LENGTH)}
      >
        {(props) => (
          <textarea
            {...props}
            name="connection"
            maxLength={MAX_LONG_TEXT_LENGTH}
            rows={3}
            placeholder="If you have one, tell us"
            value={values.connection}
            onChange={(event) => updateValue("connection", event.target.value)}
          />
        )}
      </Field>

      <fieldset className={styles.fieldset}>
        <legend className={`${styles.legend} ${styles.legendQuestion}`}>
          Do you have a basic understanding of how wholesale works? <Required />
        </legend>
        <div className={styles.choices}>
          {WHOLESALE_UNDERSTANDING.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input
                type="radio"
                name="wholesale"
                value={option.value}
                required
                checked={values.wholesale === option.value}
                onChange={(event) =>
                  updateValue("wholesale", event.target.value)
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={`${styles.legend} ${styles.legendQuestion}`}>
          Are you ready to share wholesale pricing and/or a line sheet?
        </legend>
        <div className={styles.choices}>
          {PRICING_READY.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input
                type="radio"
                name="pricing"
                value={option.value}
                checked={values.pricing === option.value}
                onChange={(event) => updateValue("pricing", event.target.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot: hidden from users and assistive tech, tempting to bots. */}
      <input
        type="text"
        name="fax"
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
          tone: "cerulean",
          size: "lg",
          className: styles.submit,
        })}
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>

      <p className={styles.error} aria-live="polite">
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}

export function ApplicationForm() {
  const [attempt, setAttempt] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToTop = useCallback(() => {
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    window.scrollTo({
      top: window.scrollY + top - SCROLL_OFFSET,
      behavior: "smooth",
    });
  }, []);

  return (
    <section
      id="apply"
      ref={sectionRef}
      className="px-[clamp(14px,4vw,52px)] py-[clamp(24px,4vh,48px)] pb-[clamp(56px,10vh,120px)]"
    >
      <div className={styles.card}>
        <ApplicationFormFields
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
