import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { computePlayerStats, computeAllStats, computeTeamSummary } from '../utils/statsCalculator'

export function useStats() {
  const { players, matches } = useApp()

  const allStats = useMemo(() => computeAllStats(matches, players), [matches, players])
  const teamSummary = useMemo(() => computeTeamSummary(matches), [matches])

  const getPlayerStats = useMemo(
    () => (id) => computePlayerStats(matches, id),
    [matches]
  )

  const getRecentMatches = useMemo(
    () => (n = 5) => [...matches].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n),
    [matches]
  )

  return { allStats, teamSummary, getPlayerStats, getRecentMatches }
}
