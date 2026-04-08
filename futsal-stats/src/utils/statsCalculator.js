export function computePlayerStats(matches, playerId) {
  let goals = 0
  let assists = 0
  let yellowCards = 0
  let redCards = 0
  let minutesPlayed = 0
  let matchesPlayed = 0

  for (const match of matches) {
    const playerEvents = match.events.filter((e) => e.playerId === playerId)
    if (playerEvents.length > 0) matchesPlayed++
    for (const event of playerEvents) {
      if (event.type === 'goal') goals++
      else if (event.type === 'assist') assists++
      else if (event.type === 'yellow_card') yellowCards++
      else if (event.type === 'red_card') redCards++
      else if (event.type === 'minutes') minutesPlayed += event.value
    }
  }

  const goalRatio = matchesPlayed > 0 ? (goals / matchesPlayed).toFixed(2) : '0.00'

  return { playerId, goals, assists, yellowCards, redCards, minutesPlayed, matchesPlayed, goalRatio }
}

export function computeAllStats(matches, players) {
  return players
    .map((p) => ({ player: p, ...computePlayerStats(matches, p.id) }))
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals
      if (b.assists !== a.assists) return b.assists - a.assists
      return a.player.name.localeCompare(b.player.name)
    })
}

export function computeTeamSummary(matches) {
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0

  for (const m of matches) {
    goalsFor += m.ourScore
    goalsAgainst += m.theirScore
    if (m.ourScore > m.theirScore) wins++
    else if (m.ourScore === m.theirScore) draws++
    else losses++
  }

  return {
    totalMatches: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
  }
}
