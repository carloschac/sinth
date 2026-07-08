'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CTA.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef    = useRef<HTMLSpanElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const btnsRef    = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(lineRef.current, { clipPath: 'inset(100% 0 0 0)' });
      gsap.set([subRef.current, btnsRef.current], { opacity: 0, y: 20 });

      const trigger = {
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
      };

      gsap.to(lineRef.current, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: trigger,
      });

      gsap.to([subRef.current, btnsRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: trigger,
        delay: 0.5,
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(lineRef.current, { clipPath: 'inset(0% 0 0 0)' });
      gsap.set([subRef.current, btnsRef.current], { opacity: 1, y: 0 });
    });
  }, { scope: sectionRef });

  return (
    <>
      <section ref={sectionRef} className={styles.cta}>
        <h2 className={styles.headline}>
          <span ref={lineRef} className={styles.line}>Toque agora.</span>
        </h2>

        <p ref={subRef} className={styles.sub}>
          Sem download, sem plugin, sem conta. Só um browser e um teclado.
        </p>

        <div ref={btnsRef} className={styles.buttons}>
          <button className={styles.btnFilled}>Entrar na waitlist</button>
          <button className={styles.btnGhost}>Ver no GitHub</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.wordmark}>PHASE.</span>
        <span className={styles.copy}>
          2026&nbsp;·&nbsp;web synth&nbsp;·&nbsp;feito com Web Audio API
        </span>
      </footer>
    </>
  );
}
