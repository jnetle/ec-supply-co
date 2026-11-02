"use client";

import { useState } from "react";

import { submitPopupApplication } from "@/app/actions/popup-application";
import {
  ApplicationSection,
  ApplicationSent,
  Honeypot,
  lengthHint,
  useApplicationForm,
  type ApplicationFieldsProps,
} from "@/components/ui/application-form";
import { button } from "@/components/ui/button";
import { Field, Required } from "@/components/ui/field";
import {
  MAX_EMAIL_LENGTH,
  MAX_LONG_TEXT_LENGTH,
  MAX_SHORT_TEXT_LENGTH,
  MAX_URL_LENGTH,
} from "@/lib/form-limits";

import styles from "@/components/ui/form.module.css";

const HEALTH_PERMIT = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "working", label: "Working on it" },
];

const TAKES_PAYMENT = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const EMPTY_APPLICATION = {
  first: "",
  last: "",
  business: "",
  email: "",
  link: "",
  about: "",
  city: "",
  connection: "",
  permit: "",
  payment: "",
};

type PopupFormValues = typeof EMPTY_APPLICATION;

function PopupApplicationFields({
  onReset,
  scrollToTop,
}: ApplicationFieldsProps) {
  const { state, submit, pending, sentTitleRef } = useApplicationForm(
    submitPopupApplication,
    "popup_application",
    scrollToTop,
  );
  const [values, setValues] = useState(EMPTY_APPLICATION);
  const updateValue = (name: keyof PopupFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
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
        hint="Somewhere we can see your food or drinks, like your Instagram."
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
            placeholder="instagram.com/yourpopup"
            value={values.link}
            onChange={(event) => updateValue("link", event.target.value)}
          />
        )}
      </Field>

      <Field
        id="about"
        label="Tell us about your popup"
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
            placeholder="What you serve, how you set up, and what makes it yours"
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
          Do you have a health permit? <Required />
        </legend>
        <div className={styles.choices}>
          {HEALTH_PERMIT.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input
                type="radio"
                name="permit"
                value={option.value}
                required
                checked={values.permit === option.value}
                onChange={(event) => updateValue("permit", event.target.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={`${styles.legend} ${styles.legendQuestion}`}>
          Do you have a way to accept payment? <Required />
        </legend>
        <div className={styles.choices}>
          {TAKES_PAYMENT.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input
                type="radio"
                name="payment"
                value={option.value}
                required
                checked={values.payment === option.value}
                onChange={(event) => updateValue("payment", event.target.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

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
        {pending ? "Submitting…" : "Submit application"}
      </button>

      <p className={styles.error} aria-live="polite">
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}

export function PopupApplicationForm() {
  return <ApplicationSection fields={PopupApplicationFields} />;
}
