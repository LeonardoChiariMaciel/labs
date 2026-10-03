import { useApp } from '../state'
import { PILLARS, band, classify, type Pillar } from '../services/score'
import { NOME } from '../services/aiInsights'
import { Button, Card, Icon, Progress, Ring, Tag } from '../components/ui'
import { Header, PeriodFilter } from '../components/chrome'

export const PILLAR_ICON: Record<Pillar, string> = { velocidade: 'gauge', frenagem: 'brake', aceleracao: 'bolt', curvas: 'curve' }
export const PILLAR_TITLE: Record<Pillar, string> = { velocidade: 'Velocidade', frenagem: 'Frenagem', aceleracao: 'Aceleração', curvas: 'Curvas' }

const PERIOD_DELTA_TXT = {
  hoje: 'em relação a ontem',
  d7: 'nos últimos 7 dias',
  d30: 'em relação aos 30 dias anteriores',
  custom: 'em relação ao período anterior',
} as const

export default function Dashboard() {
  const { result, go } = useApp()
  const s = result.score.overall
  const up = result.delta >= 0
  const focus = [...PILLARS].sort((a, b) => result.score.categories[a] - result.score.categories[b])[0]

  return (
    <div className="screen">
      <Header title="DriveScore" />
      <div className="content">
        <PeriodFilter />

        <Card className="hero">
          <Ring value={s} size={178} stroke={15}>
            <span className="ring-num">{s}</span>
            <span className="ring-sub">/ 100</span>
          </Ring>
          <div className={`seal lg ${band(s) === 'high' ? '' : 'seal-soft'}`}>
            <Icon name={band(s) === 'high' ? 'shield' : 'check'} size={16} /> {classify(s)}
          </div>
          <div className={`delta ${up ? 'up' : 'down'}`} style={{ marginTop: 10 }}>
            <Icon name="trend" size={15} /> {up ? '+' : ''}
            {result.delta} {Math.abs(result.delta) === 1 ? 'ponto' : 'pontos'} {PERIOD_DELTA_TXT[result.period]}
          </div>
          <div className="muted small" style={{ marginTop: 6 }}>{result.score.km.toLocaleString('pt-BR')} km analisados</div>
        </Card>

        <div className="grid2">
          {PILLARS.map((p) => {
            const v = result.score.categories[p]
            return (
              <Card key={p} className="pillar">
                <div className="row-between">
                  <span className="pillar-ico"><Icon name={PILLAR_ICON[p]} size={18} color="var(--green)" /></span>
                  {p === focus && v < 90 && <Tag tone="yellow">Foco</Tag>}
                </div>
                <div className="pillar-name">{PILLAR_TITLE[p]}</div>
                <div className="pillar-val">{v}</div>
                <Progress value={v} tone={band(v)} />
              </Card>
            )
          })}
        </div>
        <p className="muted small center" style={{ marginTop: 10 }}>
          Principal ponto de melhoria: <b>{NOME[focus]}</b>
        </p>

        <Button icon="sparkle" onClick={() => go('insights')}>
          Ver resumo da IA
        </Button>

        <div className="menu-list">
          {[
            ['chart', 'Sua evolução', 'Histórico semanal do score', 'evolution'],
            ['gift', 'Seus benefícios', 'Clube de Benefícios e DriveScore Ouro', 'benefits'],
            ['trophy', 'Retrospectiva mensal', 'Seu mês na direção', 'wrapped'],
            ['list', 'Análise detalhada', 'Eventos por 100 km, por pilar', 'analysis'],
            ['info', 'Como calculamos seu DriveScore', 'Transparência sobre a nota', 'how'],
            ['bell', 'Lembretes do DriveScore', 'Veja como avisamos você', 'notif'],
          ].map(([ic, t, d, r]) => (
            <Card key={r} className="menu-row" onClick={() => go(r as never)}>
              <span className="pillar-ico"><Icon name={ic} size={18} color="var(--green)" /></span>
              <div>
                <b>{t}</b>
                <div className="muted small">{d}</div>
              </div>
              <Icon name="chevron" size={18} color="var(--muted)" />
            </Card>
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
