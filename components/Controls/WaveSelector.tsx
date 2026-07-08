'use client';

import { useState } from 'react';
import { useSynth } from '@/hooks/useSynth';
import type { Waveform } from '@/lib/audio/SynthEngine';
import styles from './WaveSelector.module.css';

const WAVES: { value: Waveform; label: string }[] = [
  { value: 'sawtooth', label: 'saw' },
  { value: 'square',   label: 'sqr' },
  { value: 'sine',     label: 'sin' },
  { value: 'triangle', label: 'tri' },
];

export default function WaveSelector() {
  const engine = useSynth();
  const [active, setActive] = useState<Waveform>('sawtooth');

  function select(w: Waveform) {
    setActive(w);
    engine.setWaveform(w);
  }

  return (
    <div className={styles.selector} role="group" aria-label="Waveform">
      {WAVES.map(({ value, label }) => (
        <button
          key={value}
          className={`${styles.btn}${active === value ? ` ${styles.active}` : ''}`}
          onClick={() => select(value)}
          aria-pressed={active === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
