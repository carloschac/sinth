'use client';

import { useEffect, useRef, useState } from 'react';
import { useSynth } from '@/hooks/useSynth';
import { KEY_MAP } from '@/lib/audio/SynthEngine';
import styles from './Keyboard.module.css';

interface KeyDef {
  midi: number;
  type: 'white' | 'black';
  label: string;
  left?: string;     // only for black keys
  shortcut?: string; // only for white keys
}

// Black key left = calc(N/8 * 100% - 18px), N = white-key boundary index.
// 18px = half of fixed 36px width. No keyboard padding so % maps directly.
const KEYS: KeyDef[] = [
  { midi: 60, type: 'white', label: 'C4',  shortcut: 'a' },
  { midi: 61, type: 'black', label: 'C♯4', left: 'calc(12.5% - 18px)' },
  { midi: 62, type: 'white', label: 'D4',  shortcut: 's' },
  { midi: 63, type: 'black', label: 'D♯4', left: 'calc(25% - 18px)' },
  { midi: 64, type: 'white', label: 'E4',  shortcut: 'd' },
  { midi: 65, type: 'white', label: 'F4',  shortcut: 'f' },
  { midi: 66, type: 'black', label: 'F♯4', left: 'calc(50% - 18px)' },
  { midi: 67, type: 'white', label: 'G4',  shortcut: 'g' },
  { midi: 68, type: 'black', label: 'G♯4', left: 'calc(62.5% - 18px)' },
  { midi: 69, type: 'white', label: 'A4',  shortcut: 'h' },
  { midi: 70, type: 'black', label: 'A♯4', left: 'calc(75% - 18px)' },
  { midi: 71, type: 'white', label: 'B4',  shortcut: 'j' },
  { midi: 72, type: 'white', label: 'C5',  shortcut: 'k' },
];

export default function Keyboard() {
  const engine = useSynth();
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const pressedPhysical = useRef(new Set<string>());
  const pressedMouse = useRef(new Set<number>());

  function pressNote(id: string, midi: number) {
    engine.noteOn(id, midi);
    setActiveNotes(prev => new Set([...prev, midi]));
  }

  function releaseNote(id: string, midi: number) {
    engine.noteOff(id);
    setActiveNotes(prev => { const s = new Set(prev); s.delete(midi); return s; });
  }

  // Physical keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const midi = KEY_MAP[e.key];
      if (midi == null || pressedPhysical.current.has(e.key)) return;
      pressedPhysical.current.add(e.key);
      pressNote('k' + midi, midi);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const midi = KEY_MAP[e.key];
      if (midi == null) return;
      pressedPhysical.current.delete(e.key);
      releaseNote('k' + midi, midi);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine]);

  // Global pointer-up fallback
  useEffect(() => {
    const onPointerUp = () => {
      pressedMouse.current.forEach(midi => releaseNote('m' + midi, midi));
      pressedMouse.current.clear();
    };
    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine]);

  function handlePointerDown(midi: number) {
    if (pressedMouse.current.has(midi)) return;
    pressedMouse.current.add(midi);
    pressNote('m' + midi, midi);
  }

  function handlePointerLeave(midi: number, e: React.PointerEvent) {
    if (e.buttons === 0) return;
    pressedMouse.current.delete(midi);
    releaseNote('m' + midi, midi);
  }

  function handlePointerUp(midi: number) {
    pressedMouse.current.delete(midi);
    releaseNote('m' + midi, midi);
  }

  // Accessibility: Enter/Space fire noteOn/noteOff
  function handleAccessKeyDown(midi: number, e: React.KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    pressNote('a' + midi, midi);
  }
  function handleAccessKeyUp(midi: number, e: React.KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    releaseNote('a' + midi, midi);
  }

  const whites = KEYS.filter(k => k.type === 'white');
  const blacks = KEYS.filter(k => k.type === 'black');

  return (
    <div className={styles.keyboard} role="group" aria-label="Piano keyboard">
      {/* White keys */}
      {whites.map(key => (
        <div
          key={key.midi}
          className={`${styles.white}${activeNotes.has(key.midi) ? ` ${styles.active}` : ''}`}
          role="button"
          tabIndex={0}
          aria-label={key.label}
          onPointerDown={() => handlePointerDown(key.midi)}
          onPointerUp={() => handlePointerUp(key.midi)}
          onPointerLeave={e => handlePointerLeave(key.midi, e)}
          onKeyDown={e => handleAccessKeyDown(key.midi, e)}
          onKeyUp={e => handleAccessKeyUp(key.midi, e)}
        >
          {key.shortcut && <span className={styles.keyLabel}>{key.shortcut}</span>}
        </div>
      ))}

      {/* Black keys (absolutely positioned) */}
      {blacks.map(key => (
        <div
          key={key.midi}
          className={`${styles.black}${activeNotes.has(key.midi) ? ` ${styles.activeBlack}` : ''}`}
          style={{ left: key.left }}
          role="button"
          tabIndex={0}
          aria-label={key.label}
          onPointerDown={() => handlePointerDown(key.midi)}
          onPointerUp={() => handlePointerUp(key.midi)}
          onPointerLeave={e => handlePointerLeave(key.midi, e)}
          onKeyDown={e => handleAccessKeyDown(key.midi, e)}
          onKeyUp={e => handleAccessKeyUp(key.midi, e)}
        />
      ))}
    </div>
  );
}
