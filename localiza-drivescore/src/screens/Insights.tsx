import { useEffect, useState } from 'react'
import { useApp } from '../state'
import { buildAIInput, getInsights, llmEnabled, type Insights } from '../services/aiInsights'
import { Button, Card, Icon, Skeleton, Tag } from '../components/ui'
import { Header, PeriodFilter } from '../components/chrome'

/** Busca o texto da IA sempre que o resultado (cenário/período) muda. */
export function useInsights() {
  const { result } = useApp()
  const [data, setData] = useState<Insights | null>(null)
  useEffect(() => {
    let alive = true
    setData(null)
    getInsights(buildAIInput(result)).then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [result])
  return data
}

const BLOCKS = [
  { key: 'bem', title: 'O que você fez bem', icon: 'check', cls: 'good' },
  { key: 'prejudicou', title: 'O que impactou seu score', icon: 'info', cls: 'warn' },
  { key: 'melhorar', title: 'Como melhorar', icon: 'sparkle', cls: 'tip' },
] as const

export default function InsightsScreen() {
  const { go, result } = useApp()
  const data = useInsights()

  return (
    <div className="screen">
      <Header title="Resumo de direção" />
      <div className="content">
        <h2 className="h-green big-title">Seu resumo de direção</h2>
        <PeriodFilter />

        <div className="ai-note">
          <Icon name="sparkle" size={15} color="var(--green)" />
          <span>
            {data?.fonte === 'ia' ? 'Texto gerado por IA' : 'Texto de demonstração'} a partir do score já calculado ({result.score.overall}/100).
          </span>
          {!llmEnabled && <Tag tone="gray">Modo demo</Tag>}
        </div>

        {BLOCKS.map((b) => (
          <Card key={b.key} className={`insight ${b.cls}`}>
            <div className="insight-head">
              <span className="insight-ico"><Icon name={b.icon} size={16} /></span>
              <h3>{b.title}</h3>
            </div>
            {data ? <p className="fade-in">“{data[b.key]}”</p> : <Skeleton lines={2} />}
          </Card>
        ))}

        <Button variant="outline" icon="list" onClick={() => go('analysis')}>
          Ver análise detalhada
        </Button>
        <div style={{ height: 10 }} />
        <Button onClick={() => go('evolution')}>Ver minha evolução</Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
