import { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useStats } from '../hooks/useStats'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { PlayerCard } from '../components/elenco/PlayerCard'
import { PlayerForm } from '../components/elenco/PlayerForm'
import { POSITIONS, QUADROS } from '../constants/positions'
import { getPlayerQuadros } from '../utils/playerHelpers'

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'number', label: 'Número' },
  { value: 'goals', label: 'Gols' },
  { value: 'assists', label: 'Assistências' },
  { value: 'matchesPlayed', label: 'Partidas' },
]

const ALL_QUADROS = ['Todos', ...QUADROS]

export function Elenco() {
  const { players, removePlayer } = useApp()
  const { allStats } = useStats()
  const [showForm, setShowForm] = useState(false)
  const [editPlayer, setEditPlayer] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('Todas')
  const [quadroFilter, setQuadroFilter] = useState('Todos')
  const [sortBy, setSortBy] = useState('name')
  const [showInactive, setShowInactive] = useState(false)

  const statsMap = useMemo(() => {
    const map = {}
    allStats.forEach((s) => { map[s.player.id] = s })
    return map
  }, [allStats])

  const filtered = useMemo(() => {
    return players
      .filter((p) => {
        if (!showInactive && !p.active) return false
        if (posFilter !== 'Todas' && p.position !== posFilter) return false
        if (quadroFilter !== 'Todos' && !getPlayerQuadros(p).includes(quadroFilter)) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'number') return a.number - b.number
        const sa = statsMap[a.id] ?? {}
        const sb = statsMap[b.id] ?? {}
        return (sb[sortBy] ?? 0) - (sa[sortBy] ?? 0)
      })
  }, [players, search, posFilter, quadroFilter, sortBy, showInactive, statsMap])

  const totals = useMemo(() => filtered.reduce((acc, p) => {
    const s = statsMap[p.id] ?? {}
    return { goals: acc.goals + (s.goals ?? 0), assists: acc.assists + (s.assists ?? 0), matchesPlayed: acc.matchesPlayed + (s.matchesPlayed ?? 0) }
  }, { goals: 0, assists: 0, matchesPlayed: 0 }), [filtered, statsMap])

  const activePlayers = players.filter((p) => p.active)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Elenco</h1>
          <p className="text-sm text-slate-400">{activePlayers.length} jogador{activePlayers.length !== 1 ? 'es' : ''} ativo{activePlayers.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditPlayer(null); setShowForm(true) }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-4 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-8 text-xs" placeholder="Buscar jogador..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input text-xs w-auto" value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
            <option value="Todas">Todas posições</option>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input text-xs w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>↕ {o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {ALL_QUADROS.map((q) => (
              <button
                key={q}
                onClick={() => setQuadroFilter(q)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  quadroFilter === q
                    ? 'bg-pitch text-white border-transparent'
                    : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none ml-auto">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="rounded" />
            Inativos
          </label>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex gap-3 text-xs text-slate-400 mb-3 px-1">
          <span>⚽ {totals.goals} gols</span>
          <span>🎯 {totals.assists} assist.</span>
          <span>📋 {totals.matchesPlayed} presenças</span>
          <span className="text-slate-500">({filtered.length} jogador{filtered.length !== 1 ? 'es' : ''})</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={players.length === 0 ? 'Nenhum jogador cadastrado' : 'Nenhum resultado encontrado'}
          description={players.length === 0 ? 'Adicione jogadores ao elenco para começar a registrar estatísticas.' : undefined}
          action={players.length === 0 ? (
            <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Adicionar primeiro jogador</button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              onEdit={(e) => { e?.stopPropagation?.(); setEditPlayer(p); setShowForm(true) }}
              onRemove={(e) => { e?.stopPropagation?.(); setRemoveTarget(p) }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editPlayer ? 'Editar Jogador' : 'Novo Jogador'} onClose={() => { setShowForm(false); setEditPlayer(null) }}>
          <PlayerForm player={editPlayer} onClose={() => { setShowForm(false); setEditPlayer(null) }} />
        </Modal>
      )}

      {removeTarget && (
        <ConfirmDialog
          title="Desativar jogador"
          message={`Deseja desativar ${removeTarget.name}? O histórico de partidas será preservado.`}
          onConfirm={() => { removePlayer(removeTarget.id); setRemoveTarget(null) }}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  )
}
