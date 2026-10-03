/**
 * CONFIGURAÇÃO CENTRAL DOS BENEFÍCIOS POR FAIXA DE DRIVESCORE.
 * Todo assinante já tem os 4 benefícios (faixa base). O DriveScore só AMPLIA a vantagem.
 * Para ajustar durante o hackathon, edite apenas este arquivo.
 */
export type TierId = 'base' | 'intermediate' | 'high'

export interface BenefitTier {
  id: TierId
  minScore: number
  maxScore: number
  /** selo exibido no topo da tela */
  badge: string
  /** % OFF de cada benefício percentual */
  lavagem: number
  estacionamento: number
  aluguel: number
  /** vantagem adicional (simulada) do benefício de viagens/parceiro; null = só o padrão */
  viagensExtra: string | null
}

export const benefitTiers: Record<TierId, BenefitTier> = {
  base: {
    id: 'base',
    minScore: 0,
    maxScore: 59,
    badge: 'Benefícios padrão',
    lavagem: 25,
    estacionamento: 10,
    aluguel: 15,
    viagensExtra: null,
  },
  intermediate: {
    id: 'intermediate',
    minScore: 60,
    maxScore: 79,
    badge: 'Benefícios ampliados pelo seu DriveScore',
    lavagem: 30,
    estacionamento: 15,
    aluguel: 20,
    viagensExtra: '+2 meses extras de mensalidade grátis',
  },
  high: {
    id: 'high',
    minScore: 80,
    maxScore: 100,
    badge: 'Melhores benefícios pelo seu DriveScore',
    lavagem: 35,
    estacionamento: 20,
    aluguel: 25,
    viagensExtra: '+4 meses extras de mensalidade grátis',
  },
}

const ORDER: TierId[] = ['base', 'intermediate', 'high']

/** Mecânica fixa (não percentual) do benefício de viagens/parceiro. */
export const VIAGENS_PADRAO = ['R$25 de cashback na adesão', '18 meses de mensalidade grátis', '30% nas mensalidades seguintes']

export function tierFor(score: number): BenefitTier {
  const id = [...ORDER].reverse().find((t) => score >= benefitTiers[t].minScore) ?? 'base'
  return benefitTiers[id]
}

export function nextTier(tier: BenefitTier): BenefitTier | null {
  const i = ORDER.indexOf(tier.id)
  return i < ORDER.length - 1 ? benefitTiers[ORDER[i + 1]] : null
}

export interface BenefitView {
  id: string
  icon: string
  title: string
  /** vantagem atual, ex.: "35% OFF" */
  current: string
  detail?: string
  /** valor padrão para comparação, ex.: "25% OFF" */
  standard: string
  /** ex.: "+10 p.p. pelo seu DriveScore" */
  boost: string | null
}

export function benefitsFor(score: number): BenefitView[] {
  const t = tierFor(score)
  const b = benefitTiers.base
  const pp = (now: number, base: number) => (now > base ? `+${now - base} p.p. pelo seu DriveScore` : null)
  return [
    { id: 'lavagem', icon: 'sparkle', title: 'Higienização / lavagem', current: `${t.lavagem}% OFF`, standard: `${b.lavagem}% OFF`, boost: pp(t.lavagem, b.lavagem) },
    {
      id: 'estac',
      icon: 'pin',
      title: 'Estacionamento de aeroporto',
      current: `${t.estacionamento}% OFF`,
      detail: '+ traslado gratuito',
      standard: `${b.estacionamento}% OFF + traslado`,
      boost: pp(t.estacionamento, b.estacionamento),
    },
    { id: 'aluguel', icon: 'car', title: 'Aluguel de carros no Brasil', current: `${t.aluguel}% OFF`, detail: 'na diária', standard: `${b.aluguel}% OFF`, boost: pp(t.aluguel, b.aluguel) },
    {
      id: 'viagens',
      icon: 'gift',
      title: 'Viagens / serviço parceiro',
      current: 'Benefício padrão',
      detail: VIAGENS_PADRAO.join(' · '),
      standard: 'Benefício padrão',
      boost: t.viagensExtra,
    },
  ]
}
