export const POSITIONS = ['Goleiro', 'Fixo', 'Ala', 'Pivô']

export const POSITION_COLORS = {
  Goleiro: { bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500' },
  Fixo: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
  Ala: { bg: 'bg-green-600', text: 'text-green-400', border: 'border-green-500' },
  'Pivô': { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-500' },
}

export const POSITION_SHORT = {
  Goleiro: 'GOL',
  Fixo: 'FIX',
  Ala: 'ALA',
  'Pivô': 'PIV',
}

export const QUADROS = ['Quadro 1', 'Quadro 2']

export const QUADRO_COLORS = {
  'Quadro 1': { bg: 'bg-indigo-600', text: 'text-indigo-400', light: 'bg-indigo-900/40 border-indigo-700' },
  'Quadro 2': { bg: 'bg-orange-600', text: 'text-orange-400', light: 'bg-orange-900/40 border-orange-700' },
}

export const EVENT_TYPES = [
  { value: 'goal', label: 'Gol', icon: '⚽' },
  { value: 'assist', label: 'Assistência', icon: '🎯' },
  { value: 'yellow_card', label: 'Cartão Amarelo', icon: '🟨' },
  { value: 'red_card', label: 'Cartão Vermelho', icon: '🟥' },
  { value: 'minutes', label: 'Minutos Jogados', icon: '⏱' },
]

export const VENUE_OPTIONS = [
  { value: 'home', label: 'Casa' },
  { value: 'away', label: 'Fora' },
  { value: 'neutral', label: 'Neutro' },
]
