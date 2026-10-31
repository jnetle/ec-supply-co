"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { rsvpToEvent } from "@/app/actions/event-rsvp";
import { trackEvent } from "@/components/site/analytics";
import { button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { aboutPlainText } from "@/lib/content/calendar";
import { SHOP_ADDRESS } from "@/lib/content/nav";
import { initialRsvpState } from "@/lib/event-rsvp";
import {
  HONEYPOT_FIELD,
  MAX_EMAIL_LENGTH,
  MAX_RSVP_NAME_LENGTH,
} from "@/lib/form-limits";
import { mockRsvp } from "@/lib/mock-events";
import { SITE_NAME } from "@/lib/site";

import formStyles from "@/components/ui/form.module.css";
import styles from "./event-dialog.module.css";
import { EventAbout } from "./event-about";
import { googleCalendarUrl, type DecoratedEvent } from "./event-model";

const SHOP_LOCATION = `${SITE_NAME}, ${SHOP_ADDRESS.street}, ${SHOP_ADDRESS.city}`;
const calendarLink = button({ variant: "link", tone: "teal" });

type Outcome = "reserved" | "waitlisted";

type EventDialogProps = {
  event: DecoratedEvent | null;
  onClose: () => void;
  /** Remembers the seats in this browser; the parent owns persistence. */
  onReserve: (eventId: string, seats: number) => void;
  /** A made-up event: the form fakes its result instead of calling Wix. */
  mock?: boolean;
};

export function EventDialog({
  event,
  onClose,
  onReserve,
  mock = false,
}: EventDialogProps) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (!event) return null;

  const isWaitlist = event.availability === "waitlist";
  const showTeaser =
    !event.about || event.description !== aboutPlainText(event.about);
  const canJoin =
    !event.past &&
    !event.mine &&
    !outcome &&
    (event.availability === "open" || isWaitlist);

  const note = outcome
    ? null
    : event.past
      ? "This one already happened — check the calendar for the next round."
      : event.dropIn
        ? "No sign-up needed. Just come by."
        : event.seats.kind === "external"
          ? event.orderUrl
            ? event.category === "pickup"
              ? "Preorder on the vendor's site, then pick it up at the shop."
              : "Sign-ups are on the host's own site."
            : "Sign-up details are on the way."
          : event.mine
            ? `You have ${event.mine} ${event.mine === 1 ? "seat" : "seats"} saved. See you there.`
            : event.availability === "full"
              ? "This one is full."
              : event.availability === "closed"
                ? "Sign-ups for this one are closed."
                : null;

  const handleDone = (next: Outcome, seats: number) => {
    setOutcome(next);
    if (next === "reserved") onReserve(event.id, seats);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    setOutcome(null);
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
            <Dialog.Close
              className={button({
                tone: "paper",
                size: "sm",
                icon: true,
                className: styles.close,
              })}
              aria-label="Close"
            >
              ×
            </Dialog.Close>
            <div className={styles.category}>{event.categoryLabel}</div>
            <Dialog.Title className={styles.title}>{event.title}</Dialog.Title>
            <div className={styles.when}>
              {[event.longDate, event.time].filter(Boolean).join(" · ")}
            </div>
          </div>

          <div className={styles.body}>
            {/* The short teaser, then the full About section. With no teaser
                the blurb is the About text itself, so it isn't shown twice,
                and the About section describes the dialog instead. */}
            {showTeaser ? (
              <Dialog.Description className={styles.description}>
                {event.description}
              </Dialog.Description>
            ) : null}

            {event.about ? (
              showTeaser ? (
                <EventAbout blocks={event.about} />
              ) : (
                <Dialog.Description asChild>
                  <div>
                    <EventAbout blocks={event.about} />
                  </div>
                </Dialog.Description>
              )
            ) : null}

            <div className={styles.facts}>
              <span className={styles.fact}>{event.priceLabel}</span>
              {event.spotsLabel ? (
                <span className={styles.fact}>{event.spotsLabel}</span>
              ) : null}
            </div>

            {event.past ? null : (
              <div className={styles.addToCalendar}>
                <span className={styles.addLabel}>Add to calendar</span>
                <a
                  href={googleCalendarUrl(event, SHOP_LOCATION)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={calendarLink}
                >
                  Google
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a
                  href={`/api/events/${encodeURIComponent(event.id)}`}
                  className={calendarLink}
                >
                  Apple / Outlook
                </a>
              </div>
            )}

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

            {event.orderUrl && !event.past ? (
              <a
                href={event.orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={button({ tone: "tealDeep", size: "lg" })}
              >
                {event.orderLabel} →
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}

            {canJoin ? (
              // Keyed so each event starts with a fresh form and result.
              <RsvpForm
                key={event.id}
                eventId={event.id}
                waitlist={isWaitlist}
                maxSeats={event.maxSeats}
                mock={mock}
                onDone={handleDone}
              />
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type RsvpFormProps = {
  eventId: string;
  /** The event is full but takes names for its waitlist. */
  waitlist: boolean;
  /** Seats one RSVP may save; the picker is hidden at 1. */
  maxSeats: number;
  mock: boolean;
  onDone: (outcome: Outcome, seats: number) => void;
};

function RsvpForm({
  eventId,
  waitlist,
  maxSeats,
  mock,
  onDone,
}: RsvpFormProps) {
  const [state, formAction, pending] = useActionState(
    mock ? mockRsvp : rsvpToEvent,
    initialRsvpState,
  );

  // Each result is reported once, however often the parent re-renders.
  const reported = useRef(initialRsvpState);
  useEffect(() => {
    if (reported.current === state) return;
    reported.current = state;
    if (state.status === "reserved") {
      if (!mock) trackEvent("event_rsvp", { seats: state.seats ?? 1 });
      onDone("reserved", state.seats ?? 1);
    }
    if (state.status === "waitlisted") {
      if (!mock) trackEvent("event_waitlist");
      onDone("waitlisted", 0);
    }
  }, [state, onDone, mock]);

  return (
    <form action={formAction} className={formStyles.form}>
      <input type="hidden" name="eventId" value={eventId} />
      {waitlist && <input type="hidden" name="waitlist" value="on" />}

      <div className={formStyles.pair}>
        <Field id="signup-first" label="First name" required>
          {(props) => (
            <input
              {...props}
              name="first"
              required
              maxLength={MAX_RSVP_NAME_LENGTH}
              autoComplete="given-name"
            />
          )}
        </Field>
        <Field id="signup-last" label="Last name" required>
          {(props) => (
            <input
              {...props}
              name="last"
              required
              maxLength={MAX_RSVP_NAME_LENGTH}
              autoComplete="family-name"
            />
          )}
        </Field>
      </div>

      <Field id="signup-email" label="Email" required>
        {(props) => (
          <input
            {...props}
            type="email"
            name="email"
            required
            maxLength={MAX_EMAIL_LENGTH}
            autoComplete="email"
          />
        )}
      </Field>

      {waitlist || maxSeats <= 1 ? null : (
        <div className={formStyles.field}>
          <label htmlFor="signup-seats" className={formStyles.label}>
            Seats
          </label>
          <select
            id="signup-seats"
            name="seats"
            defaultValue="1"
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

      {/* Honeypot: hidden from users and assistive tech, tempting to bots. */}
      <input
        type="text"
        name={HONEYPOT_FIELD}
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
          tone: "tealDeep",
          size: "lg",
          className: formStyles.submit,
        })}
      >
        {pending ? "Saving…" : waitlist ? "Join waitlist" : "Save my seat"}
      </button>

      <p aria-live="polite" className={formStyles.error}>
        {state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}
