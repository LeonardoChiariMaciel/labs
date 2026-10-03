import { SCENARIOS } from '../data/mock'
import { computePeriod, weeklyHistory } from '../services/periods'
for (const s of SCENARIOS) {
  console.log('==', s.id, 'hist', weeklyHistory(s).join(','))
  for (const p of ['hoje', 'd7', 'd30'] as const) {
    const r = computePeriod(s, p)
    console.log(p, 'km', r.score.km, 'overall', r.score.overall, 'prev', r.prevScore.overall, 'delta', r.delta, JSON.stringify(r.score.categories), 'cnt', JSON.stringify(r.score.counts), 'impr', JSON.stringify(r.improvements))
  }
}
