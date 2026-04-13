import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { useApp } from '../context/AppContext'
import { PositionBadge, QuadroBadge } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { QUADROS, QUADRO_COLORS } from '../constants/positions'

const COLUMNS = [
  { key: 'name', label: 'Jogador', numeric: false },
  { key: 'matchesPlayed', label: 'J', title: 'Partidas' },
  { key: 'goals', label: 'G', title: 'Gols' },
  { key: 'assists', label: 'A', title: 'Assistências' },
  { key: 'yellowCards', label: 'CA', title: 'Cartões Amarelos' },
  { key: 'redCards', label: 'CV', title: 'Cartões Vermelhos' },
  { key: 'minutesPlayed', label: 'Min', title: 'Minutos' },
]

const TABS = ['Todos', ...QUADROS]

export function Estatisticas() {
  const navigate = useNavigate()
  const { players } = useApp()
  const { allStats } = useStats()
  const [sortKey, setSortKey] = useState('goals')
  const [sortDir, setSortDir] = useState('desc')
  const [activeTab, setActiveTab] = useState('Todos')

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = allStats.filter(({ player }) => {
    if (activeTab === 'Todos') return true
    return (player.quadro ?? 'Quadro 1') === activeTab
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = sortKey === 'name' ? a.player.name : a[sortKey]
    const bv = sortKey === 'name' ? b.player.name : b[sortKey]
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  if (allStats.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="Sem dados ainda"
        description="Adicione jogadores e registre partidas para ver as estatísticas."
      />
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Estatísticas</h1>
        <p className="text-sm text-slate-400">Clique em um jogador para ver detalhes · Clique no cabeçalho para ordenar</p>
      </div>

      {/* Quadro tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          const qColor = QUADRO_COLORS[tab]
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? qColor
                    ? `${qColor.bg} text-white border-transparent`
                    : 'bg-pitch text-white border-transparent'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-75">
                ({allStats.filter(({ player }) =>
                  tab === 'Todos' ? true : (player.quadro ?? 'Quadro 1') === tab
                ).length})
              </span>
            </button>
          )
        })}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-400 cursor-pointer hover:text-white select-none whitespace-nowrap"
                  title={col.title}
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500 text-sm">
                  Nenhum jogador neste quadro.
                </td>
              </tr>
            ) : (
              sorted.map(({ player, goals, assists, yellowCards, redCards, minutesPlayed, matchesPlayed }) => (
                <tr
                  key={player.id}
                  className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/elenco/${player.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{player.name}</span>
                      <PositionBadge position={player.position} />
                      {activeTab === 'Todos' && (
                        <QuadroBadge quadro={player.quadro ?? 'Quadro 1'} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{matchesPlayed}</td>
                  <td className="px-4 py-3 font-semibold text-green-400">{goals}</td>
                  <td className="px-4 py-3 text-slate-300">{assists}</td>
                  <td className="px-4 py-3 text-yellow-400">{yellowCards}</td>
                  <td className="px-4 py-3 text-red-400">{redCards}</td>
                  <td className="px-4 py-3 text-slate-400">{minutesPlayed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
