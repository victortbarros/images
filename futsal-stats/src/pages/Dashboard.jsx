import { useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useStats } from '../hooks/useStats'
import { StatCard } from '../components/common/StatCard'
import { MatchCard } from '../components/partidas/MatchCard'
import { formatMatchResult } from '../utils/formatters'

function TopScorers({ allStats }) {
  const navigate = useNavigate()
  const top = allStats.filter((s) => s.goals > 0).slice(0, 5)
  if (top.length === 0) return <p className="text-sm text-slate-500 py-4 text-center">Nenhum gol registrado.</p>

  const maxGoals = top[0].goals

  return (
    <div className="space-y-2">
      {top.map(({ player, goals, assists }, i) => (
        <div
          key={player.id}
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 rounded-lg p-2 transition-colors"
          onClick={() => navigate(`/elenco/${player.id}`)}
        >
          <span className="text-slate-500 text-xs w-4 text-center font-medium">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white font-medium truncate">{player.name}</span>
              <span className="text-green-400 font-bold text-sm ml-2">{goals} ⚽</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-pitch rounded-full transition-all"
                style={{ width: `${(goals / maxGoals) * 100}%` }}
              />
            </div>
            {assists > 0 && <div className="text-xs text-slate-500 mt-0.5">{assists} assistência{assists !== 1 ? 's' : ''}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { players, matches } = useApp()
  const { teamSummary, allStats, getRecentMatches } = useStats()

  const recentMatches = getRecentMatches(5)
  const activePlayers = players.filter((p) => p.active)

  const isFirstTime = players.length === 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Visão geral do time</p>
        </div>
      </div>

      {isFirstTime && (
        <div className="card p-6 mb-6 border-pitch bg-pitch/10">
          <h2 className="text-base font-semibold text-white mb-1">Bem-vindo ao Futsal Stats! ⚽</h2>
          <p className="text-sm text-slate-400 mb-4">
            Comece adicionando jogadores ao elenco e registrando as partidas do seu time.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-primary" onClick={() => navigate('/elenco')}>
              <Users size={16} /> Adicionar jogadores
            </button>
            <button className="btn-secondary" onClick={() => navigate('/partidas/nova')}>
              <Plus size={16} /> Registrar partida
            </button>
          </div>
        </div>
      )}

      {/* Team summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon="📋" label="Partidas" value={teamSummary.totalMatches} />
        <StatCard icon="✅" label="Vitórias" value={teamSummary.wins} color="text-green-400" />
        <StatCard icon="⚽" label="Gols marcados" value={teamSummary.goalsFor} />
        <StatCard icon="👥" label="Jogadores ativos" value={activePlayers.length} />
      </div>

      {matches.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-green-400">{teamSummary.wins}</div>
            <div className="text-xs text-slate-400">Vitórias</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{teamSummary.draws}</div>
            <div className="text-xs text-slate-400">Empates</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-red-400">{teamSummary.losses}</div>
            <div className="text-xs text-slate-400">Derrotas</div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top scorers */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Artilheiros</h2>
            {allStats.length > 0 && (
              <button className="text-xs text-pitch hover:text-pitch-light" onClick={() => navigate('/estatisticas')}>
                Ver todos
              </button>
            )}
          </div>
          <TopScorers allStats={allStats} />
        </div>

        {/* Recent matches */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Últimas partidas</h2>
            {matches.length > 0 && (
              <button className="text-xs text-pitch hover:text-pitch-light" onClick={() => navigate('/partidas')}>
                Ver todas
              </button>
            )}
          </div>
          {recentMatches.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-3">Nenhuma partida registrada.</p>
              <button className="btn-secondary text-xs" onClick={() => navigate('/partidas/nova')}>
                <Calendar size={14} /> Registrar partida
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0 cursor-pointer hover:bg-slate-700/20 rounded px-1 transition-colors"
                  onClick={() => navigate(`/partidas/${m.id}`)}
                >
                  <div className="text-sm font-bold text-white w-12 text-center">
                    {m.ourScore}×{m.theirScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">vs {m.opponent}</div>
                    <div className="text-xs text-slate-400">{formatMatchResult(m)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
