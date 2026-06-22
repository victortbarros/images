import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { computePlayerStats, computeAllStats, computeTeamSummary } from '../utils/statsCalculator'
import { getPlayerQuadros } from '../utils/playerHelpers'

export function useStats(filteredMatches = null) {
  const { players, matches } = useApp()
  const effectiveMatches = filteredMatches ?? matches

  const allStats = useMemo(() => computeAllStats(effectiveMatches, players), [effectiveMatches, players])
  const teamSummary = useMemo(() => computeTeamSummary(effectiveMatches), [effectiveMatches])

  const getPlayerStats = useMemo(
    () => (id) => {
      const player = players.find((p) => p.id === id)
      return computePlayerStats(effectiveMatches, id, getPlayerQuadros(player))
    },
    [effectiveMatches, players]
  )

  const getRecentMatches = useMemo(
    () => (n = 5) => [...matches].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n),
    [matches]
  )

  return { allStats, teamSummary, getPlayerStats, getRecentMatches }
}
