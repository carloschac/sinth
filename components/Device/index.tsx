'use client';

import { useSynth } from '@/hooks/useSynth';
import Oscilloscope from '@/components/Oscilloscope';
import Controls from '@/components/Controls';
import Keyboard from '@/components/Keyboard';
import WaveSelector from '@/components/Controls/WaveSelector';
import styles from './Device.module.css';

export default function Device() {
  useSynth(); // registers this component in the singleton tree
  return (
    <div className={styles.device}>
      <div className={styles.header}>
        <span className={styles.label}>PHASE-1 · web synth</span>
        <WaveSelector />
      </div>
      <Oscilloscope />
      <Controls />
      <Keyboard />
    </div>
  );
}
