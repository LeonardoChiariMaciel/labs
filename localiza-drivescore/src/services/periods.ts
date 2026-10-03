import { BASE_WINDOWS, SCENARIOS, type Scenario, type WindowKey } from '../data/mock'
import {
  PILLARS,
  computeDriveScore,
  improvementPct,
  type DriveEvent,
  type Pillar,
  type ScoreResult,
  type TelemetryWindow,
} from './score'

export type Period = 'hoje' | 'd7' | 'd30' | 'custom'

export const PERIOD_LABEL: Record<Period, string> = { hoje: 'Hoje', d7: '7 dias', d30: '30 dias', custom: 'Personalizado' }

export interface PeriodResult {
  period: Period
  window: TelemetryWindow
  prevWindow: TelemetryWindow
  score: ScoreResult
  prevScore: ScoreResult
  delta: number
  /** variação % da nota por pilar vs. janela anterior (positivo = melhorou) */
  improvements: Record<Pillar, number>
  /** frase "vs. ..." para o delta */
  comparedTo: string
}

/** Repete/corta a lista de eventos para simular volume maior ou menor, mantendo o perfil. */
function scaleEvents(list: DriveEvent[], factor: number): DriveEvent[] {
  const n = Math.round(list.length * factor)
  if (list.length === 0 || n <= 0) return []
  return Array.from({ length: n }, (_, i) => list[i % list.length])
}

function scaleWindow(w: TelemetryWindow, mult: number | Partial<Record<Pillar, number>>): TelemetryWindow {
  const events = {} as TelemetryWindow['events']
  for (const p of PILLARS) {
    const f = typeof mult === 'number' ? mult : (mult[p] ?? 1)
    events[p] = scaleEvents(w.events[p], f)
  }
  return { ...w, events }
}

/** Janela personalizada: mantém o perfil de condução dos últimos 30 dias, com km proporcional. */
function customWindow(base: TelemetryWindow, days: number, tag: 'now' | 'prev'): TelemetryWindow {
  const ratio = days / base.days
  const jitter = tag === 'now' ? 1 : 1.12
  return {
    km: Math.round(base.km * ratio),
    days,
    events: Object.fromEntries(PILLARS.map((p) => [p, scaleEvents(base.events[p], ratio * jitter)])) as TelemetryWindow['events'],
  }
}

export function getScenario(id: Scenario['id']) {
  return SCENARIOS.find((s) => s.id === id)!
}

export function computePeriod(scenario: Scenario, period: Period, customDays = 14): PeriodResult {
  let window: TelemetryWindow
  let prevWindow: TelemetryWindow
  if (period === 'custom') {
    const k = getWindowKey('d30')
    const base30 = scaleWindow(BASE_WINDOWS.d30.now, scenario.mult[k])
    const base30p = scaleWindow(BASE_WINDOWS.d30.prev, scenario.mult[`${k}Prev` as const])
    window = customWindow(base30, customDays, 'now')
    prevWindow = customWindow(base30p, customDays, 'now')
  } else {
    const k = getWindowKey(period)
    window = scaleWindow(BASE_WINDOWS[k].now, scenario.mult[k])
    prevWindow = scaleWindow(BASE_WINDOWS[k].prev, scenario.mult[`${k}Prev` as const])
  }
  const score = computeDriveScore(window)
  const prevScore = computeDriveScore(prevWindow)
  const improvements = {} as Record<Pillar, number>
  for (const p of PILLARS) improvements[p] = improvementPct(prevScore.categories[p], score.categories[p])
  return {
    period,
    window,
    prevWindow,
    score,
    prevScore,
    delta: score.overall - prevScore.overall,
    improvements,
    comparedTo: { hoje: 'vs. ontem', d7: 'nos últimos 7 dias', d30: 'vs. 30 dias anteriores', custom: 'vs. período anterior' }[period],
  }
}

function getWindowKey(p: Exclude<Period, 'custom'>): WindowKey {
  return p
}

/** Histórico semanal: semanas anteriores (mock) + semana atual calculada pelo código. */
export function weeklyHistory(scenario: Scenario): number[] {
  return [...scenario.history, computePeriod(scenario, 'd7').score.overall]
}
