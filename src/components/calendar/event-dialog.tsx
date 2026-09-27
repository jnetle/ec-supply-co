"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, type CSSProperties, type FormEvent } from "react";

import { Field } from "@/components/ui/field";

import formStyles from "@/components/ui/form.module.css";
import styles from "./event-dialog.module.css";
import type { DecoratedEvent } from "./event-model";

/** Nobody may book more than this many seats at once. */
const MAX_SEATS_PER_BOOKING = 4;

type Outcome = "reserved" | "waitlisted";

type EventDialogProps = {
  event: DecoratedEvent | null;
  onClose: () => void;
  /** Records the seats; the parent owns persistence. */
  onReserve: (eventId: string, seats: number) => void;
};

export function EventDialog({ event, onClose, onReserve }: EventDialogProps) {
  const [seats, setSeats] = useState("1");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (!event) return null;

  const canJoin = !event.past && !event.dropIn && !event.mine && !outcome;
  const maxSeats = Math.min(MAX_SEATS_PER_BOOKING, event.left || 1);
  const isFull = event.left === 0;

  const note = outcome
    ? null
    : event.past
      ? "This one already happened — check the calendar for the next round."
      : event.dropIn
        ? "No sign-up needed. Just come by."
        : event.mine
          ? `You have ${event.mine} ${event.mine === 1 ? "seat" : "seats"} saved. See you there.`
          : null;

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    // TODO: wire the submit endpoint; seats are only remembered in this
    // browser until it exists.
    if (isFull) {
      setOutcome("waitlisted");
      return;
    }
    onReserve(event.id, Number(seats));
    setOutcome("reserved");
  };

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    setOutcome(null);
    setSeats("1");
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div
            className={styles.header}
            style={
              {
                "--header-color": event.categoryColor,
                "--header-ink": event.categoryInk,
              } as CSSProperties
            }
          >
            <Dialog.Close className={styles.close} aria-label="Close">
              ×
            </Dialog.Close>
            <div className={styles.category}>{event.categoryLabel}</div>
            <Dialog.Title className={styles.title}>{event.title}</Dialog.Title>
            <div className={styles.when}>
              {event.longDate} · {event.time}
            </div>
          </div>

          <div className={styles.body}>
            <Dialog.Description className={styles.description}>
              {event.description}
            </Dialog.Description>

            <div className={styles.facts}>
              <span className={styles.fact}>{event.host}</span>
              <span className={styles.fact}>{event.priceLabel}</span>
              <span className={styles.fact}>{event.spotsLabel}</span>
            </div>

            {outcome ? (
              <div className={styles.done} aria-live="polite">
                <div className={styles.doneTitle}>
                  {outcome === "waitlisted"
                    ? "You're on the waitlist"
                    : "You're in!"}
                </div>
                <div className={styles.doneBody}>
                  {outcome === "waitlisted"
                    ? "We'll email you if a seat opens up."
                    : "A confirmation is on its way to your inbox."}
                </div>
              </div>
            ) : null}

            {note ? <div className={styles.note}>{note}</div> : null}

            {canJoin ? (
              <form onSubmit={handleSubmit} className={formStyles.form}>
                <div className={formStyles.pair}>
                  <Field id="signup-name" label="Name" required>
                    {(props) => (
                      <input
                        {...props}
                        name="name"
                        required
                        autoComplete="name"
                      />
                    )}
                  </Field>
                  <Field id="signup-email" label="Email" required>
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

                {isFull ? null : (
                  <div className={formStyles.field}>
                    <label htmlFor="signup-seats" className={formStyles.label}>
                      Seats
                    </label>
                    <select
                      id="signup-seats"
                      name="seats"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className={styles.select}
                    >
                      {Array.from({ length: maxSeats }, (_, i) => (
                        <option key={i} value={String(i + 1)}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <label className={formStyles.checkbox}>
                  <input type="checkbox" name="news" />
                  Sign up for news and updates
                </label>

                <button
                  type="submit"
                  className={formStyles.submit}
                  style={
                    {
                      "--submit-bg": "var(--color-ecs-teal)",
                      "--submit-fg": "#ffffff",
                    } as CSSProperties
                  }
                >
                  {isFull ? "Join waitlist" : "Save my seat"}
                </button>
              </form>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
