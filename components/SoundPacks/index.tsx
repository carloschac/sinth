'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSynth } from '@/hooks/useSynth';
import styles from './SoundPacks.module.css';

gsap.registerPlugin(ScrollTrigger);

const PACKS = [
  { name: 'Neon Dusk', desc: 'synthwave · 24 sounds', chord: [60, 63, 67, 70] },
  { name: 'Concrete',  desc: 'techno · 18 sounds',    chord: [60, 62, 65, 67] },
  { name: 'Vapor',     desc: 'ambient · 30 sounds',   chord: [62, 65, 69, 72] },
  { name: 'Grit',      desc: 'lo-fi · 21 sounds',     chord: [60, 64, 67, 71] },
  { name: 'Pulse',     desc: 'house · 26 sounds',     chord: [60, 63, 67, 72] },
  { name: 'Aurora',    desc: 'chill · 28 sounds',     chord: [64, 67, 71, 74] },
];

export default function SoundPacks() {
  const engine = useSynth();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(cards, { opacity: 0, y: 30 });

      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter(batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          });
        },
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(cards, { opacity: 1, y: 0 });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Sound packs</h2>
          <span className={styles.counter}>06</span>
        </div>

        <div className={styles.grid}>
          {PACKS.map((pack, i) => (
            <div
              key={pack.name}
              ref={el => { cardRefs.current[i] = el; }}
              className={styles.card}
            >
              <div>
                <h3 className={styles.packName}>{pack.name}</h3>
                <p className={styles.packDesc}>{pack.desc}</p>
              </div>
              <button
                className={styles.playBtn}
                onClick={() => engine.playArp(pack.chord, 110, 360)}
                aria-label={`Play ${pack.name} preview`}
              >
                ▶
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
