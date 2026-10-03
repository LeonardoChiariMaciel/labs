import { useApp } from '../state'
import { PILLARS, pillarScore, type DriveEvent } from '../services/score'
import { shouldReengage } from '../services/gamification'
import { computePeriod } from '../services/periods'
import { Button, Card, Icon, Tag } from '../components/ui'
import { Header, StatusBar } from '../components/chrome'
import { PILLAR_ICON, PILLAR_TITLE } from './Dashboard'

const PILLAR_DESC = {
  velocidade: 'Tempo acima do limite da via.',
  frenagem: 'Desacelerações com força G elevada.',
  aceleracao: 'Arrancadas e retomadas intensas.',
  curvas: 'Força lateral acima do confortável.',
} as const

const sample = (n: number): DriveEvent[] => Array.from({ length: n }, () => ({ intensity: 1.15, context: 'urbano' as const }))

/** TELA 8 — Como calculamos seu DriveScore */
export function HowItWorks() {
  const short = pillarScore(sample(5), 50, 'frenagem')
  const long = pillarScore(sample(5), 1000, 'frenagem')
  return (
    <div className="screen">
      <Header title="Como funciona" />
      <div className="content">
        <h2 className="h-green big-title">Como calculamos seu DriveScore</h2>
        <p className="lead">Seu DriveScore é calculado com base em dados de condução coletados pela telemetria do veículo.</p>

        <div className="grid2">
          {PILLARS.map((p) => (
            <Card key={p} className="pillar">
              <span className="pillar-ico"><Icon name={PILLAR_ICON[p]} size={18} color="var(--green)" /></span>
              <div className="pillar-name">{PILLAR_TITLE[p]}</div>
              <div className="muted small">{PILLAR_DESC[p]}</div>
            </Card>
          ))}
        </div>

        <Card>
          <h3 className="mb">Uma avaliação justa</h3>
          <p>
            Para tornar a avaliação justa, não consideramos apenas a quantidade de eventos. O sistema analisa a frequência por quilometragem percorrida, a intensidade e o contexto de cada evento.
          </p>
          <div className="compare">
            <div>
              <span className="muted small">5 frenagens em</span>
              <b>50 km</b>
              <div className="cmp-score low">Nota {short}</div>
            </div>
            <div>
              <span className="muted small">5 frenagens em</span>
              <b>1.000 km</b>
              <div className="cmp-score high">Nota {long}</div>
            </div>
          </div>
        </Card>

        <Card className="highlight">
          <b>Dirigir mais não reduz sua nota automaticamente.</b>
          <p className="small" style={{ margin: '4px 0 0' }}>Usamos eventos ponderados por 100 km, então quem roda mais não é prejudicado.</p>
        </Card>

        <Card className="insight tip">
          <div className="insight-head">
            <span className="insight-ico"><Icon name="sparkle" size={16} /></span>
            <h3>O papel da IA</h3>
          </div>
          <p>A IA não calcula o score. Ela apenas interpreta os resultados e transforma os dados em recomendações.</p>
        </Card>

        <div className="flow">
          {['Telemetria', 'Cálculo do score', 'IA explica', 'Você evolui'].map((t, i) => (
            <span key={t}>
              <em>{t}</em>
              {i < 3 && <Icon name="chevron" size={14} color="var(--muted)" />}
            </span>
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}

/** Análise detalhada / histórica — mostra a matemática por pilar. */
export function Analysis() {
  const { result } = useApp()
  const { score, prevScore } = result
  return (
    <div className="screen">
      <Header title="Análise detalhada" />
      <div className="content">
        <p className="lead">
          Período analisado: <b>{score.km.toLocaleString('pt-BR')} km</b> · score anterior {prevScore.overall}
        </p>
        {PILLARS.map((p) => {
          const per100 = (score.counts[p] / Math.max(score.km, 25)) * 100
          return (
            <Card key={p} className="analysis-row">
              <div className="row-between">
                <div className="row-gap">
                  <span className="pillar-ico"><Icon name={PILLAR_ICON[p]} size={18} color="var(--green)" /></span>
                  <b>{PILLAR_TITLE[p]}</b>
                </div>
                <b className="pillar-val sm">{score.categories[p]}</b>
              </div>
              <div className="stat-grid">
                <div><b>{score.counts[p]}</b><span>eventos</span></div>
                <div><b>{per100.toFixed(1)}</b><span>por 100 km</span></div>
                <div><b>{score.rates[p].toFixed(1)}</b><span>ponderado*</span></div>
                <div><b className={result.improvements[p] >= 0 ? 'pos' : 'neg'}>{result.improvements[p] > 0 ? '+' : ''}{result.improvements[p]}%</b><span>vs. anterior</span></div>
              </div>
            </Card>
          )
        })}
        <p className="muted small">*Eventos ponderados por severidade (intensidade²) e contexto (urbano, rodovia, chuva, noite), por 100 km.</p>
      </div>
    </div>
  )
}

/** TELA 7 — Notificação de reengajamento */
export function NotificationScreen() {
  const { scenario, result, firePush, push, showToast, back } = useApp()
  const week = computePeriod(scenario, 'd7')
  const days = scenario.diasSemVisualizar
  const falling = week.delta < 0
  const eligible = shouldReengage(days, week.delta)

  return (
    <div className="screen lock">
      <StatusBar />
      <div className="lock-head">
        <button className="lock-back" onClick={back}>
          <Icon name="back" size={18} /> Voltar ao app
        </button>
        <div className="lock-time">9:41</div>
        <div className="lock-date">sexta-feira, 3 de outubro</div>
      </div>

      <div className="lock-notif">
        <div className="push-app">
          <span className="push-logo">L</span>
          <span>LOCALIZA ASSINATURA</span>
          <span className="push-time">agora</span>
        </div>
        <strong>Seu DriveScore está caindo 📉</strong>
        <p>Alguns comportamentos recentes estão reduzindo sua pontuação e podem afastar você dos próximos benefícios.</p>
        <p>Acesse o app para entender o que mudou e como melhorar.</p>
      </div>

      <Card className="rule">
        <h3 className="mb">Regra de envio</h3>
        <div className={`rule-row ${days > 10 ? 'ok' : ''}`}>
          <Icon name={days > 10 ? 'check' : 'close'} size={16} /> Sem ver o DriveScore há <b>{days} dias</b> (limite: &gt; 10)
        </div>
        <div className={`rule-row ${falling ? 'ok' : ''}`}>
          <Icon name={falling ? 'check' : 'close'} size={16} /> Score em queda ({week.delta >= 0 ? '+' : ''}{week.delta} pts na semana)
        </div>
        <div style={{ marginTop: 10 }}>
          {eligible ? <Tag tone="green">Cliente elegível ao envio</Tag> : <Tag tone="gray">Neste cenário a push não seria enviada</Tag>}
        </div>
        <p className="muted small" style={{ margin: '8px 0 0' }}>
          Dica: troque para “Score em queda” no painel para ver o gatilho real.
        </p>
      </Card>

      <div style={{ padding: '0 16px 16px' }}>
        <Button
          icon="bell"
          onClick={() => {
            firePush()
            showToast('Push simulada enviada')
          }}
        >
          {push ? 'Notificação exibida' : 'Simular notificação'}
        </Button>
        <p className="light-note">Toque na notificação no topo para abrir o DriveScore (score atual: {result.score.overall}).</p>
      </div>
    </div>
  )
}
