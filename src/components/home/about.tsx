import type { CSSProperties } from 'react';

import { Blob } from '@/components/ui/blob';
import { Eyebrow } from '@/components/ui/eyebrow';
import { WaveDivider } from '@/components/ui/wave-divider';

import styles from './about.module.css';

const PHASE_ONE = [
  {
    title: 'Retail counter',
    note: 'Curated by Hennai Home + Garden',
    bg: 'var(--color-ecs-ply-ink)',
    fg: '#ffffff',
  },
  {
    title: 'Popup vendors',
    note: 'Coffee + food, always rotating',
    bg: 'var(--color-ecs-teal)',
    fg: '#ffffff',
  },
  {
    title: 'Tool library',
    note: 'Borrow it, do not buy it twice',
    bg: 'var(--color-ecs-marigold)',
    fg: '#22201c',
  },
  {
    title: 'Maker shelves',
    note: 'Low-cost space to sell your work',
    bg: 'var(--color-ecs-pink)',
    fg: '#4a1f30',
  },
];

export function About() {
  return (
    <section id="about" className={styles.section}>
      <WaveDivider edge="top" fill="var(--color-ecs-ply-pale)" />
      <WaveDivider edge="bottom" fill="var(--color-ecs-ply-pale)" />
      <Blob
        color="rgba(232,51,31,0.16)"
        parallax={-0.3}
        style={{
          right: '6%',
          top: '-4%',
          width: 'clamp(120px,15vw,230px)',
          height: 'clamp(120px,15vw,230px)',
        }}
      />

      <div data-reveal>
        <Eyebrow className="mb-5">Our story</Eyebrow>
        <h2 className={styles.heading}>
          A platform for the people already making things here.
        </h2>
      </div>

      <div data-reveal className={styles.body}>
        <p>
          El Cerrito Supply Co. is a community space built to make local life
          more connected, creative and fun. We bring independent businesses,
          local makers and neighbors under one roof, creating a place to shop,
          gather and discover what&rsquo;s being made right here.
        </p>
        <p>
          We want to connect creative people with real opportunities and give
          talented, historically underserved artists the visibility, space and
          support they deserve.
        </p>

        <div id="ecs-stats" className={styles.stats}>
          {PHASE_ONE.map((item) => (
            <div
              key={item.title}
              className={styles.stat}
              style={
                { '--stat-bg': item.bg, '--stat-fg': item.fg } as CSSProperties
              }
            >
              <div className={styles.statTitle}>{item.title}</div>
              <div className={styles.statNote}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
