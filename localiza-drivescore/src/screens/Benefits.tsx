import { useState } from 'react'
import { useApp } from '../state'
import { computePeriod } from '../services/periods'
import { benefitsFor, nextTier, tierFor } from '../data/benefits'
import { Button, Card, Icon, Progress, Tag } from '../components/ui'
import { Header } from '../components/chrome'

export default function Benefits() {
  const { scenario, go, showToast } = useApp()
  const real = computePeriod(scenario, 'd7').score.overall
  // Controle de demonstração: simula outras faixas sem trocar de cenário
  const [preview, setPreview] = useState<number | null>(null)
  const score = preview ?? real

  const tier = tierFor(score)
  const next = nextTier(tier)
  const progress = next ? ((score - tier.minScore) / (next.minScore - tier.minScore)) * 100 : 100
  const missing = next ? next.minScore - score : 0

  return (
    <div className="screen">
      <Header title="Benefícios" />
      <div className="content">
        <h2 className="h-green big-title">Seus benefícios</h2>
        <p className="lead">Seu DriveScore amplia benefícios que você já possui como assinante.</p>

        <Card className="tier">
          <div className="row-between">
            <div>
              <div className="muted small">DriveScore</div>
              <b className="tier-score">{score}</b>
            </div>
            <Tag tone={tier.id === 'base' ? 'gray' : 'green'}>{tier.badge}</Tag>
          </div>
          {next ? (
            <>
              <div className="row-between small" style={{ margin: '14px 0 6px' }}>
                <span className="muted">Faixa atual: {tier.minScore} pts</span>
                <span className="muted">Próxima faixa: {next.minScore} pts</span>
              </div>
              <Progress value={progress} height={12} />
              <div className="falta">
                <Icon name="trend" size={16} /> Faltam {missing} {missing === 1 ? 'ponto' : 'pontos'} para ampliar {tier.id === 'base' ? 'seus' : 'novamente suas'} vantagens.
              </div>
            </>
          ) : (
            <>
              <div style={{ height: 14 }} />
              <Progress value={100} height={12} />
              <div className="falta">
                <Icon name="check" size={16} /> Você está na faixa com as melhores vantagens. Continue assim!
              </div>
            </>
          )}
        </Card>

        <div className="section-title"><h2>Vantagens do Clube de Benefícios</h2></div>
        <p className="muted small" style={{ marginTop: 6 }}>Você já tem acesso ao Clube de Benefícios. Seu DriveScore pode tornar essas vantagens ainda melhores.</p>

        {benefitsFor(score).map((b) => (
          <Card key={b.id} className="benefit">
            <span className="pillar-ico"><Icon name={b.icon} size={18} color="var(--green)" /></span>
            <div className="grow">
              <div className="b-title">{b.title}</div>
              <div className="b-current">
                {b.current} {b.id !== 'viagens' && b.detail && <small>{b.detail}</small>}
              </div>
              {b.id === 'viagens' && <div className="muted small">{b.detail}</div>}
              {b.boost ? (
                <div className="b-boost">
                  <Icon name="sparkle" size={13} /> {b.id === 'viagens' ? <>Benefício ampliado pelo DriveScore: <b>{b.boost}</b></> : b.boost}
                </div>
              ) : (
                tier.id === 'base' && b.id !== 'viagens' && <div className="muted small">Benefício padrão</div>
              )}
              {b.boost && b.id !== 'viagens' && <div className="muted small">Padrão: {b.standard}</div>}
            </div>
          </Card>
        ))}

        <p className="center small" style={{ margin: '14px 0 0', color: 'var(--green-dark)', fontWeight: 600 }}>
          {tier.id === 'base' ? 'Melhore seu DriveScore para ampliar ainda mais suas vantagens.' : 'Continue evoluindo sua direção para aumentar suas vantagens.'}
        </p>

        <Button icon="gift" onClick={() => showToast('Clube de Benefícios — fora do escopo do MVP')}>
          Ir para o Clube de Benefícios
        </Button>
        <div style={{ height: 10 }} />
        <Button variant="outline" icon="trophy" onClick={() => go('wrapped')}>
          Ver minha retrospectiva do mês
        </Button>

        <div className="demo-preview">
          <span>Demo · simular DriveScore</span>
          <div className="chips">
            {[null, 54, 72, 87].map((v) => (
              <button key={String(v)} className={`chip ${preview === v ? 'on' : ''}`} onClick={() => setPreview(v)}>
                {v === null ? `Real (${real})` : v}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
