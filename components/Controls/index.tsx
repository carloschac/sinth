'use client';

import { useRef, useState } from 'react';
import { useSynth } from '@/hooks/useSynth';
import styles from './Controls.module.css';

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function formatHz(hz: number): string {
  return hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${Math.round(hz)}`;
}

// kval [0,1] → hz logarithmically: 120 * 120^kval
function kvalToHz(k: number): number {
  return 120 * Math.pow(120, k);
}

const INITIAL_KVAL = 0.63; // ≈ 2.4 kHz, matches SynthEngine default

export default function Controls() {
  const engine = useSynth();
  const [kval, setKval] = useState(INITIAL_KVAL);
  const [delay, setDelay] = useState(false);
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);
  const knobRef = useRef<SVGSVGElement>(null);

  const angle = -135 + kval * 270;
  const pRad = ((angle - 90) * Math.PI) / 180;
  const px = (22 + 13 * Math.cos(pRad)).toFixed(2);
  const py = (22 + 13 * Math.sin(pRad)).toFixed(2);
  const trackPath = arcPath(22, 22, 16, -135, 135);
  const valueDeg = -135 + kval * 270;
  const activePath = kval > 0.005 ? arcPath(22, 22, 16, -135, valueDeg) : null;
  const hz = kvalToHz(kval);

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startVal: kval };
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return;
    const delta = (dragRef.current.startY - e.clientY) / 180;
    const next = Math.max(0, Math.min(1, dragRef.current.startVal + delta));
    setKval(next);
    engine.setCutoff(kvalToHz(next));
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function toggleDelay() {
    const next = !delay;
    setDelay(next);
    engine.setDelay(next);
  }

  return (
    <div className={styles.controls}>
      <div className={styles.knobGroup}>
        <span className={styles.label}>cutoff</span>
        <svg
          ref={knobRef}
          viewBox="0 0 44 44"
          className={styles.knobSvg}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="slider"
          aria-label="Filter cutoff"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={parseFloat(kval.toFixed(2))}
        >
          <circle cx="22" cy="22" r="20" className={styles.knobBg} />
          <path d={trackPath} className={styles.track} />
          {activePath && <path d={activePath} className={styles.active} />}
          <circle cx={px} cy={py} r="2.5" className={styles.pointer} />
        </svg>
        <span className={styles.value}>{formatHz(hz)}</span>
      </div>

      <button
        className={`${styles.delayBtn}${delay ? ` ${styles.delayOn}` : ''}`}
        onClick={toggleDelay}
        aria-pressed={delay}
      >
        delay
      </button>
    </div>
  );
}
