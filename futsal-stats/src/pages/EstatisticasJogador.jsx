import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useStats } from '../hooks/useStats'
import { PlayerAvatar } from '../components/elenco/PlayerAvatar'
import { PositionBadge, QuadroBadge } from '../components/common/Badge'
import { StatCard } from '../components/common/StatCard'
import { formatDate, formatMatchResult, resultColor } from '../utils/formatters'
import { EVENT_TYPES } from '../constants/positions'

export function EstatisticasJogador() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, matches } = useApp()
  const { getPlayerStats } = useStats()

  const player = players.find((p) => p.id === id)

  if (!player) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Jogador não encontrado.</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/elenco')}>
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
    )
  }

  const stats = getPlayerStats(id)

  const playerMatches = matches
    .filter((m) => m.events.some((e) => e.playerId === id))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const getEventIcon = (t) => EVENT_TYPES.find((e) => e.value === t)?.icon ?? ''

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button className="text-slate-400 hover:text-white transition-colors" onClick={() => navigate('/elenco')}>
          <ArrowLeft size={20} />
        </button>
        <PlayerAvatar player={player} size="md" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{player.name}</h1>
            <PositionBadge position={player.position} />
            <QuadroBadge quadro={player.quadro ?? 'Quadro 1'} />
          </div>
          <p className="text-sm text-slate-400">#{player.number}{!player.active ? ' · inativo' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon="📋" label="Partidas" value={stats.matchesPlayed} />
        <StatCard icon="⚽" label="Gols" value={stats.goals} color="text-green-400" />
        <StatCard icon="🎯" label="Assistências" value={stats.assists} />
        <StatCard icon="🟨" label="Cartões Amarelos" value={stats.yellowCards} color="text-yellow-400" />
        <StatCard icon="🟥" label="Cartões Vermelhos" value={stats.redCards} color="text-red-400" />
        <StatCard icon="⏱" label="Minutos" value={stats.minutesPlayed} sub={`média: ${stats.matchesPlayed > 0 ? (stats.minutesPlayed / stats.matchesPlayed).toFixed(1) : '—'} min/jogo`} />
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Histórico de partidas</h2>
        {playerMatches.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhuma partida registrada.</p>
        ) : (
          <div className="space-y-2">
            {playerMatches.map((match) => {
              const myEvents = match.events.filter((e) => e.playerId === id)
              return (
                <div
                  key={match.id}
                  className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/20 rounded-lg px-2 transition-colors"
                  onClick={() => navigate(`/partidas/${match.id}`)}
                >
                  <div className="shrink-0 text-center w-16">
                    <div className="text-sm font-bold text-white">{match.ourScore}×{match.theirScore}</div>
                    <div className={`text-xs ${resultColor(match)}`}>{formatMatchResult(match)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">vs {match.opponent}</div>
                    <div className="text-xs text-slate-400">{formatDate(match.date)}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {myEvents.map((ev) => (
                        <span key={ev.id} className="text-xs bg-slate-700 rounded px-1.5 py-0.5 text-slate-300">
                          {getEventIcon(ev.type)} {ev.type === 'minutes' ? `${ev.value}min` : (ev.minute ? `${ev.minute}'` : '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
