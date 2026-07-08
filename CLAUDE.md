@AGENTS.md

# PHASE — regras do projeto

Landing de portfolio: um sintetizador polifônico que roda no browser.
A página **é** o produto — o hero é o instrumento tocável.
Prioridade: impressionar e ter performance, não vender.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Áudio | Web Audio API nativa — zero lib de áudio |
| Animação/scroll | GSAP 3.15 + @gsap/react + ScrollTrigger |
| Scroll suave | Lenis 1.3 |
| CSS | CSS Modules por componente + tokens globais |
| Deploy | Vercel (estático/client — sem variáveis de ambiente) |

---

## Arquitetura — a regra que sustenta tudo

Áudio e visual são camadas separadas que **nunca** se atravessam:

```
[gesto do usuário] → SynthEngine (Web Audio API)
                          ↓
                     AnalyserNode → Oscilloscope.rAF  (leitura, não escrita)

GSAP + Lenis → só visual (entrada, scroll, cor)
               nunca chama nada de áudio
```

- **SynthEngine**: uma única instância criada no módulo (`hooks/useSynth.ts`).
  AudioContext criado no primeiro gesto (autoplay policy). `init()` é idempotente.
- **Parâmetros de áudio** sempre mudam via `setTargetAtTime` — sem estalo.
- **Osciloscópio**: tem seu próprio `requestAnimationFrame`, pausado por
  `IntersectionObserver` e `visibilitychange`. Nunca usa o ticker do GSAP.

---

## Regras de código

### CSS
- **Nunca hardcode hex em componente.** Tudo via vars de `styles/tokens.css`.
- Tokens: `--bg`, `--surface`, `--surface-2`, `--text`, `--text-soft`, `--mute`,
  `--signal` (âmbar), `--accent` (fósforo), `--line`, `--scope-bg`.
- Fontes: `var(--font-disp)` / `var(--font-sans)` / `var(--font-mono)`.
  Injetadas pelo next/font via `--font-syne`, `--font-hanken`, `--font-martian` no `<html>`.
- Temas: `data-theme="dark"` (padrão) e `data-theme="paper"` no `<html>`.

### TypeScript
- `'use client'` **somente** onde há GSAP, Web Audio ou `<canvas>`.
  Componentes puramente visuais sem interatividade são Server Components.
- Sempre `gsap.registerPlugin(ScrollTrigger)` no topo de cada arquivo que usa ScrollTrigger.
  O GSAP tolera registros duplicados.

### GSAP / animações
- **Toda animação** dentro de `gsap.matchMedia()`.
  - `(prefers-reduced-motion: no-preference)` → animação normal.
  - `(prefers-reduced-motion: reduce)` → `gsap.set()` diretamente no estado final, sem tween.
- Usar `useGSAP` do `@gsap/react` com `{ scope: containerRef }`.
  O cleanup (`revert`) é automático.
- Para reveals de lista com stagger: `ScrollTrigger.batch(elements, { start: 'top 85%', onEnter })`.
- Para interpolar cores via scroll: ler tokens com `getComputedStyle` e usar
  `gsap.utils.interpolate(bgColor, surfaceColor)` — não animar CSS vars diretamente.

### Lenis + ScrollTrigger
- LenisProvider (em `providers/LenisProvider.tsx`) alimenta o ScrollTrigger via
  `lenis.on('scroll', ScrollTrigger.update)` e drive via `gsap.ticker`.
- **Nunca usar `ScrollTrigger pin: true`** junto com Lenis — causa salto no Safari.
  Seções com efeito "sticky" usam **CSS `position: sticky`** na div interna,
  com a seção-pai tendo `height: 300vh` (ou similar).
  O ScrollTrigger observa o scrub sem pinar nada.

---

## Estrutura de arquivos (estado atual)

```
sinth/
├── app/
│   ├── layout.tsx          # <html data-theme="dark"> + 3 fontes next/font + LenisProvider
│   ├── page.tsx            # Server Component — compõe Nav Hero SoundPacks Engine Specs CTA
│   └── globals.css         # @import tokens.css + reset enxuto
├── styles/
│   └── tokens.css          # design tokens (dark + paper)
├── lib/audio/
│   └── SynthEngine.ts      # Web Audio graph; exporta SynthEngine + KEY_MAP + Waveform
├── providers/
│   └── LenisProvider.tsx   # Lenis init única, integra ScrollTrigger + gsap.ticker
├── hooks/
│   └── useSynth.ts         # singleton engine; export type SynthEngine
├── components/
│   ├── Nav/                # fixed, wordmark + HUD (poly, latency) — anima na entrada
│   ├── Hero/               # instrumento tocável + GSAP timeline de entrada
│   │   └── (usa Device)
│   ├── Device/             # card do synth: label + WaveSelector + Oscilloscope + Controls + Keyboard
│   ├── Oscilloscope/       # <canvas> com rAF próprio, IO + visibilitychange
│   ├── Controls/
│   │   ├── index.tsx       # knob (drag, log, SVG arc) + delay toggle
│   │   └── WaveSelector.tsx
│   ├── Keyboard/           # 8 brancas + 5 pretas; mouse + teclado físico + a11y
│   ├── SoundPacks/         # 6 cards; playArp no click; ScrollTrigger.batch stagger
│   ├── Engine/             # 300vh sticky; scrub ativa OSC→FILTER→ENV; bg interpola
│   ├── Specs/              # tabela Martian Mono; ScrollTrigger.batch x-slide
│   └── CTA/                # headline clip-path reveal + 2 botões + footer
└── public/
    └── (favicons, og.png futuramente)
```

---

## Componentes — contratos e decisões

### `useSynth()`
Retorna sempre a mesma instância de `SynthEngine` (singleton de módulo).
Inclui `useEffect(() => () => engine.dispose(), [])` — chamar preferencialmente
no componente raiz. Após dispose, `init()` reativa no próximo `noteOn()`.

### `SynthEngine` — API pública
```typescript
engine.init()                          // idempotente; chame no gesto do usuário
engine.resume()                        // desuspende AudioContext
engine.noteOn(id: string, midi: number)
engine.noteOff(id: string)
engine.setWaveform(w: Waveform)        // 'sine'|'square'|'sawtooth'|'triangle'
engine.setCutoff(hz: number)           // com setTargetAtTime — sem estalo
engine.setDelay(on: boolean)
engine.playArp(midis: number[], stepMs?, holdMs?)
engine.getWaveform(): Uint8Array | null // chamar dentro do rAF
engine.activeVoices: number            // ler no setInterval
engine.dispose()
```

### `Keyboard`
- Teclas físicas via `KEY_MAP` importado de `SynthEngine.ts`.
- Pointer events com `setPointerCapture` para drag fora do elemento.
- Fallback: `window.addEventListener('pointerup')` libera teclas mouse.
- `e.repeat === true` descartado no keydown.

### `Controls` — knob
- Drag vertical: 180px de cursor = range completo [0, 1].
- Mapeamento logarítmico: `hz = 120 * Math.pow(120, kval)` → [120Hz, 14.4kHz].
- SVG: arco de track (cinza) + arco ativo (signal) + ponto pointer.
- `aria-role="slider"` com `aria-valuenow`.

### `Oscilloscope`
- Canvas com DPR scaling (`ctx.scale(dpr, dpr)`, draw em px CSS).
- `IntersectionObserver`: cancela rAF quando fora da viewport.
- `document.visibilitychange`: cancela rAF quando aba oculta.
- `prefers-reduced-motion`: cap de 4fps (minInterval = 250ms).
- Linha de base estática quando `getWaveform()` retorna `null` (antes do primeiro gesto).

### `Engine` — seção cinematográfica
- Seção com `height: 300vh`. Inner div com `position: sticky; top: 0; height: 100vh`.
- **Não usa `ScrollTrigger pin`** — CSS sticky evita conflito com Lenis.
- Um único `ScrollTrigger` (scrub 1.2, `top top → bottom bottom`) com `onUpdate`:
  - `p < 0.33` → OSC ativo; `p < 0.66` → FILTER; demais → ENV.
  - Ativação via `el.dataset.active = 'true'` — sem re-render React.
  - Background: `gsap.utils.interpolate(bg, surface)` aplicado inline no `onUpdate`.
- `prefers-reduced-motion`: estado final estático (OSC ativo por padrão).

---

## Gotchas conhecidos

| Problema | Solução aplicada |
|----------|-----------------|
| ScrollTrigger pin + Lenis = salto Safari | CSS sticky, sem `pin: true` |
| GSAP animar CSS custom properties | Ler via `getComputedStyle`, interpolar hex |
| AudioContext bloqueado por autoplay | `noteOn` chama `init()` + `resume()` |
| Voice stealing (>8 vozes) | `stealVoice()` remove a voz mais antiga |
| Knob drag sai do elemento | `setPointerCapture` + fallback `window.pointerup` |
| `Uint8Array` genérico no TS5 | Tipar como `Uint8Array<ArrayBuffer>` |
| next/font vs tokens.css nomes | `variable: '--font-syne'` → tokens usa `var(--font-syne, "Syne")` |
| Fontes não carregando (FOIT) | `display: 'swap'` em todas as fontes |

---

## O que falta (próxima sessão)

- [ ] Refino de acessibilidade: skip-link, focus-visible global, aria-live no HUD
- [ ] Mobile: breakpoints no Device/Keyboard, touch events no knob
- [ ] OG image + favicon (`public/og.png`, metadata em `layout.tsx`)
- [ ] Deploy: `vercel` ou push → Vercel import
- [ ] Tema `paper`: botão de toggle de tema
