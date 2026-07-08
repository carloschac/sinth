'use client';

import { useEffect, useRef } from 'react';
import { useSynth } from '@/hooks/useSynth';
import styles from './Oscilloscope.module.css';

export default function Oscilloscope() {
  const engine = useSynth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minInterval = prefersReduced ? 250 : 0;
    const signalColor =
      getComputedStyle(document.documentElement).getPropertyValue('--signal').trim() || '#ff7a1a';

    let w = 0;
    let h = 0;
    let rafId = 0;
    let lastTs = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function startLoop() {
      if (!rafId) rafId = requestAnimationFrame(draw);
    }
    function stopLoop() {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function draw(ts: number) {
      if (ts - lastTs < minInterval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastTs = ts;

      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = signalColor;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = signalColor;

      const data = engine.getWaveform();
      if (!data) {
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
      } else {
        const step = w / data.length;
        for (let i = 0; i < data.length; i++) {
          const y = ((data[i] / 128) * h) / 2;
          i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * step, y);
        }
      }
      ctx.stroke();
      rafId = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? startLoop() : stopLoop();
    });
    io.observe(canvas);

    const onVisibility = () => {
      document.hidden ? stopLoop() : startLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    startLoop();

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [engine]);

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Oscilloscope waveform"
        role="img"
      />
    </div>
  );
}
