'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useSynth } from '@/hooks/useSynth';
import styles from './Nav.module.css';

export default function Nav() {
  const engine = useSynth();
  const navRef = useRef<HTMLElement>(null);
  const [voices, setVoices] = useState(0);
  const [latency, setLatency] = useState(2);

  useEffect(() => {
    const id = setInterval(() => setVoices(engine.activeVoices), 50);
    return () => clearInterval(id);
  }, [engine]);

  useEffect(() => {
    const id = setInterval(
      () => setLatency(Math.floor(Math.random() * 5) + 2),
      1400,
    );
    return () => clearInterval(id);
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(navRef.current, { opacity: 0, y: -30 });
      gsap.to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.4,
      });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(navRef.current, { opacity: 1, y: 0 });
    });
  }, { scope: navRef });

  return (
    <nav ref={navRef} className={styles.nav}>
      <span className={styles.wordmark}>
        PHASE<span className={styles.dot}>.</span>
      </span>
      <div className={styles.hud}>
        <span className={styles.item}>
          <span className={styles.pulseDot} aria-hidden="true" />
          audio ready
        </span>
        <span className={styles.item}>poly {voices}/8</span>
        <span className={styles.item}>latency {latency}ms</span>
      </div>
    </nav>
  );
}
