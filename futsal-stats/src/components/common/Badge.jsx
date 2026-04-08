import { POSITION_COLORS, POSITION_SHORT } from '../../constants/positions'

export function PositionBadge({ position }) {
  const colors = POSITION_COLORS[position] ?? { bg: 'bg-slate-600', text: 'text-slate-300' }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.bg} text-white`}>
      {POSITION_SHORT[position] ?? position}
    </span>
  )
}

export function VenueBadge({ venue }) {
  const map = {
    home: { label: 'Casa', cls: 'bg-green-800 text-green-200' },
    away: { label: 'Fora', cls: 'bg-red-900 text-red-200' },
    neutral: { label: 'Neutro', cls: 'bg-slate-600 text-slate-200' },
  }
  const { label, cls } = map[venue] ?? { label: venue, cls: 'bg-slate-600 text-slate-200' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${cls}`}>{label}</span>
}
