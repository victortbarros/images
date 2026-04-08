const PLAYERS_KEY = 'futsal_players'
const MATCHES_KEY = 'futsal_matches'

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getPlayers: () => read(PLAYERS_KEY) ?? [],
  setPlayers: (players) => write(PLAYERS_KEY, players),
  getMatches: () => read(MATCHES_KEY) ?? [],
  setMatches: (matches) => write(MATCHES_KEY, matches),
}
