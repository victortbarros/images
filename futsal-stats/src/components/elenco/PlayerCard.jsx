import { Pencil, UserX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PlayerAvatar } from './PlayerAvatar'
import { PositionBadge, QuadrosBadges } from '../common/Badge'
import { useStats } from '../../hooks/useStats'
import { getPlayerQuadros } from '../../utils/playerHelpers'

export function PlayerCard({ player, onEdit, onRemove }) {
  const navigate = useNavigate()
  const { getPlayerStats } = useStats()
  const stats = getPlayerStats(player.id)
  const quadros = getPlayerQuadros(player)

  return (
    <div
      className={`card p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors ${!player.active ? 'opacity-50' : ''}`}
      onClick={() => navigate(`/elenco/${player.id}`)}
    >
      <PlayerAvatar player={player} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white truncate">{player.name}</span>
          <PositionBadge position={player.position} />
          <QuadrosBadges quadros={quadros} />
          {!player.active && <span className="text-xs text-slate-500 italic">inativo</span>}
        </div>
        <div className="flex gap-3 mt-1 text-xs text-slate-400">
          <span>⚽ {stats.goals} gols</span>
          <span>🎯 {stats.assists} assist.</span>
          <span>📋 {stats.frequencia}</span>
        </div>
      </div>
      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors" onClick={onEdit} title="Editar">
          <Pencil size={15} />
        </button>
        {player.active && (
          <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors" onClick={onRemove} title="Desativar">
            <UserX size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
