import { useEffect, useState, type ReactNode } from 'react'
import { useApp } from '../state'
import { PERIOD_LABEL, type Period } from '../services/periods'
import { Button, Icon } from './ui'

export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`statusbar ${dark ? 'on-dark' : ''}`}>
      <span>9:41</span>
      <span className="sb-icons">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x=".5" y=".5" width="20" height="10" rx="3" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="15" height="7" rx="1.8" fill="currentColor" /><rect x="21.5" y="3.5" width="2" height="4" rx="1" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  )
}

export function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { back } = useApp()
  return (
    <header className="header">
      <button className="icon-btn" onClick={onBack ?? back} aria-label="Voltar">
        <Icon name="back" size={22} />
      </button>
      <h1>{title}</h1>
      <div className="header-right">{right}</div>
    </header>
  )
}

export function BottomNav() {
  const { reset, showToast } = useApp()
  const items = [
    { icon: 'home', label: 'Início', active: true },
    { icon: 'dollar', label: 'Pagamentos' },
    { icon: 'wrench', label: 'Serviços' },
    { icon: 'help', label: 'Ajuda' },
  ]
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.label}
          className={it.active ? 'active' : ''}
          onClick={() => (it.active ? reset('home') : showToast('Fora do escopo deste MVP — foco no DriveScore'))}
        >
          <Icon name={it.icon} size={22} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const TODAY = new Date('2026-10-03T12:00:00')
const iso = (d: Date) => d.toISOString().slice(0, 10)

/** Filtro Hoje | 7 dias | 30 dias | Personalizado. */
export function PeriodFilter() {
  const { period, setPeriod, customDays, setCustomDays } = useApp()
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(iso(new Date(TODAY.getTime() - 14 * 86400000)))
  const [to, setTo] = useState(iso(TODAY))

  const days = Math.max(1, Math.min(90, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1))
  const periods: Period[] = ['hoje', 'd7', 'd30', 'custom']

  return (
    <>
      <div className="chips" role="tablist">
        {periods.map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            className={`chip ${period === p ? 'on' : ''}`}
            onClick={() => (p === 'custom' ? setOpen(true) : setPeriod(p))}
          >
            {p === 'custom' && period === 'custom' ? `${customDays} dias` : PERIOD_LABEL[p]}
          </button>
        ))}
      </div>
      {open && (
        <Sheet title="Período personalizado" onClose={() => setOpen(false)}>
          <div className="date-row">
            <label>
              De
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              Até
              <input type="date" value={to} min={from} max={iso(TODAY)} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
          <p className="muted small" style={{ margin: '12px 0 16px' }}>
            {days} {days === 1 ? 'dia' : 'dias'} selecionados (máx. 90). Os dados abaixo são simulados com o mesmo perfil de condução.
          </p>
          <Button
            onClick={() => {
              setCustomDays(days)
              setPeriod('custom')
              setOpen(false)
            }}
          >
            Aplicar período
          </Button>
        </Sheet>
      )}
    </>
  )
}

/** Push simulada que desce do topo do celular. */
export function PushBanner() {
  const { push, dismissPush, go, reset } = useApp()
  useEffect(() => {
    if (!push) return
    const t = window.setTimeout(dismissPush, 9000)
    return () => window.clearTimeout(t)
  }, [push, dismissPush])
  return (
    <div className={`push ${push ? 'show' : ''}`}>
      <button
        className="push-body"
        onClick={() => {
          dismissPush()
          reset('home')
          go('dashboard')
        }}
      >
        <div className="push-app">
          <span className="push-logo">L</span>
          <span>LOCALIZA ASSINATURA</span>
          <span className="push-time">agora</span>
        </div>
        <strong>Seu DriveScore está caindo 📉</strong>
        <p>Alguns comportamentos recentes estão reduzindo sua pontuação e podem afastar você dos próximos benefícios. Acesse o app para entender o que mudou e como melhorar.</p>
      </button>
    </div>
  )
}
