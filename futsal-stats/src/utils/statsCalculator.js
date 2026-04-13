export function computePlayerStats(matches, playerId, playerQuadro = 'Quadro 1') {
  let goals = 0
  let assists = 0
  let yellowCards = 0
  let redCards = 0
  let minutesPlayed = 0
  let matchesPresent = 0

  // total matches for this player's quadro
  const totalQuadroMatches = matches.filter(
    (m) => (m.quadro ?? 'Quadro 1') === playerQuadro
  ).length

  for (const match of matches) {
    const presences = match.presences ?? []
    if (presences.includes(playerId)) matchesPresent++

    const playerEvents = match.events.filter((e) => e.playerId === playerId)
    for (const event of playerEvents) {
      if (event.type === 'goal') goals++
      else if (event.type === 'assist') assists++
      else if (event.type === 'yellow_card') yellowCards++
      else if (event.type === 'red_card') redCards++
      else if (event.type === 'minutes') minutesPlayed += event.value
    }
  }

  const frequencia = totalQuadroMatches > 0
    ? `${matchesPresent}/${totalQuadroMatches}`
    : '0/0'

  const frequenciaPercent = totalQuadroMatches > 0
    ? Math.round((matchesPresent / totalQuadroMatches) * 100)
    : 0

  return {
    playerId,
    goals,
    assists,
    yellowCards,
    redCards,
    minutesPlayed,
    matchesPlayed: matchesPresent,
    totalQuadroMatches,
    frequencia,
    frequenciaPercent,
  }
}

export function computeAllStats(matches, players) {
  return players
    .map((p) => ({
      player: p,
      ...computePlayerStats(matches, p.id, p.quadro ?? 'Quadro 1'),
    }))
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
