import { SCENARIOS } from './data/mock'
import { llmEnabled } from './services/aiInsights'
import { useApp, type Route } from './state'
import { BottomNav, PushBanner, StatusBar } from './components/chrome'
import Home from './screens/Home'
import Dashboard from './screens/Dashboard'
import InsightsScreen from './screens/Insights'
import Evolution from './screens/Evolution'
import Benefits from './screens/Benefits'
import Wrapped from './screens/Wrapped'
import { Analysis, HowItWorks, NotificationScreen } from './screens/Info'

const SCREENS: Record<Route, () => React.ReactElement> = {
  home: Home,
  dashboard: Dashboard,
  insights: InsightsScreen,
  evolution: Evolution,
  benefits: Benefits,
  wrapped: Wrapped,
  how: HowItWorks,
  analysis: Analysis,
  notif: NotificationScreen,
}

const JUMPS: [Route, string][] = [
  ['home', '1 · Home'],
  ['dashboard', '2 · Dashboard'],
  ['insights', '3 · Insights da IA'],
  ['evolution', '4 · Evolução'],
  ['benefits', '5 · Benefícios'],
  ['wrapped', '6 · Retrospectiva'],
  ['notif', '7 · Notificação'],
  ['how', '8 · Como calculamos'],
]

export default function App() {
  const { route, reset, scenario, setScenario, firePush, toast, setPeriod } = useApp()
  const Screen = SCREENS[route]
  const immersive = route === 'wrapped' || route === 'notif'

  return (
    <div className="stage">
      <aside className="demo-panel">
        <h1>Localiza <span>DriveScore AI</span></h1>
        <p className="muted small">MVP navegável · painel de apresentação</p>

        <h4>Cenário do Bruno</h4>
        {SCENARIOS.map((s) => (
          <button key={s.id} className={`demo-opt ${scenario.id === s.id ? 'on' : ''}`} onClick={() => { setScenario(s.id); setPeriod('d7') }}>
            <b>{s.label}</b>
            <span>{s.description}</span>
          </button>
        ))}

        <h4>Ir para a tela</h4>
        <div className="jumps">
          {JUMPS.map(([r, l]) => (
            <button key={r} className={route === r ? 'on' : ''} onClick={() => reset(r)}>{l}</button>
          ))}
        </div>

        <h4>Reengajamento</h4>
        <button className="demo-action" onClick={firePush}>🔔 Simular notificação</button>

        <p className="muted small" style={{ marginTop: 18 }}>
          IA: <b>{llmEnabled ? 'LLM conectado' : 'modo demonstração (sem chave)'}</b>
        </p>
      </aside>

      <main className="phone">
        <div className="phone-notch" />
        <div className={`viewport ${immersive ? 'immersive' : ''}`}>
          {route !== 'notif' && <StatusBar dark={route === 'wrapped'} />}
          <div className="scroll" key={route}>
            <Screen />
          </div>
          {!immersive && <BottomNav />}
        </div>
        <PushBanner />
        <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
      </main>
    </div>
  )
}
