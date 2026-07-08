# PHASE — guia de build

Tudo que você precisa pra construir a landing no Claude Code. O protótipo
`phase-landing-previa.html` (gerado no chat) é a referência viva de comportamento.

## O que é
Landing de um produto fictício — PHASE, um synth de bolso que roda no navegador.
A página é o produto: o hero é o instrumento tocável (mouse + teclado físico), polifônico,
com osciloscópio ao vivo, seletor de onda, filtro e delay. Peça de portfolio: prioridade é
impressionar e ter performance, não vender.

## Stack
- Next.js 15 (App Router) + TypeScript
- Áudio: Web Audio API nativa, encapsulada em `SynthEngine` (sem lib)
- Scroll/entrada: GSAP + @gsap/react + ScrollTrigger
- Scroll suave: Lenis
- CSS Modules por componente + tokens globais em `styles/tokens.css`
- Deploy: Vercel

## Arquitetura — a regra que sustenta tudo
Áudio e visual vivem em camadas separadas e nunca se atravessam:

    [gesto do usuário] → SynthEngine (Web Audio)  ─┐
                                                    ├─→ AnalyserNode → Oscilloscope (rAF próprio)
    GSAP + Lenis  →  só o visual (entrada, scroll) ─┘   (nunca agenda áudio)

- Uma única instância de `SynthEngine` (hook `useSynth`). AudioContext criado no 1º gesto.
- GSAP/Lenis nunca entram no caminho do som. O osciloscópio tem o próprio requestAnimationFrame.
- Parâmetros de áudio mudam com `setTargetAtTime` (sem estalo).
Isso evita o erro clássico: animação engasgando o áudio (ou o contrário).

## Estrutura de arquivos (alvo)

    phase-landing/
    ├─ CLAUDE.md                  # regras do projeto (já incluso)
    ├─ app/
    │  ├─ layout.tsx              # fontes + LenisProvider + <html data-theme="dark">
    │  ├─ page.tsx                # compõe as seções
    │  └─ globals.css             # importa tokens + reset
    ├─ styles/
    │  └─ tokens.css              # já incluso (dark + paper)
    ├─ lib/audio/
    │  └─ SynthEngine.ts          # já incluso — motor de áudio
    ├─ providers/
    │  └─ LenisProvider.tsx
    ├─ hooks/
    │  └─ useSynth.ts             # 1 instância de SynthEngine
    ├─ components/
    │  ├─ Nav/  Hero/  Oscilloscope/  Controls/  Keyboard/
    │  ├─ SoundPacks/  Engine/  Specs/  CTA/
    └─ public/
       └─ og.png                  # (opcional) imagem de compartilhamento

## Ordem de build
Abra o Claude Code na pasta e cole, em ordem, os prompts de `prompts-claude-code.md`:
1. Scaffold + base (Next, deps, tokens, fontes, LenisProvider) → para e mostra a árvore.
2. `SynthEngine.ts` + `useSynth` (sem UI ainda).
3. Hero — o instrumento tocável.
4. Seções de scroll (sound packs, engine, specs, CTA).
5. Refino: acessibilidade + mobile (Safari/Lenis) + disciplina de animação.

Entregue ao agente os arquivos deste kit: `CLAUDE.md`, `styles/tokens.css`, `lib/audio/SynthEngine.ts`.

## Precisa do Claude Design? (opcional)
Nada disso bloqueia o build. Vale só se quiser elevar:
- Capas dos sound packs (hoje são cards de texto)
- Imagem de OG/compartilhamento + favicon (importa: é a thumbnail no seu portfolio)
- Um logo-mark além do wordmark; texturas de fundo
Pode gerar depois ou pular. Tudo o mais é código → Claude Code.

## Gotchas (já previstos no CLAUDE.md)
- Autoplay: o AudioContext só inicia após um gesto. `noteOn` já chama init()/resume().
- Safari mobile: ScrollTrigger.refresh() cedo demais + Lenis = "pulo". Atrase o refresh.
- Fontes: usar next/font com display swap; evita FOIT.
- Polifonia: teto de 8 vozes com voice stealing; desconectar nós no onended.

## Deploy
`vercel` (ou push no GitHub + import na Vercel). Sem variáveis de ambiente — é estático/client.
Defina título, descrição e a imagem de OG no metadata do App Router para a thumbnail do portfolio.
