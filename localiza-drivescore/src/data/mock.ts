/**
 * DADOS MOCKADOS — toda a telemetria do MVP é simulada aqui.
 * Em produção, `TelemetryWindow` viria do pipeline de telemetria da Localiza.
 */
import type { Context, DriveEvent, Pillar, TelemetryWindow } from '../services/score'

export const USER = {
  nome: 'Bruno',
  idade: 31,
  veiculo: 'Volkswagen T-Cross',
  versao: 'T-Cross 1.0 TSI Flex',
  placa: 'ABC1D23',
  kmMes: 1284,
  franquiaKm: 1500,
}

const CTX: Context[] = ['urbano', 'urbano', 'rodovia', 'urbano', 'chuva', 'noite']

/** Gera n eventos com intensidade crescente de `base` até `base + spread`. */
function ev(n: number, base: number, spread = 0, offset = 0): DriveEvent[] {
  return Array.from({ length: n }, (_, i) => ({
    intensity: +(base + (n > 1 ? (spread * i) / (n - 1) : 0)).toFixed(3),
    context: CTX[(i + offset) % CTX.length],
  }))
}

type Spec = Record<Pillar, [n: number, base: number, spread?: number]>

function win(km: number, days: number, s: Spec): TelemetryWindow {
  return {
    km,
    days,
    events: {
      velocidade: ev(s.velocidade[0], s.velocidade[1], s.velocidade[2] ?? 0, 0),
      frenagem: ev(s.frenagem[0], s.frenagem[1], s.frenagem[2] ?? 0, 1),
      aceleracao: ev(s.aceleracao[0], s.aceleracao[1], s.aceleracao[2] ?? 0, 2),
      curvas: ev(s.curvas[0], s.curvas[1], s.curvas[2] ?? 0, 3),
    },
  }
}

export type WindowKey = 'hoje' | 'd7' | 'd30'

/** Telemetria-base (cenário "score alto"). */
export const BASE_WINDOWS: Record<WindowKey, { now: TelemetryWindow; prev: TelemetryWindow }> = {
  hoje: {
    now: win(46, 1, { velocidade: [1, 1.0], frenagem: [3, 1.0, 0.2], aceleracao: [2, 1.0, 0.05], curvas: [1, 1.0] }),
    prev: win(38, 1, { velocidade: [0, 1], frenagem: [2, 1.0], aceleracao: [1, 1.0], curvas: [1, 1.0] }),
  },
  d7: {
    now: win(312, 7, { velocidade: [6, 1.1, 0.2], frenagem: [11, 1.0, 0.35], aceleracao: [7, 1.0, 0.25], curvas: [4, 1.05, 0.1] }),
    prev: win(298, 7, { velocidade: [7, 1.1, 0.25], frenagem: [14, 1.05, 0.4], aceleracao: [9, 1.0, 0.25], curvas: [6, 1.0, 0.1] }),
  },
  d30: {
    now: win(1284, 30, { velocidade: [10, 1.1, 0.2], frenagem: [24, 1.05, 0.4], aceleracao: [20, 1.0, 0.25], curvas: [13, 1.0, 0.1] }),
    prev: win(1190, 30, { velocidade: [40, 1.1, 0.25], frenagem: [36, 1.35, 0.35], aceleracao: [30, 1.25, 0.3], curvas: [3, 1.0] }),
  },
}

/** Multiplicador de eventos por janela/pilar para derivar os outros cenários da base. */
type Mult = number | Partial<Record<Pillar, number>>

export interface Scenario {
  id: 'alto' | 'medio' | 'queda'
  label: string
  description: string
  mult: Record<`${WindowKey}${'' | 'Prev'}`, Mult>
  /** notas semanais anteriores (a semana atual é calculada) — mais antiga → mais recente */
  history: number[]
  /** percentil do ranking de condutores Localiza Assinatura (menor = melhor) */
  rankingPercentile: number
  diasSemExcessoVelocidade: number
  /** dias desde a última vez que o cliente abriu o DriveScore */
  diasSemVisualizar: number
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'alto',
    label: 'Score alto',
    description: 'Bruno em ótima fase: consistente e evoluindo.',
    mult: { hoje: 1, hojePrev: 1, d7: 1, d7Prev: 1, d30: 1, d30Prev: 1 },
    history: [70, 74, 79, 84, 87, 91, 92],
    rankingPercentile: 4,
    diasSemExcessoVelocidade: 21,
    diasSemVisualizar: 2,
  },
  {
    id: 'medio',
    label: 'Score médio',
    description: 'Boa condução com espaço claro para evoluir.',
    mult: { hoje: 1.6, hojePrev: 1.5, d7: 2.4, d7Prev: 2.3, d30: 2.6, d30Prev: 2.2 },
    history: [72, 70, 74, 73, 75, 74, 76],
    rankingPercentile: 12,
    diasSemExcessoVelocidade: 12,
    diasSemVisualizar: 3,
  },
  {
    id: 'queda',
    label: 'Score em queda',
    description: 'Últimos dias abaixo do padrão — dispara o reengajamento.',
    mult: {
      hoje: { velocidade: 1, frenagem: 2.3, aceleracao: 2, curvas: 2 },
      hojePrev: 1,
      d7: { velocidade: 1.6, frenagem: 2.8, aceleracao: 2.2, curvas: 2 },
      d7Prev: 1,
      d30: 1.5,
      d30Prev: 1,
    },
    history: [88, 90, 92, 91, 89, 86, 83],
    rankingPercentile: 28,
    diasSemExcessoVelocidade: 6,
    diasSemVisualizar: 12,
  },
]

export const DEFAULT_SCENARIO: Scenario['id'] = 'alto'
