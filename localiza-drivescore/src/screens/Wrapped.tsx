import { useMemo, useState } from 'react'
import { useApp } from '../state'
import { computePeriod } from '../services/periods'
import { eventRateChangePct } from '../services/score'
import { medalFor, type Medal } from '../services/gamification'
import { USER } from '../data/mock'
import { Button, Icon, MedalIcon } from '../components/ui'
import { Sheet } from '../components/chrome'
import { Wordmark } from './Home'

interface Stats {
  km: number
  avg: number
  brakingChange: number
  daysNoSpeeding: number
  deltaPts: number
  percentile: number
  medal: Medal
}

function useStats(): Stats {
  const { scenario } = useApp()
  return useMemo(() => {
    const m = computePeriod(scenario, 'd30')
    return {
      km: m.score.km,
      avg: m.score.overall,
      brakingChange: eventRateChangePct(m.prevScore.counts.frenagem, m.prevScore.km, m.score.counts.frenagem, m.score.km),
      daysNoSpeeding: scenario.diasSemExcessoVelocidade,
      deltaPts: m.delta,
      percentile: scenario.rankingPercentile,
      medal: medalFor(scenario.rankingPercentile),
    }
  }, [scenario])
}

const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`

export function ShareCard({ s }: { s: Stats }) {
  return (
    <div className="share-card">
      <div className="share-top">
        <Wordmark />
        <span className="share-month">Setembro 2026</span>
      </div>
      <div className="share-medal">{s.medal ? <MedalIcon kind={s.medal} size={92} /> : <Icon name="trophy" size={64} color="#fff" />}</div>
      <div className="share-title">{s.medal ? `Medalha ${s.medal}` : 'Em evolução'}</div>
      <div className="share-sub">
        {USER.nome} ficou entre os <b>{s.percentile}%</b> melhores condutores Localiza Assinatura
      </div>
      <div className="share-stats">
        <div><b>{s.avg}</b><span>score médio</span></div>
        <div><b>{s.km.toLocaleString('pt-BR')}</b><span>km</span></div>
        <div><b>{signed(s.deltaPts)}</b><span>pontos</span></div>
      </div>
      <div className="share-foot">DriveScore AI</div>
    </div>
  )
}

export default function Wrapped() {
  const { back, showToast } = useApp()
  const s = useStats()
  const [i, setI] = useState(0)
  const [share, setShare] = useState(false)

  const slides = [
    { kicker: 'Seu mês na direção', big: s.km.toLocaleString('pt-BR'), unit: 'km rodados', cap: `Ótimas viagens, ${USER.nome}. Trabalho, academia, escola e fim de semana — tudo registrado com segurança.` },
    { kicker: 'Score médio', big: String(s.avg), unit: 'de 100', cap: s.avg >= 90 ? 'Uma condução consistente e suave ao longo do mês.' : 'Uma base sólida para evoluir mês a mês.' },
    {
      kicker: 'Frenagens bruscas',
      big: `${signed(s.brakingChange)}%`,
      unit: 'vs. mês anterior',
      cap: s.brakingChange <= 0 ? 'Você antecipou mais as desacelerações. Isso faz diferença para a segurança de quem está com você.' : 'Este é seu principal ponto de melhoria para o próximo mês.',
    },
    { kicker: 'Velocidade', big: String(s.daysNoSpeeding), unit: 'dias sem excesso de velocidade', cap: 'Controle de velocidade é o pilar que mais protege você e sua família.' },
    { kicker: 'Sua evolução', big: `${signed(s.deltaPts)}`, unit: 'pontos no mês', cap: s.deltaPts >= 0 ? 'Cada semana um pouco melhor que a anterior.' : 'Pequenos ajustes já mudam essa curva.' },
  ]
  const last = slides.length
  const isLast = i === last
  const next = () => setI((v) => Math.min(last, v + 1))
  const prev = () => setI((v) => Math.max(0, v - 1))

  const copy = async () => {
    const txt = `🏅 ${s.medal ? `Medalha ${s.medal}` : 'DriveScore'} — ${USER.nome} está entre os ${s.percentile}% melhores condutores Localiza Assinatura! Score médio ${s.avg} em ${s.km} km.`
    try {
      await navigator.clipboard.writeText(txt)
    } catch {
      /* clipboard pode estar bloqueado; a simulação continua */
    }
    showToast('Card copiado!')
  }

  return (
    <div className="screen wrapped">
      <div className="story-bars">
        {Array.from({ length: last + 1 }, (_, k) => (
          <span key={k} className={k <= i ? 'on' : ''} />
        ))}
      </div>
      <button className="wrapped-close" onClick={back} aria-label="Fechar">
        <Icon name="close" size={22} />
      </button>

      {!isLast ? (
        <div className="story" key={i}>
          <div className="tap left" onClick={prev} />
          <div className="tap right" onClick={next} />
          <div className="story-in">
            <div className="kicker">{slides[i].kicker}</div>
            <div className="story-big">{slides[i].big}</div>
            <div className="unit">{slides[i].unit}</div>
            <p className="cap">{slides[i].cap}</p>
          </div>
          <div className="story-hint">Toque para continuar</div>
        </div>
      ) : (
        <div className="story final" key="final">
          <div className="story-in">
            <div className="kicker">Resultado do mês</div>
            <h2 className="final-title">
              {s.medal ? (
                <>Você ficou entre os <em>{s.percentile}%</em> melhores condutores Localiza Assinatura</>
              ) : (
                <>Você está no top <em>{s.percentile}%</em> dos condutores Localiza Assinatura</>
              )}
            </h2>
            <div className="medal-wrap">
              {s.medal ? <MedalIcon kind={s.medal} size={120} /> : <Icon name="trophy" size={80} color="#fff" />}
              <div className="medal-name">{s.medal ? `Medalha ${s.medal}` : 'Próxima medalha: Bronze (top 15%)'}</div>
            </div>
            <div className="medal-rules">
              <span className={s.medal === 'Ouro' ? 'on' : ''}>Top 5% · Ouro</span>
              <span className={s.medal === 'Prata' ? 'on' : ''}>5–10% · Prata</span>
              <span className={s.medal === 'Bronze' ? 'on' : ''}>10–15% · Bronze</span>
            </div>
          </div>
          <div className="final-actions">
            <Button variant="primary" icon="share" onClick={() => setShare(true)}>Compartilhar conquista</Button>
            <button className="link light" onClick={() => setI(0)}>Rever retrospectiva</button>
          </div>
        </div>
      )}

      {share && (
        <Sheet title="Compartilhar conquista" onClose={() => setShare(false)}>
          <div className="share-wrap"><ShareCard s={s} /></div>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            <Button icon="copy" onClick={copy}>Copiar card</Button>
            <Button variant="outline" icon="share" onClick={() => showToast('Prévia: abriria o compartilhamento do celular')}>
              Compartilhar nos Stories
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  )
}
