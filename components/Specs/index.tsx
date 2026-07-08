'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Specs.module.css';

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  { label: 'Latência',       value: '< 5ms' },
  { label: 'Polifonia',      value: '8 vozes simultâneas' },
  { label: 'Formas de onda', value: 'sine · square · sawtooth · triangle' },
  { label: 'Filtro',         value: 'lowpass resonante (Q variável)' },
  { label: 'Delay',          value: 'feedback loop com suavização' },
  { label: 'Download',       value: '0 bytes de áudio' },
  { label: 'Suporte',        value: 'qualquer browser moderno' },
];

export default function Specs() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(rows, { opacity: 0, x: -20 });
      ScrollTrigger.batch(rows, {
        start: 'top 88%',
        onEnter(batch) {
          gsap.to(batch, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.06,
            overwrite: true,
          });
        },
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(rows, { opacity: 1, x: 0 });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.wrap}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Especificações</h2>
        </div>

        <div className={styles.table}>
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              ref={el => { rowRefs.current[i] = el; }}
              className={styles.row}
            >
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
