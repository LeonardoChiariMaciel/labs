# Localiza DriveScore AI — MVP

Protótipo mobile navegável do **DriveScore**, funcionalidade nova dentro do app **Localiza Assinatura**:
telemetria → score 0–100 → IA explica → evolução → reconhecimento e benefícios → cliente volta ao app.

Stack: **React + TypeScript + Vite** (sem backend, sem dependências de UI). No desktop, o app aparece dentro de uma moldura de celular com um **painel de apresentação** ao lado; em um celular real ele ocupa a tela toda.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de produção + checagem de tipos
npm run check-score  # imprime no terminal o score calculado dos 3 cenários
```

Deep-link para abrir uma tela direto na demo: `http://localhost:5173/#benefits`
(`home`, `dashboard`, `insights`, `evolution`, `benefits`, `wrapped`, `how`, `analysis`, `notif`).

## Roteiro sugerido para o pitch (≈ 3 min)

1. **Home** — card "Seu DriveScore" integrado ao app → *Ver meu desempenho*.
2. **Dashboard** — 91/100, 4 pilares, troque os filtros Hoje / 7 dias / 30 dias / Personalizado.
3. **Resumo da IA** — o que foi bem, o que impactou, como melhorar (muda por período).
4. **Evolução** → **Benefícios** (3/4 semanas ≥ 90 para o DriveScore Ouro).
5. **Retrospectiva** — toque nos slides, medalha, *Compartilhar conquista*.
6. **Como calculamos** — transparência: 5 frenagens em 50 km ≠ 5 em 1.000 km; "a IA não calcula o score".
7. No painel: cenário **Score em queda** → **Simular notificação** (reengajamento).

## Estrutura

```
src/
  data/mock.ts            # TODOS os dados simulados (usuário, telemetria, cenários, benefícios)
  services/
    score.ts              # CÁLCULO do DriveScore (eventos ponderados por 100 km)
    periods.ts            # monta Hoje / 7d / 30d / personalizado, histórico semanal, benefícios
    aiInsights.ts         # SERVIÇO DE IA (mock por padrão + LLM opcional)
    gamification.ts       # medalhas e regra da push de reengajamento
  components/             # ui.tsx (Card, Ring, LineChart, ícones…) e chrome.tsx (header, nav, filtro)
  screens/                # Home, Dashboard, Insights, Evolution, Benefits, Wrapped, Info (Como funciona, Análise, Notificação)
  state.tsx               # estado global e navegação (sem router)
```

## Onde está o quê

- **Dados mockados:** `src/data/mock.ts`. A telemetria-base é do cenário "Score alto" (Bruno, T-Cross); "médio" e "em queda" são derivados por multiplicadores de eventos (`SCENARIOS`).
- **Cálculo do score:** `src/services/score.ts`. Para cada pilar: `eventos ponderados por 100 km = Σ(intensidade² × peso do contexto) / km × 100`; `nota = 100 − taxa × penalidade`. Score geral = média simples dos 4 pilares. Nunca usa contagem absoluta, então quem dirige mais não é prejudicado.
- **Serviço de IA:** `src/services/aiInsights.ts`. `buildAIInput()` transforma o resultado do score no JSON estruturado; `getInsights()` envia ao LLM ou, sem chave, usa `mockInsights()`.
- **Medalhas / push:** `src/services/gamification.ts` (Top 5% Ouro · 5–10% Prata · 10–15% Bronze; push se > 10 dias sem ver **e** score em queda).

## Conectando um LLM real (opcional)

A IA **só interpreta** o score que o código já calculou. Sem chave, o app usa o modo demonstração e nunca quebra.

```bash
cp .env.example .env
# VITE_LLM_API_KEY=sk-ant-...
# VITE_LLM_MODEL=claude-haiku-4-5-20251001   (opcional)
npm run dev
```

`getInsights()` chama a API da Anthropic com o `AIInput` e espera `{bem, prejudicou, melhorar}`. Timeout de 6 s; qualquer erro cai no mock. O painel mostra "LLM conectado" quando a chave existe.

> ⚠️ Chave em variável `VITE_*` fica exposta no navegador — use só em demo local. Em produção, chame o LLM por um backend/proxy (aponte `VITE_LLM_ENDPOINT` para ele).

## Escopo

Só mobile e só o fluxo do DriveScore. Itens do app atual (Pagamentos, Serviços, Ajuda, menu) mostram um aviso de "fora do escopo". Telemetria, ranking e benefícios são simulados.
