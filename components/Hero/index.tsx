'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useSynth } from '@/hooks/useSynth';
import Device from '@/components/Device';
import styles from './Hero.module.css';

export default function Hero() {
  useSynth();

  const containerRef = useRef<HTMLElement>(null);
  const kickerRef    = useRef<HTMLParagraphElement>(null);
  const line1Ref     = useRef<HTMLSpanElement>(null);
  const line2Ref     = useRef<HTMLSpanElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const deviceRef    = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLParagraphElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const all = [
        kickerRef.current,
        subRef.current,
        deviceRef.current,
        hintRef.current,
        scrollRef.current,
      ];

      gsap.set(all, { opacity: 0, y: 24 });
      gsap.set([line1Ref.current, line2Ref.current], {
        clipPath: 'inset(100% 0 0 0)',
      });

      const tl = gsap.timeline({ delay: 0.4 });

      tl.to(kickerRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
        .to(
          [line1Ref.current, line2Ref.current],
          { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'power3.out', stagger: 0.1 },
          '-=0.3',
        )
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
        .to(deviceRef.current, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
        .to([hintRef.current, scrollRef.current], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });

      // Scroll-bar loop starts after entry settles
      tl.add(() => {
        gsap.fromTo(
          scrollBarRef.current,
          { y: '-100%' },
          { y: '250%', duration: 1.4, ease: 'sine.inOut', repeat: -1, repeatDelay: 0.2 },
        );
      }, '-=0.2');
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(
        [
          kickerRef.current,
          subRef.current,
          deviceRef.current,
          hintRef.current,
          scrollRef.current,
        ],
        { opacity: 1, y: 0 },
      );
      gsap.set([line1Ref.current, line2Ref.current], { clipPath: 'inset(0% 0 0 0)' });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className={styles.hero}>
      <div className={styles.inner}>
        <p ref={kickerRef} className={styles.kicker}>
          synth de bolso&nbsp;·&nbsp;roda no navegador
        </p>

        <h1 className={styles.headline}>
          <span ref={line1Ref} className={styles.line}>Faça som.</span>
          <span ref={line2Ref} className={`${styles.line} ${styles.muted}`}>
            Sem instalar nada.
          </span>
        </h1>

        <p ref={subRef} className={styles.sub}>
          Um sintetizador polifônico que vive no browser. Toque pelo teclado
          físico, explore as formas de onda, ajuste o filtro e o delay em tempo
          real.
        </p>

        <div ref={deviceRef} className={styles.deviceWrapper}>
          <Device />
        </div>

        <p ref={hintRef} className={styles.hint}>
          teclas&nbsp;
          <kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd><kbd>G</kbd>
          <kbd>H</kbd><kbd>J</kbd><kbd>K</kbd>
          &nbsp;·&nbsp;
          <kbd>W</kbd><kbd>E</kbd><kbd>T</kbd><kbd>Y</kbd><kbd>U</kbd>
        </p>
      </div>

      <div ref={scrollRef} className={styles.scrollHint}>
        <span className={styles.scrollLabel}>role</span>
        <div className={styles.scrollTrack}>
          <div ref={scrollBarRef} className={styles.scrollBar} />
        </div>
      </div>
    </section>
  );
}
