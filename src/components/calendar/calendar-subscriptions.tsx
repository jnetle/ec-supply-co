'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';

import styles from './calendar.module.css';

const FEED_PATH = '/api/events.ics';
const CALENDAR_NAME = 'El Cerrito Supply Co. Events';
const COPY_FEEDBACK_MS = 2000;

type CalendarApp = 'google' | 'apple' | 'outlook';
type CopyState = 'idle' | 'copied' | 'failed';

function feedUrl(): string {
  return new URL(FEED_PATH, window.location.origin).toString();
}

/** `webcal:` hands the feed to the system calendar app as a subscription. */
function webcalUrl(): string {
  return feedUrl().replace(/^https?:/, 'webcal:');
}

function resolveSubscriptionUrl(app: CalendarApp): string {
  if (app === 'google') {
    return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl())}`;
  }

  if (app === 'apple') return webcalUrl();

  return `https://outlook.office.com/calendar/0/addcalendar?url=${encodeURIComponent(feedUrl())}&name=${encodeURIComponent(CALENDAR_NAME)}`;
}

function setSubscriptionUrl(
  event: MouseEvent<HTMLAnchorElement>,
  app: CalendarApp,
) {
  event.currentTarget.href = resolveSubscriptionUrl(app);
}

/** The async Clipboard API only exists on secure origins, so fall back to execCommand. */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Copy command was rejected');
}

export function CalendarSubscriptions() {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetRef.current), []);

  async function copyFeedUrl() {
    window.clearTimeout(resetRef.current);
    try {
      await copyText(feedUrl());
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    resetRef.current = window.setTimeout(
      () => setCopyState('idle'),
      COPY_FEEDBACK_MS,
    );
  }

  return (
    <aside className={styles.subscribe} aria-labelledby="subscribe-heading">
      <div>
        <h2 id="subscribe-heading" className={styles.subscribeHeading}>
          Never miss an event
        </h2>
        <p className={styles.subscribeCopy}>
          Subscribe once and new events will appear automatically. Choose your
          calendar, or copy the feed link and paste it into your calendar
          app&rsquo;s &ldquo;subscribe by URL&rdquo; option.
        </p>
      </div>
      <div className={styles.subscribeLinks}>
        <a
          href={FEED_PATH}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => setSubscriptionUrl(event, 'google')}
          className={styles.subscribePrimary}
        >
          Google Calendar
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a
          href={FEED_PATH}
          onClick={(event) => setSubscriptionUrl(event, 'apple')}
          className={styles.subscribeLink}
        >
          Apple Calendar
        </a>
        <a
          href={FEED_PATH}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => setSubscriptionUrl(event, 'outlook')}
          className={styles.subscribeLink}
        >
          Outlook
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <button
          type="button"
          onClick={copyFeedUrl}
          className={styles.subscribeLink}
        >
          <CopyIcon state={copyState} />
          Copy feed link
        </button>
        <span className="sr-only" role="status">
          {copyState === 'copied' && 'Feed link copied to clipboard'}
          {copyState === 'failed' && "Couldn't copy the feed link"}
        </span>
      </div>
    </aside>
  );
}

/** Clipboard at rest, a check once copied, a cross if the copy failed. */
function CopyIcon({ state }: { state: CopyState }) {
  const className = [
    styles.copyIcon,
    state === 'copied' && styles.copyIconDone,
    state === 'failed' && styles.copyIconFailed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    // Keyed on state so each swap remounts and replays the pop-in.
    <span key={state} className={className}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {state === 'copied' && <path d="M20 6 9 17l-5-5" />}
        {state === 'failed' && <path d="M18 6 6 18M6 6l12 12" />}
        {state === 'idle' && (
          <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
          </>
        )}
      </svg>
    </span>
  );
}
