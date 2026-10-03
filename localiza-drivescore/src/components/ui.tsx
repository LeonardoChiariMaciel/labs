import type { CSSProperties, ReactNode } from 'react'
import { band, type Band } from '../services/score'

/* ----------------------------- Ícones ----------------------------- */
const ICONS: Record<string, ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>),
  home: <path d="M4 11.5L12 4l8 7.5V20H4z" />,
  dollar: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5c0-1 1-1.8 2.5-1.8s2.5.8 2.5 1.8-1 1.6-2.5 2-2.5 1-2.5 2 1 1.8 2.5 1.8 2.5-.8 2.5-1.8" /></>),
  wrench: <path d="M14.5 6.5a4 4 0 0 0 5 5L10 21a2 2 0 0 1-3-3l9.5-9.5" />,
  help: <path d="M12 4l9 16H3zM12 10v4M12 17v.01" />,
  gauge: <path d="M4 18a8 8 0 1 1 16 0M12 18l4-6" />,
  brake: (<><circle cx="12" cy="12" r="9" /><path d="M9 9h6v6H9z" /></>),
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  curve: <path d="M6 20c0-7 5-6 7-9s2-5 5-7" />,
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8M10 17h4" />,
  chart: <path d="M4 19V5M4 19h16M8 15l4-5 3 3 5-7" />,
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>),
  bell: <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 21h4" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  share: <path d="M12 4v12M7 9l5-5 5 5M5 14v6h14v-6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  lock: (<><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" /></>),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  copy: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>),
  gift: <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1" />,
  car: (<><path d="M4 16v-4l2-5h12l2 5v4M3 16h18" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></>),
  doc: <path d="M7 3h8l4 4v14H7zM14 3v5h5" />,
  pin: (<><path d="M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></>),
  calendar: <path d="M5 6h14v14H5zM5 10h14M9 3v4M15 3v4" />,
  eye: (<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /></>),
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  phone: <path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 3-2z" />,
}

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 22, color = 'currentColor', sw = 1.8 }: { name: string; size?: number; color?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name] ?? ICONS.info}
    </svg>
  )
}

/* ----------------------------- Blocos ----------------------------- */
export function Card({ children, className = '', onClick, style }: { children: ReactNode; className?: string; onClick?: () => void; style?: CSSProperties }) {
  return (
    <div className={`card ${onClick ? 'tappable' : ''} ${className}`} onClick={onClick} style={style} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  )
}

export function Tag({ tone = 'green', children }: { tone?: 'green' | 'yellow' | 'orange' | 'gray' | 'dark'; children: ReactNode }) {
  return <span className={`tag tag-${tone}`}>{children}</span>
}

export function Button({ children, onClick, variant = 'primary', icon, block = true }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'outline' | 'ghost' | 'dark'; icon?: string; block?: boolean }) {
  return (
    <button className={`btn btn-${variant} ${block ? 'btn-block' : ''}`} onClick={onClick}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

export function SectionTitle({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action && (
        <button className="link" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

export function Progress({ value, tone = 'green', height = 8 }: { value: number; tone?: Band | 'green'; height?: number }) {
  return (
    <div className="progress" style={{ height }}>
      <div className={`progress-fill fill-${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export const bandColor = (b: Band) => (b === 'high' ? 'var(--green)' : b === 'mid' ? 'var(--amber)' : 'var(--orange)')

/** Anel de progresso. Valor 0–100. */
export function Ring({ value, size = 160, stroke = 12, children, color }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? bandColor(band(value))}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset .7s ease, stroke .3s' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}

/** Gráfico de linha simples (SVG). */
export function LineChart({ points, labels, height = 170 }: { points: number[]; labels: string[]; height?: number }) {
  const W = 320
  const padL = 28
  const padR = 14
  const padT = 18
  const padB = 26
  const min = Math.floor((Math.min(...points) - 6) / 10) * 10
  const max = 100
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, points.length - 1)
  const y = (v: number) => padT + ((max - v) / (max - min)) * (height - padT - padB)
  const path = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${path} L${x(points.length - 1)},${height - padB} L${x(0)},${height - padB} Z`
  const ticks: number[] = []
  for (let t = min; t <= max; t += 10) ticks.push(t)
  const last = points.length - 1
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img" aria-label="Evolução do DriveScore">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--green)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray={t === 90 ? '4 3' : undefined} />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{t}</text>
        </g>
      ))}
      {90 >= min && <text x={padL + 4} y={y(90) - 4} textAnchor="start" fontSize="8.5" fill="var(--green)" fontWeight="600">meta 90</text>}
      <path d={area} fill="url(#lc-fill)" />
      <path d={path} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r={i === last ? 5 : 3.5} fill={i === last ? 'var(--green)' : '#fff'} stroke="var(--green)" strokeWidth="2" />
          {(i === last || points.length <= 6) && (
            <text x={x(i)} y={y(v) - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink)">{v}</text>
          )}
          <text x={x(i)} y={height - 8} textAnchor="middle" fontSize="9" fill="var(--muted)">{labels[i]}</text>
        </g>
      ))}
    </svg>
  )
}

/** Medalha em SVG (Ouro/Prata/Bronze). */
export function MedalIcon({ kind, size = 84 }: { kind: 'Ouro' | 'Prata' | 'Bronze'; size?: number }) {
  const c = {
    Ouro: ['#FFE27A', '#E5A800', '#8A6200'],
    Prata: ['#F2F5F7', '#AAB4BC', '#5E6A72'],
    Bronze: ['#F2C29B', '#C27A3D', '#7A4417'],
  }[kind]
  const id = `m-${kind}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`Medalha ${kind}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c[0]} />
          <stop offset=".55" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </linearGradient>
      </defs>
      <path d="M30 4h16l8 28H38z" fill="#0B6B35" />
      <path d="M70 4H54l-8 28h16z" fill="#7BE24A" />
      <circle cx="50" cy="64" r="30" fill={`url(#${id})`} />
      <circle cx="50" cy="64" r="23" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" />
      <path d="M50 49l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L50 72.6l-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5z" fill="rgba(255,255,255,.9)" />
    </svg>
  )
}

/** Silhueta simplificada do carro (sem depender de imagem externa). */
export function CarArt() {
  return (
    <svg viewBox="0 0 320 120" width="100%" aria-hidden>
      <defs>
        <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4a44" />
          <stop offset="1" stopColor="#1d2622" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="108" rx="130" ry="6" fill="rgba(0,0,0,.12)" />
      <path d="M32 84c0-10 4-16 14-18l26-6 22-26c4-5 10-8 17-8h54c10 0 17 3 24 10l24 24 30 6c10 2 16 8 16 18v8c0 4-3 6-7 6H40c-5 0-8-3-8-6z" fill="url(#car-body)" />
      <path d="M96 56l16-20c3-4 7-6 12-6h46c7 0 12 2 17 7l16 19z" fill="#9db5ae" opacity=".85" />
      <path d="M156 30v26" stroke="#1d2622" strokeWidth="3" />
      <rect x="246" y="70" width="22" height="7" rx="3" fill="#e9f5e0" />
      <rect x="40" y="72" width="16" height="7" rx="3" fill="#f06a4d" />
      <g>
        <circle cx="92" cy="94" r="17" fill="#111" /><circle cx="92" cy="94" r="8" fill="#c8d0cc" />
        <circle cx="230" cy="94" r="17" fill="#111" /><circle cx="230" cy="94" r="8" fill="#c8d0cc" />
      </g>
    </svg>
  )
}

export function Skeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="skeleton">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="sk-line" style={{ width: `${100 - i * 14}%` }} />
      ))}
    </div>
  )
}
