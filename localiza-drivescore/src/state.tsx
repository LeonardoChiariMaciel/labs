import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_SCENARIO, SCENARIOS, type Scenario } from './data/mock'
import { computePeriod, type Period, type PeriodResult } from './services/periods'

export type Route = 'home' | 'dashboard' | 'insights' | 'evolution' | 'benefits' | 'wrapped' | 'how' | 'analysis' | 'notif'

interface AppState {
  scenario: Scenario
  setScenario: (id: Scenario['id']) => void
  period: Period
  setPeriod: (p: Period) => void
  customDays: number
  setCustomDays: (n: number) => void
  result: PeriodResult
  route: Route
  go: (r: Route) => void
  back: () => void
  reset: (r: Route) => void
  toast: string | null
  showToast: (msg: string) => void
  push: boolean
  firePush: () => void
  dismissPush: () => void
}

const ROUTES: Route[] = ['home', 'dashboard', 'insights', 'evolution', 'benefits', 'wrapped', 'how', 'analysis', 'notif']

/** Permite abrir direto uma tela na demo: http://localhost:5173/#benefits */
function initialStack(): Route[] {
  const h = window.location.hash.replace('#', '') as Route
  return ROUTES.includes(h) && h !== 'home' ? ['home', h] : ['home']
}

const Ctx = createContext<AppState>(null!)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }: { children: ReactNode }) {
  const [scenarioId, setScenarioId] = useState<Scenario['id']>(DEFAULT_SCENARIO)
  const [period, setPeriod] = useState<Period>('d7')
  const [customDays, setCustomDays] = useState(15)
  const [stack, setStack] = useState<Route[]>(initialStack)
  const [toast, setToast] = useState<string | null>(null)
  const [push, setPush] = useState(false)
  const toastTimer = useRef<number>(0)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const result = useMemo(() => computePeriod(scenario, period, customDays), [scenario, period, customDays])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const value: AppState = {
    scenario,
    setScenario: setScenarioId,
    period,
    setPeriod,
    customDays,
    setCustomDays,
    result,
    route: stack[stack.length - 1],
    go: (r) => setStack((s) => (s[s.length - 1] === r ? s : [...s, r])),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    reset: (r) => setStack([r]),
    toast,
    showToast,
    push,
    firePush: () => setPush(true),
    dismissPush: () => setPush(false),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
