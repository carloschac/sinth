import { useEffect } from 'react';
import { SynthEngine } from '@/lib/audio/SynthEngine';

export type { SynthEngine };

// Singleton de módulo — uma instância para todo o app, independente de renders.
const engine = new SynthEngine();

export function useSynth(): SynthEngine {
  // Chamar apenas no componente raiz. dispose() fecha o AudioContext;
  // o engine se re-inicializa automaticamente no próximo noteOn().
  useEffect(() => () => { engine.dispose(); }, []);
  return engine;
}
