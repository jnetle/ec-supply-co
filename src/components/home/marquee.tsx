import { Fragment } from 'react';

import styles from './marquee.module.css';

const ITEMS = [
  'Built by neighbors',
  'Retail',
  'Coffee',
  'Food popups',
  'Tool library',
  'Gathering space',
  'Local makers',
];

// How many times the list repeats inside one run. A run has to be wider than
// the screen, or the end of the track scrolls into view before the loop
// resets and leaves a gap. One pass of the list is about 1,500px at full
// size, so three cover a 4K-wide window. The animation duration in
// marquee.module.css scales with this to keep the speed the same.
const COPIES = 3;

/** One run of the list. Two are laid end to end so the loop is seamless. */
function Run({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={styles.run} aria-hidden={hidden || undefined}>
      {Array.from({ length: COPIES }, (_, copy) => (
        // Screen readers hear the list once; the repeats are decoration.
        <div
          key={copy}
          className={styles.pass}
          aria-hidden={(!hidden && copy > 0) || undefined}
        >
          {ITEMS.map((item) => (
            <Fragment key={item}>
              <span>{item}</span>
              <span>·</span>
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <>
      <div className={styles.strip}>
        <div className={styles.track}>
          <Run />
          <Run hidden />
        </div>
      </div>
      <div aria-hidden="true" className={styles.teeth} />
    </>
  );
}
