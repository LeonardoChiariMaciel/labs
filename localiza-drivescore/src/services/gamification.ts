export type Medal = 'Ouro' | 'Prata' | 'Bronze' | null

/** Medalhas mensais: Top 0–5% Ouro · 5–10% Prata · 10–15% Bronze. */
export function medalFor(percentile: number): Medal {
  if (percentile <= 5) return 'Ouro'
  if (percentile <= 10) return 'Prata'
  if (percentile <= 15) return 'Bronze'
  return null
}

/** Reengajamento: >10 dias sem ver o DriveScore E score em queda. */
export function shouldReengage(daysSinceLastView: number, scoreDelta: number): boolean {
  return daysSinceLastView > 10 && scoreDelta < 0
}
