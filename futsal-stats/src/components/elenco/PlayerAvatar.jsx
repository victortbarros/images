import { POSITION_COLORS } from '../../constants/positions'

export function PlayerAvatar({ player, size = 'md' }) {
  const colors = POSITION_COLORS[player.position] ?? { bg: 'bg-slate-600' }
  const sizeClass = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-lg', lg: 'w-16 h-16 text-2xl' }[size]

  return (
    <div
      className={`${sizeClass} ${colors.bg} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
    >
      {player.number}
    </div>
  )
}
