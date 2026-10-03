/**
 * SERVIÇO DE IA — interpreta o resultado do score, NUNCA calcula.
 *
 *   telemetria → computeDriveScore() → AIInput (objeto estruturado) → LLM → texto
 *
 * - Sem chave de API (padrão): usa `mockInsights`, um gerador de texto por regras
 *   alimentado pelos mesmos números que iriam para o LLM.
 * - Com `VITE_LLM_API_KEY`: chama a API da Anthropic; qualquer erro/timeout cai no mock.
 */
import type { PeriodResult } from './periods'
import { PILLARS, type Pillar } from './score'

export interface AIInput {
  periodo: string
  scoreAtual: number
  scoreAnterior: number
  kmRodados: number
  categorias: Record<Pillar, number>
  eventos: {
    excessoVelocidade: number
    frenagensBruscas: number
    aceleracoesBruscas: number
    curvasAgressivas: number
  }
  comparativoPeriodoAnterior: Record<Pillar, string>
}

export interface Insights {
  bem: string
  prejudicou: string
  melhorar: string
  fonte: 'ia' | 'demo'
}

export const NOME: Record<Pillar, string> = { velocidade: 'velocidade', frenagem: 'frenagem', aceleracao: 'aceleração', curvas: 'curvas' }
const EVENTO: Record<Pillar, [string, string]> = {
  velocidade: ['ocorrência de velocidade acima do limite', 'ocorrências de velocidade acima do limite'],
  frenagem: ['frenagem brusca', 'frenagens bruscas'],
  aceleracao: ['aceleração brusca', 'acelerações bruscas'],
  curvas: ['curva agressiva', 'curvas agressivas'],
}
const DICA: Record<Pillar, string> = {
  velocidade: 'Mantenha a velocidade próxima ao limite da via, principalmente em trechos de rodovia.',
  frenagem: 'Antecipe a desaceleração em aproximações de cruzamentos e congestionamentos.',
  aceleracao: 'Retome a velocidade de forma gradual depois de paradas, pressionando o acelerador com suavidade.',
  curvas: 'Reduza a velocidade antes de entrar na curva e acelere de forma suave na saída.',
}
const PERIODO_TXT: Record<string, string> = {
  hoje: 'hoje',
  d7: 'nos últimos 7 dias',
  d30: 'neste mês',
  custom: 'no período selecionado',
}

const signed = (n: number) => `${n > 0 ? '+' : ''}${n}%`
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function buildAIInput(r: PeriodResult): AIInput {
  const c = r.score.counts
  const hardSpeeding = r.window.events.velocidade.filter((e) => e.intensity >= 1.15).length
  return {
    periodo: r.period,
    scoreAtual: r.score.overall,
    scoreAnterior: r.prevScore.overall,
    kmRodados: r.score.km,
    categorias: r.score.categories,
    eventos: {
      excessoVelocidade: hardSpeeding,
      frenagensBruscas: c.frenagem,
      aceleracoesBruscas: c.aceleracao,
      curvasAgressivas: c.curvas,
    },
    comparativoPeriodoAnterior: Object.fromEntries(PILLARS.map((p) => [p, signed(r.improvements[p])])) as Record<Pillar, string>,
  }
}

function ranked(input: AIInput) {
  const arr = PILLARS.map((p) => ({ p, score: input.categorias[p], delta: parseInt(input.comparativoPeriodoAnterior[p], 10) }))
  return {
    best: [...arr].sort((a, b) => b.score - a.score)[0],
    worst: [...arr].sort((a, b) => a.score - b.score)[0],
    mostImproved: [...arr].sort((a, b) => b.delta - a.delta)[0],
  }
}

function countFor(input: AIInput, p: Pillar) {
  const e = input.eventos
  return { velocidade: e.excessoVelocidade, frenagem: e.frenagensBruscas, aceleracao: e.aceleracoesBruscas, curvas: e.curvasAgressivas }[p]
}

/** Gerador de texto por regras: mesmo contrato do LLM, sem depender de rede. */
export function mockInsights(input: AIInput): Insights {
  const { best, worst, mostImproved } = ranked(input)
  const when = PERIODO_TXT[input.periodo] ?? 'no período'
  const diff = input.scoreAtual - input.scoreAnterior

  // O que foi bem
  let bem = `Você manteve ótimo desempenho em ${NOME[best.p]} (nota ${best.score}) ${when}.`
  if (best.p === 'velocidade' && input.eventos.excessoVelocidade === 0) {
    bem = `Você manteve excelente controle de velocidade ${when} e não registrou excessos relevantes.`
  }
  if (mostImproved.p !== best.p && mostImproved.delta > 0) {
    bem += ` Além disso, sua ${NOME[mostImproved.p]} evoluiu ${signed(mostImproved.delta)} em relação ao período anterior.`
  }

  // O que mais impactou
  const n = countFor(input, worst.p)
  let prejudicou: string
  if (worst.score >= 90) {
    prejudicou = `Nada relevante reduziu sua nota ${when}. ${cap(NOME[worst.p])} é seu menor indicador (${worst.score}), ainda em ótimo nível.`
  } else {
    const noun = EVENTO[worst.p][n === 1 ? 0 : 1]
    const lead = diff < 0 ? `Seu score variou ${diff} ${Math.abs(diff) === 1 ? 'ponto' : 'pontos'} em relação ao período anterior. ` : ''
    prejudicou = `${lead}${cap(NOME[worst.p])} foi o fator que mais impactou seu resultado: ${n} ${noun} em ${input.kmRodados} km.`
  }

  // Como melhorar
  let melhorar = DICA[worst.p]
  if (diff >= 0 && worst.score >= 90) melhorar = `Continue assim! ${DICA[worst.p]}`
  else if (input.scoreAtual >= 90) melhorar += ' Manter o score alto amplia ainda mais suas vantagens no Clube de Benefícios.'

  return { bem, prejudicou, melhorar, fonte: 'demo' }
}

export function mockEvolutionNote(improvements: Record<Pillar, number>): string {
  const arr = PILLARS.map((p) => ({ p, v: improvements[p] })).sort((a, b) => b.v - a.v)
  const top = arr[0]
  const low = arr[arr.length - 1]
  if (top.v <= 0) return 'Seu mês teve oscilações. Escolha um pilar para focar nas próximas semanas: pequenas mudanças já geram evolução visível.'
  return `Seu principal avanço neste mês foi em ${NOME[top.p]}. Seu próximo foco deve ser consistência em ${NOME[low.p]}.`
}

// ---------------------------------------------------------------------------
// Integração opcional com LLM (Anthropic). Sem chave → mock.
// ---------------------------------------------------------------------------
const API_KEY = import.meta.env.VITE_LLM_API_KEY as string | undefined
const MODEL = (import.meta.env.VITE_LLM_MODEL as string | undefined) || 'claude-haiku-4-5-20251001'
const ENDPOINT = (import.meta.env.VITE_LLM_ENDPOINT as string | undefined) || 'https://api.anthropic.com/v1/messages'

export const llmEnabled = Boolean(API_KEY)

const SYSTEM = `Você é o assistente de condução do app Localiza Assinatura.
Você recebe um JSON com o score JÁ CALCULADO por código. NUNCA recalcule nem invente números: use apenas os valores recebidos.
Tom: positivo, educativo e construtivo. Nunca diga que o cliente dirigiu mal nem que perdeu pontos por erro; prefira "este é seu principal ponto de melhoria".
Não mencione dinheiro, cashback ou desconto. Responda em português do Brasil.
Responda SOMENTE com JSON: {"bem": string, "prejudicou": string, "melhorar": string}, cada campo com 1 a 2 frases curtas.`

async function callLLM(input: AIInput): Promise<Insights> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: SYSTEM,
        messages: [{ role: 'user', content: JSON.stringify(input) }],
      }),
    })
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}`)
    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
    if (!json.bem || !json.prejudicou || !json.melhorar) throw new Error('resposta incompleta')
    return { bem: json.bem, prejudicou: json.prejudicou, melhorar: json.melhorar, fonte: 'ia' }
  } finally {
    clearTimeout(timer)
  }
}

/** Ponto de entrada da UI. Nunca lança: o MVP não pode parar por falta de API. */
export async function getInsights(input: AIInput): Promise<Insights> {
  if (!llmEnabled) {
    await new Promise((r) => setTimeout(r, 450)) // simula latência para a demo
    return mockInsights(input)
  }
  try {
    return await callLLM(input)
  } catch (err) {
    console.warn('[aiInsights] LLM indisponível, usando modo demonstração.', err)
    return mockInsights(input)
  }
}
