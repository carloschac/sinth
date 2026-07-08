# Prompts pro Claude Code — PHASE (web synth landing)

Cole um por vez, na ordem. Com o `CLAUDE.md` na raiz, o agente já segue todas as regras.
Mantenha o `phase-landing-previa.html` aberto como referência de comportamento.

---

## 01 — Scaffold + base

Cria um projeto Next.js 15 com App Router e TypeScript.
Instala: gsap, @gsap/react, lenis.
Áudio é Web Audio API nativa — não instala lib de áudio.

Copia para a raiz o CLAUDE.md que vou te entregar e leia-o por inteiro.
Cria styles/tokens.css com os tokens que vou entregar e importa em app/globals.css (com um reset enxuto). Define <html data-theme="dark"> no layout.
Carrega as fontes Syne, Hanken Grotesk e Martian Mono (next/font) com display swap.
Cria providers/LenisProvider.tsx: inicializa o Lenis UMA vez, integra com o ScrollTrigger via lenis.on('scroll', ScrollTrigger.update) e o ticker do GSAP. Registra ScrollTrigger.

Depois PARA. Não cria nenhuma seção ainda. Me mostra a árvore de arquivos e aguarda.

---

## 02 — Motor de áudio

Cria lib/audio/SynthEngine.ts com o conteúdo de referência que vou te entregar — uma classe independente de React: AudioContext lazy (criado no primeiro gesto), master + analyser + filtro lowpass compartilhado + delay com feedback, voice manager polifônico (máx 8 vozes, voice stealing), envelope attack/release, setWaveform, setCutoff (com setTargetAtTime), setDelay, playArp, getWaveform e dispose. Exporta também KEY_MAP.

Cria hooks/useSynth.ts: expõe UMA única instância de SynthEngine para todo o app (via contexto ou singleton de módulo). Nunca recriar em render. Garante dispose no unmount do provider.

Não cria UI ainda. Confirma a API pública do engine e aguarda.

---

## 03 — Hero (o instrumento tocável)

Cria a seção Hero seguindo o CLAUDE.md e replicando o comportamento do protótipo.
Componentes (cada um .tsx + .module.css, todos 'use client' por causa de áudio/canvas/GSAP):

- Nav: wordmark "PHASE." + HUD técnico (audio ready, poly N/8, latency).
- Hero: kicker, headline em Syne ("Faça som." / "Sem instalar nada."), subtítulo.
- Device: o "equipamento" que envolve scope + controles + teclado.
- Oscilloscope: canvas que desenha engine.getWaveform() num único rAF próprio; pausa fora da viewport (IntersectionObserver) e no visibilitychange.
- Controls: seletor de forma de onda (segmentado), knob de cutoff arrastável (pointer events, valor em Hz com setTargetAtTime) e toggle de delay.
- Keyboard: teclas brancas e pretas; tocável por mouse E pelo teclado físico (KEY_MAP); acionável por teclado de acessibilidade (role, foco visível, Enter/Espaço). Polifônico: noteOn no down, noteOff no up; ignora key repeat. Tecla ativa acende em --signal.

Todos os componentes usam a MESMA instância via useSynth. O poly counter no HUD reflete engine.activeVoices.

Entrada cinematográfica com GSAP (useGSAP, cleanup): 0.4s de silêncio, depois wordmark/HUD descem, headline revela por linha, device e dica aparecem por último — stagger 0.08–0.12s, power3.out, durations 0.7–0.9s. Embrulha tudo num gsap.matchMedia com fallback de prefers-reduced-motion (estado final imediato, scope estático).

---

## 04 — Seções de scroll

Cria as seções abaixo (mesma identidade, tokens, regras de animação). Use ScrollTrigger via Lenis para revelar; uma delas com tratamento "câmera" (pin + scrub: 1.2).

- SoundPacks: grid de cards (auto-fit minmax 220px). Cada card tem nome (Syne), descrição (mono) e um play; clicar chama engine.playArp(...) com um acorde do pack. Hover eleva e acende a borda em --signal.
- Engine (feature): explica osciladores/filtro/envelope com os mesmos knobs como elementos visuais. Pode ser a seção com pin+scrub.
- Specs: tabela técnica em Martian Mono (latência, polifonia, formatos, tamanho) — tom de "equipamento de verdade".
- CTA + Footer: chamada final ("Toque agora / waitlist") e rodapé.

Reveals: opacity + translateY 24–60px, power3.out, stagger 0.08–0.12s. Tudo dentro de matchMedia (reduced-motion = aparece sem animar).

---

## 05 — Refino + acessibilidade + mobile

Passo final, em três frentes:

1. Acessibilidade/perf: confirma que TODA animação tem fallback de prefers-reduced-motion via gsap.matchMedia; que o rAF do osciloscópio pausa fora da viewport e no visibilitychange; que existe só uma instância de SynthEngine; foco visível em todos os controles; teclado acionável por teclado físico.

2. Mobile (Safari): se animações de scroll "pularem", verifica race entre Lenis e ScrollTrigger.refresh() chamado cedo demais — atrasa o refresh para depois do Lenis calcular alturas. Não muda valores visuais, só timing de init. Mostra o que mudou e por quê.

3. Disciplina cinematográfica: varre as animações — duration < 0.6s sobe pra 0.7s (exceto hover < 0.25s); ease fora de power3/power4/expo/sine vira power3.out (loops = sine.inOut); stagger fora de 0.08–0.12 ajusta; translateY de entrada para a faixa 24–60px.

Lista arquivo/linha/mudança e AGUARDA aprovação antes de aplicar em lote.
