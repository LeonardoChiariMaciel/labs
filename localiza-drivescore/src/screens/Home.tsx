import { useApp } from '../state'
import { classify } from '../services/score'
import { computePeriod } from '../services/periods'
import { USER } from '../data/mock'
import { Button, Card, CarArt, Icon, Progress, Ring, Tag } from '../components/ui'

export function Wordmark() {
  return (
    <div className="wordmark">
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 20c0-9 5-16 18-16 0 10-5 16-14 16-2 0-3-.2-4 0z" fill="#0B6B35" /><path d="M6 20c2-5 5-8 10-10" stroke="#7BE24A" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      <span>
        Localiza<small>Assinatura</small>
      </span>
    </div>
  )
}

export default function Home() {
  const { go, scenario, showToast } = useApp()
  const week = computePeriod(scenario, 'd7')
  const s = week.score.overall
  const rising = week.delta >= 0

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn outlined" aria-label="Perfil" onClick={() => showToast('Perfil — fora do escopo do MVP')}>
          <Icon name="user" size={20} />
        </button>
        <Wordmark />
        <button className="icon-btn" aria-label="Menu" onClick={() => showToast('Menu — fora do escopo do MVP')}>
          <Icon name="menu" size={24} />
        </button>
      </div>

      <div className="content">
        <p className="greet">Olá, {USER.nome}</p>
        <div className="row-between">
          <h2 className="h-green">Meus carros</h2>
          <Icon name="chevron" size={20} color="var(--green-dark)" />
        </div>

        <Card className="car-card">
          <CarArt />
          <div className="car-title">
            <Icon name="copy" size={16} /> <b>{USER.placa}</b>
            <Tag tone="gray">Local</Tag>
          </div>
          <div className="muted small">{USER.versao}</div>
          <div className="km-line">
            <span className="muted small">Km rodados este mês</span>
          </div>
          <Progress value={(USER.kmMes / USER.franquiaKm) * 100} height={9} />
          <div className="row-between small" style={{ marginTop: 6 }}>
            <b>{USER.kmMes.toLocaleString('pt-BR')} km/{USER.franquiaKm.toLocaleString('pt-BR')} km</b>
            <span className="link-text">Mais detalhes</span>
          </div>
          <div className="quick">
            {[['doc', 'CRLV'], ['wrench', 'Serviços'], ['doc', 'Multas']].map(([i, l]) => (
              <button key={l} onClick={() => showToast(`${l} — fora do escopo do MVP`)}>
                <Icon name={i} size={20} color="var(--green)" />
                <span>{l}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* NOVO — DriveScore integrado à Home */}
        <Card className="ds-home" onClick={() => go('dashboard')}>
          <div className="row-between">
            <div className="ds-home-title">
              <Icon name="gauge" size={20} color="var(--green)" />
              <h3>Seu DriveScore</h3>
            </div>
            <Tag tone="green">Novo</Tag>
          </div>
          <div className="ds-home-body">
            <Ring value={s} size={92} stroke={9}>
              <span className="ring-num sm">{s}</span>
            </Ring>
            <div className="ds-home-info">
              <div className="ds-home-score">
                DriveScore: <b>{s}</b>
              </div>
              <span className={`seal ${s >= 90 ? '' : 'seal-soft'}`}>
                <Icon name={s >= 90 ? 'shield' : 'check'} size={14} /> {classify(s)}
              </span>
              <div className={`delta ${rising ? 'up' : 'down'}`}>
                <Icon name="trend" size={14} /> {rising ? '+' : ''}
                {week.delta} {Math.abs(week.delta) === 1 ? 'ponto' : 'pontos'} esta semana
              </div>
            </div>
          </div>
          <Button icon="chart" onClick={() => go('dashboard')}>
            Ver meu desempenho
          </Button>
        </Card>

        <h2 className="h-green" style={{ marginTop: 22 }}>Faturas</h2>
        <Card>
          <Tag tone="yellow">A vencer</Tag>
          <div className="muted small" style={{ marginTop: 10 }}>Valor total de 2 faturas</div>
          <div className="invoice">R$ 7.000,00</div>
          <span className="link-text small">Mostrar todas as faturas →</span>
        </Card>

        <h2 className="h-green" style={{ marginTop: 22 }}>Benefícios</h2>
        <div className="hscroll">
          <Card className="promo" onClick={() => go('benefits')}>
            <div className="promo-art"><Icon name="trophy" size={34} color="#fff" /></div>
            <div className="promo-body">
              <b><Icon name="gift" size={15} /> Clube de Benefícios</b>
              <p className="muted small">Bons condutores desbloqueiam vantagens extras.</p>
              <Button variant="primary" block>Ver benefícios</Button>
            </div>
          </Card>
          <Card className="promo" onClick={() => showToast('Indicação — fora do escopo do MVP')}>
            <div className="promo-art alt"><Icon name="gift" size={34} color="#fff" /></div>
            <div className="promo-body">
              <b><Icon name="gift" size={15} /> Indique e ganhe</b>
              <p className="muted small">Indique um amigo para assinar.</p>
              <Button variant="outline" block>Indicar</Button>
            </div>
          </Card>
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
