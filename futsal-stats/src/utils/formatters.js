export function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString + (isoString.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('pt-BR')
}

export function formatMatchResult(match) {
  if (match.ourScore > match.theirScore) return 'Vitória'
  if (match.ourScore === match.theirScore) return 'Empate'
  return 'Derrota'
}

export function resultColor(match) {
  if (match.ourScore > match.theirScore) return 'text-green-400'
  if (match.ourScore === match.theirScore) return 'text-yellow-400'
  return 'text-red-400'
}

export function resultBg(match) {
  if (match.ourScore > match.theirScore) return 'bg-green-900/40 border-green-700'
  if (match.ourScore === match.theirScore) return 'bg-yellow-900/40 border-yellow-700'
  return 'bg-red-900/40 border-red-700'
}

export function formatVenue(venue) {
  const map = { home: 'Casa', away: 'Fora', neutral: 'Neutro' }
  return map[venue] ?? venue
}

export function formatPosition(position) {
  const map = { Goleiro: 'GOL', Fixo: 'FIX', Ala: 'ALA', 'Pivô': 'PIV' }
  return map[position] ?? position
}
