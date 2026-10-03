import { useMemo } from 'react'
import { useApp } from '../state'
import { computePeriod, weeklyHistory } from '../services/periods'
import { mockEvolutionNote } from '../services/aiInsights'
import { PILLARS } from '../services/score'
import { Button, Card, Icon, LineChart } from '../components/ui'
import { Header } from '../components/chrome'
import { PILLAR_TITLE } from './Dashboard'

export default function Evolution() {
  const { scenario, go } = useApp()
  const history = useMemo(() => weeklyHistory(scenario), [scenario])
  const month = useMemo(() => computePeriod(scenario, 'd30'), [scenario])
  const labels = history.map((_, i) => (i === history.length - 1 ? 'Atual' : `S${i + 1}`))

  const rows = PILLARS.map((p) => ({ p, v: month.improvements[p] }))
  const improved = rows.filter((r) => r.v > 0).sort((a, b) => b.v - a.v)
  const attention = rows.filter((r) => r.v < 0).sort((a, b) => a.v - b.v)
  const gain = history[history.length - 1] - history[0]

  return (
    <div className="screen">
      <Header title="Evolução" />
      <div className="content">
        <h2 className="h-green big-title">Sua evolução</h2>

        <Card>
          <div className="row-between">
            <b>DriveScore semanal</b>
            <span className="delta up"><Icon name="trend" size={14} /> {gain >= 0 ? '+' : ''}{gain} em {history.length} semanas</span>
          </div>
          <LineChart points={history} labels={labels} />
        </Card>

        <div className="grid2">
          <Card className="evo good">
            <h3>Melhorou</h3>
            {improved.length ? (
              improved.map((r) => (
                <div key={r.p} className="evo-row">
                  <span>{PILLAR_TITLE[r.p]}</span>
                  <b className="pos">+{r.v}%</b>
                </div>
              ))
            ) : (
              <p className="muted small">Mantenha a rotina: a próxima melhora aparece em breve.</p>
            )}
          </Card>
          <Card className="evo warn">
            <h3>Atenção</h3>
            {attention.length ? (
              attention.map((r) => (
                <div key={r.p} className="evo-row">
                  <span>{PILLAR_TITLE[r.p]}</span>
                  <b className="neg">{r.v}%</b>
                </div>
              ))
            ) : (
              <p className="muted small">Nenhum pilar em queda no mês. 👏</p>
            )}
          </Card>
        </div>
        <p className="muted small center" style={{ marginTop: 8 }}>Variação da nota de cada pilar vs. 30 dias anteriores.</p>

        <Card className="insight tip">
          <div className="insight-head">
            <span className="insight-ico"><Icon name="sparkle" size={16} /></span>
            <h3>Resumo da IA</h3>
          </div>
          <p>“{mockEvolutionNote(month.improvements)}”</p>
        </Card>

        <Button onClick={() => go('benefits')}>Ver meus benefícios</Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
