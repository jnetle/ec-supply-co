"use client";

import { useRef, useState, type FormEvent } from "react";

import { Field, Required } from "@/components/ui/field";

import styles from "@/components/ui/form.module.css";

/** Clears the sticky header when the form scrolls itself into view. */
const SCROLL_OFFSET = 80;

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

export function ApplicationForm() {
  const [sent, setSent] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToTop = () => {
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    window.scrollTo({
      top: window.scrollY + top - SCROLL_OFFSET,
      behavior: "smooth",
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: wire the submit endpoint. The newsletter signup shows the shape:
    // a Server Action in src/app/actions/ posting to the Wix form.
    setSent(true);
    scrollToTop();
  };

  return (
    <section id="apply" ref={sectionRef} className="px-[clamp(14px,4vw,52px)] py-[clamp(24px,4vh,48px)] pb-[clamp(56px,10vh,120px)]">
      <div className={styles.card}>
        {sent ? (
          <div className={styles.sent}>
            <h2 className={styles.sentTitle}>Thank you so much!</h2>
            <p className={styles.sentBody}>
              Your submission is in. We will read it with the next round, and
              if it is a fit, you will hear from us. Best of luck!
            </p>
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                setSent(false);
                scrollToTop();
              }}
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
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
                      required
                      autoComplete="given-name"
                    />
                  )}
                </Field>
                <Field id="last" label="Last name" required>
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

            <div className={styles.pair}>
              <Field id="business" label="Business name" required>
                {(props) => (
                  <input
                    {...props}
                    name="business"
                    required
                    autoComplete="organization"
                  />
                )}
              </Field>
              <Field id="email" label="Email" required>
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
                  type="url"
                  name="link"
                  required
                  placeholder="https://"
                />
              )}
            </Field>

            <Field
              id="about"
              label="Tell us about yourself and your work"
              required
              multiline
            >
              {(props) => <textarea {...props} name="about" required rows={5} />}
            </Field>

            <div className={styles.pair}>
              <Field
                id="connection"
                label="Your connection to El Cerrito"
                multiline
              >
                {(props) => (
                  <textarea
                    {...props}
                    name="connection"
                    rows={3}
                    placeholder="If you have one, tell us"
                  />
                )}
              </Field>
              <Field id="city" label="Current city of residence">
                {(props) => (
                  <input
                    {...props}
                    name="city"
                    autoComplete="address-level2"
                  />
                )}
              </Field>
            </div>

            <fieldset className={styles.fieldset}>
              <legend className={`${styles.legend} ${styles.legendQuestion}`}>
                Do you have a basic understanding of how wholesale works?{" "}
                <Required />
              </legend>
              <div className={styles.choices}>
                {WHOLESALE_UNDERSTANDING.map((option) => (
                  <label key={option.value} className={styles.choice}>
                    <input
                      type="radio"
                      name="wholesale"
                      value={option.value}
                      required
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
                    <input type="radio" name="pricing" value={option.value} />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" className={styles.submit}>
              Submit application
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
