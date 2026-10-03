import { useApp } from '../state'
import { benefitState } from '../services/periods'
import { SCORE_TO_UNLOCK, WEEKS_TO_UNLOCK } from '../data/mock'
import { Button, Card, Icon, Progress, Tag } from '../components/ui'
import { Header } from '../components/chrome'

export default function Benefits() {
  const { scenario, go, showToast } = useApp()
  const st = benefitState(scenario)

  return (
    <div className="screen">
      <Header title="Benefícios" />
      <div className="content">
        <h2 className="h-green big-title">Seus benefícios</h2>
        <p className="lead">Bons condutores podem desbloquear vantagens extras dentro do Clube de Benefícios Localiza.</p>

        <Card className="tier">
          <div className="tier-cols">
            <div>
              <div className="muted small">Benefício atual</div>
              <b>{st.unlocked ? 'DriveScore Ouro' : 'Clube de Benefícios padrão'}</b>
            </div>
            <Icon name="chevron" size={18} color="var(--muted)" />
            <div>
              <div className="muted small">{st.unlocked ? 'Nível máximo' : 'Próximo nível'}</div>
              <b className="gold">{st.unlocked ? 'Mantido 🎉' : 'DriveScore Ouro'}</b>
            </div>
          </div>
          <Progress value={(st.streak / WEEKS_TO_UNLOCK) * 100} height={12} />
          <div className="row-between small" style={{ marginTop: 8 }}>
            <span>
              <b>{st.streak}</b> de {WEEKS_TO_UNLOCK} semanas com score ≥ {SCORE_TO_UNLOCK}
            </span>
            <span className="muted">{Math.round((st.streak / WEEKS_TO_UNLOCK) * 100)}%</span>
          </div>
          <div className="falta">
            {st.unlocked ? (
              <>
                <Icon name="check" size={16} /> Você desbloqueou o DriveScore Ouro
              </>
            ) : (
              <>
                <b>Falta:</b> {st.missing} {st.missing === 1 ? 'semana' : 'semanas'} com score acima de {SCORE_TO_UNLOCK}
              </>
            )}
          </div>
          <div className="weeks">
            {Array.from({ length: WEEKS_TO_UNLOCK }, (_, i) => (
              <span key={i} className={i < st.streak ? 'on' : ''}>{i < st.streak ? <Icon name="check" size={14} /> : i + 1}</span>
            ))}
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>
            Recompensamos consistência: um único dia bom não desbloqueia o nível.
          </p>
        </Card>

        <div className="section-title"><h2>Vantagens do ecossistema</h2></div>
        {st.benefits.map((b) => (
          <Card key={b.id} className={`benefit ${b.unlocked ? '' : 'locked'}`}>
            <span className="pillar-ico"><Icon name={b.unlocked ? b.icon : 'lock'} size={18} color={b.unlocked ? 'var(--green)' : 'var(--muted)'} /></span>
            <div className="grow">
              <b>{b.title}</b>
              <div className="muted small">{b.desc}</div>
            </div>
            {b.unlocked ? <Tag tone="green">Ativo</Tag> : <Tag tone="gray">Ouro</Tag>}
          </Card>
        ))}

        <Button icon="gift" onClick={() => showToast('Clube de Benefícios — fora do escopo do MVP')}>
          Ir para o Clube de Benefícios
        </Button>
        <div style={{ height: 10 }} />
        <Button variant="outline" icon="trophy" onClick={() => go('wrapped')}>
          Ver minha retrospectiva do mês
        </Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
