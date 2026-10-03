/**
 * CÁLCULO DO DRIVESCORE (determinístico — a IA NÃO participa daqui).
 *
 * Princípios:
 *  1. Nunca usamos o número absoluto de eventos. Usamos EVENTOS PONDERADOS POR 100 KM.
 *     5 frenagens bruscas em 50 km pesam muito mais que 5 em 1.000 km.
 *  2. Cada evento tem uma SEVERIDADE: `intensity` é a razão entre o valor medido e o
 *     limiar do evento (ex.: 0,45 g medidos / 0,35 g de limiar = 1,29). A severidade
 *     cresce ao quadrado da intensidade, então um evento forte pesa mais que vários leves.
 *  3. O CONTEXTO ajusta o peso (ex.: frenagem em trânsito urbano denso é menos
 *     penalizada; velocidade em rodovia ou chuva é mais penalizada).
 *  4. Cada pilar vira uma nota 0–100; o score geral é a média simples dos 4 pilares.
 */

export const PILLARS = ['velocidade', 'frenagem', 'aceleracao', 'curvas'] as const
export type Pillar = (typeof PILLARS)[number]

export type Context = 'urbano' | 'rodovia' | 'chuva' | 'noite'

export interface DriveEvent {
  /** valor medido / limiar do evento (>= 1). Ex.: 1.3 = 30% acima do limiar (força G, km/h...) */
  intensity: number
  context: Context
}

export interface TelemetryWindow {
  km: number
  days: number
  events: Record<Pillar, DriveEvent[]>
}

/** Pontos descontados para cada 1 evento ponderado por 100 km. */
const PENALTY_PER_RATE: Record<Pillar, number> = {
  velocidade: 1.5,
  frenagem: 3.5,
  aceleracao: 3.5,
  curvas: 3.5,
}

const CONTEXT_WEIGHT: Record<Pillar, Record<Context, number>> = {
  velocidade: { urbano: 1, rodovia: 1.15, chuva: 1.3, noite: 1.1 },
  frenagem: { urbano: 0.85, rodovia: 1.1, chuva: 1.2, noite: 1.1 },
  aceleracao: { urbano: 0.9, rodovia: 1, chuva: 1.2, noite: 1 },
  curvas: { urbano: 1, rodovia: 1.1, chuva: 1.25, noite: 1.1 },
}

/** Evita que trechos muito curtos (ex.: 3 km) gerem notas extremas. */
const MIN_KM_FOR_RATE = 25

export interface ScoreResult {
  overall: number
  categories: Record<Pillar, number>
  counts: Record<Pillar, number>
  /** eventos ponderados por 100 km (quanto menor, melhor) */
  rates: Record<Pillar, number>
  km: number
}

export function severity(e: DriveEvent, pillar: Pillar): number {
  return e.intensity ** 2 * CONTEXT_WEIGHT[pillar][e.context]
}

export function weightedRatePer100km(events: DriveEvent[], km: number, pillar: Pillar): number {
  const weighted = events.reduce((sum, e) => sum + severity(e, pillar), 0)
  return (weighted / Math.max(km, MIN_KM_FOR_RATE)) * 100
}

export function pillarScore(events: DriveEvent[], km: number, pillar: Pillar): number {
  const rate = weightedRatePer100km(events, km, pillar)
  return clamp(Math.round(100 - rate * PENALTY_PER_RATE[pillar]), 0, 100)
}

export function computeDriveScore(w: TelemetryWindow): ScoreResult {
  const categories = {} as Record<Pillar, number>
  const counts = {} as Record<Pillar, number>
  const rates = {} as Record<Pillar, number>
  for (const p of PILLARS) {
    categories[p] = pillarScore(w.events[p], w.km, p)
    counts[p] = w.events[p].length
    rates[p] = weightedRatePer100km(w.events[p], w.km, p)
  }
  const overall = Math.round(PILLARS.reduce((s, p) => s + categories[p], 0) / PILLARS.length)
  return { overall, categories, counts, rates, km: w.km }
}

/** Variação (%) da nota do pilar vs. janela anterior. Positivo = melhorou. */
export function improvementPct(prevScore: number, score: number): number {
  if (prevScore === 0) return 0
  return Math.round(((score - prevScore) / prevScore) * 100)
}

/** Variação (%) de eventos por km (contagem bruta). Negativo = menos eventos. */
export function eventRateChangePct(prevCount: number, prevKm: number, count: number, km: number): number {
  const prev = prevCount / prevKm
  if (prev === 0) return 0
  return Math.round(((count / km - prev) / prev) * 100)
}

export type Band = 'high' | 'mid' | 'low'

export function band(score: number): Band {
  return score >= 90 ? 'high' : score >= 75 ? 'mid' : 'low'
}

export function classify(score: number): string {
  if (score >= 90) return 'Excelente condução'
  if (score >= 80) return 'Ótima condução'
  if (score >= 70) return 'Boa condução'
  return 'Condução em evolução'
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
