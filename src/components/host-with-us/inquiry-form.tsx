"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { CO_MARKETING_WORKSHOP_ENABLED } from "@/lib/content/host-with-us";

import styles from "@/components/ui/form.module.css";

const AFTER_HOURS_HINT =
  "Please keep in mind that private events are held outside of normal operating hours.";

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

/**
 * One inquiry for every way to use the room. The rental type dropdown tells
 * us which kind it is.
 *
 * TODO: wire the submit endpoint. The newsletter signup in
 * src/app/actions/newsletter.ts shows the shape.
 */
export function InquiryForm() {
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("type");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after hydration
    if (isRentalType(fromUrl)) setType(fromUrl);

    const choose = (event: Event) => {
      setSent(false);
      setType((event as CustomEvent<RentalType>).detail);
    };
    window.addEventListener(CHOOSE_TYPE, choose);
    return () => window.removeEventListener(CHOOSE_TYPE, choose);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div id="inquiry" className={styles.card}>
      {sent ? (
        <div className={styles.sent}>
          <h3 className={styles.sentTitle}>Thanks — we got it.</h3>
          <p className={styles.sentBody}>
            We will be in touch about availability and next steps.
          </p>
          <button
            type="button"
            className={button({ variant: "outline", tone: "ply" })}
            onClick={() => {
              setSent(false);
              setType("");
            }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.heading}>Rental inquiry</h3>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Contact name</legend>
            <div className={styles.pair}>
              <Field id="inquiry-first" label="First name" required>
                {(props) => (
                  <input
                    {...props}
                    name="first"
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
                required
                autoComplete="email"
              />
            )}
          </Field>

          <label className={styles.checkbox}>
            <input type="checkbox" name="news" />
            Sign up for news and updates
          </label>

          <Field id="inquiry-type" label="Type of rental" required>
            {(props) => (
              <select
                {...props}
                className={`${props.className} ${styles.select}`}
                name="type"
                required
                value={type}
                onChange={(event) => setType(event.target.value)}
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

          <Field
            id="inquiry-about"
            label="Tell us about your event or idea"
            required
            multiline
          >
            {(props) => <textarea {...props} name="about" required rows={4} />}
          </Field>
          <Field id="inquiry-notes" label="Any additional information" multiline>
            {(props) => <textarea {...props} name="notes" rows={3} />}
          </Field>

          <button
            type="submit"
            className={button({
              tone: "magenta",
              size: "lg",
              className: styles.submit,
            })}
          >
            Send inquiry
          </button>
        </form>
      )}
    </div>
  );
}
