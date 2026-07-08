'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Engine.module.css';

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    id: 'osc',
    label: 'OSC',
    name: 'Oscillador',
    desc: 'Gera a forma de onda bruta. Sawtooth, square, sine ou triangle — cada uma com timbre e harmônicos únicos.',
    Icon: () => (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 12 C5 3 7 21 12 12 C17 3 19 21 22 12" />
      </svg>
    ),
  },
  {
    id: 'filter',
    label: 'FILTER',
    name: 'Filtro resonante',
    desc: 'Lowpass com Q variável. O cutoff controla o brilho; a ressonância adiciona caráter no ponto de corte.',
    Icon: () => (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18 L7 18 L11 5 L16 18 L22 18" />
        <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 3" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'env',
    label: 'ENV',
    name: 'Envelope ADSR',
    desc: 'Molda o volume no tempo: attack instantâneo, sustain a 22% e release de 250ms criam punch sem clique.',
    Icon: () => (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20 L5 4 L9 13 L15 13 L19 20 L22 20" />
      </svg>
    ),
  },
];

export default function Engine() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const style = getComputedStyle(document.documentElement);
    const bgColor   = style.getPropertyValue('--bg').trim()      || '#0e0d10';
    const surfColor = style.getPropertyValue('--surface').trim() || '#18171c';
    const colorInterp = gsap.utils.interpolate(bgColor, surfColor);

    const panels = panelRefs.current;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let activeIdx = -1;

      function setActive(idx: number) {
        if (idx === activeIdx) return;
        activeIdx = idx;
        panels.forEach((el, i) => {
          if (!el) return;
          el.dataset.active = String(i === idx);
        });
      }

      // Initialise first panel as active before scroll starts
      setActive(0);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate(self) {
          const p = self.progress;
          if (sectionRef.current) {
            sectionRef.current.style.backgroundColor = colorInterp(p);
          }
          setActive(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
        },
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (sectionRef.current) sectionRef.current.style.backgroundColor = surfColor;
      panels.forEach((el, i) => {
        if (el) el.dataset.active = String(i === 0);
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.sticky}>
        <div className={styles.inner}>
          <p className={styles.label}>OSC → FILTER → ENV</p>
          <h2 className={styles.title}>Síntese em tempo real.</h2>

          <div className={styles.panels}>
            {PANELS.map((panel, i) => (
              <div
                key={panel.id}
                ref={el => { panelRefs.current[i] = el; }}
                className={styles.panel}
                data-active={i === 0 ? 'true' : 'false'}
              >
                <div className={styles.panelIcon}>
                  <panel.Icon />
                </div>
                <p className={styles.panelLabel}>{panel.label}</p>
                <h3 className={styles.panelName}>{panel.name}</h3>
                <p className={styles.panelDesc}>{panel.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
