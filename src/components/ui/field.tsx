import type { ReactNode } from "react";

import styles from "./form.module.css";

/** The inline "(required)" the design sets beside a field's label. */
export function Required() {
  return <span className={styles.required}>(required)</span>;
}

type FieldProps = {
  label: ReactNode;
  required?: boolean;
  hint?: string;
  children: (props: {
    id: string;
    className: string;
    "aria-describedby"?: string;
  }) => ReactNode;
  id: string;
  multiline?: boolean;
};

/**
 * Label, control and optional hint. The control is passed as a render prop
 * so each form can choose its own element and validation attributes.
 */
export function Field({
  label,
  required,
  hint,
  children,
  id,
  multiline = false,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label} {required ? <Required /> : null}
      </label>
      <div
        className={
          multiline ? `${styles.control} ${styles.multiline}` : styles.control
        }
      >
        {children({
          id,
          className: multiline ? styles.textarea : styles.input,
          "aria-describedby": hintId,
        })}
      </div>
      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
