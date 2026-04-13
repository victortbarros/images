export function createPlayer({ name, number, position, quadro = 'Quadro 1' }) {
  return {
    id: crypto.randomUUID(),
    name,
    number: Number(number),
    position,
    quadro,
    active: true,
    createdAt: new Date().toISOString(),
  }
}

export function createMatch({ opponent, date, venue, competition, ourScore, theirScore, notes = '', quadro = 'Quadro 1' }) {
  return {
    id: crypto.randomUUID(),
    opponent,
    date,
    venue,
    competition,
    ourScore: Number(ourScore),
    theirScore: Number(theirScore),
    notes,
    quadro,
    presences: [],
    events: [],
    createdAt: new Date().toISOString(),
  }
}

export function createEvent({ type, playerId, minute = null, value = 1 }) {
  return {
    id: crypto.randomUUID(),
    type,
    playerId,
    minute: minute !== '' && minute !== null ? Number(minute) : null,
    value: Number(value),
  }
}
