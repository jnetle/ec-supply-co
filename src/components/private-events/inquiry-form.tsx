"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Field } from "@/components/ui/field";

import styles from "@/components/ui/form.module.css";

const AFTER_HOURS_HINT =
  "Please keep in mind that private events are held outside of normal operating hours.";

type InquiryFormProps = {
  /** Distinguishes the two forms' field ids on the same page. */
  name: string;
  heading: string;
  /** Legend above the first/last name pair. */
  nameLegend: string;
  /** What the confirmation panel promises. */
  confirmation: string;
  submitBackground: string;
  submitForeground: string;
  /** Extra fields rendered just before the submit button. */
  children?: ReactNode;
};

/**
 * The two private-event inquiries are the same form with a different heading
 * and, for the rental, two extra questions.
 *
 * TODO: wire the submit endpoint. The newsletter signup in
 * src/app/actions/newsletter.ts shows the shape.
 */
export function InquiryForm({
  name,
  heading,
  nameLegend,
  confirmation,
  submitBackground,
  submitForeground,
  children,
}: InquiryFormProps) {
  const [sent, setSent] = useState(false);
  // Both forms share field names, so ids are namespaced per form.
  const fieldId = (key: string) => `${name}-${key}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className={styles.card}>
      {sent ? (
        <div className={styles.sent}>
          <h3 className={styles.sentTitle}>Thanks — we got it.</h3>
          <p className={styles.sentBody}>{confirmation}</p>
          <button
            type="button"
            className={styles.reset}
            onClick={() => setSent(false)}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h3 className={styles.heading}>{heading}</h3>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{nameLegend}</legend>
            <div className={styles.pair}>
              <Field id={fieldId("first")} label="First name" required>
                {(props) => (
                  <input
                    {...props}
                    name="first"
                    required
                    autoComplete="given-name"
                  />
                )}
              </Field>
              <Field id={fieldId("last")} label="Last name" required>
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

          <Field id={fieldId("email")} label="Email" required>
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

          <Field
            id={fieldId("when")}
            label="Preferred date/time"
            hint={AFTER_HOURS_HINT}
          >
            {(props) => <input {...props} type="datetime-local" name="when" />}
          </Field>

          {children}

          <button
            type="submit"
            className={styles.submit}
            style={{
              "--submit-bg": submitBackground,
              "--submit-fg": submitForeground,
            } as React.CSSProperties}
          >
            Send inquiry
          </button>
        </form>
      )}
    </div>
  );
}
