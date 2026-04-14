import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { PositionBadge, QuadroBadge } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { QUADROS, QUADRO_COLORS } from '../constants/positions'

const COLUMNS = [
  { key: 'name', label: 'Jogador' },
  { key: 'matchesPlayed', label: 'Jogos', title: 'Partidas presentes' },
  { key: 'frequenciaPercent', label: 'Freq.', title: 'Frequência (%)' },
  { key: 'goals', label: 'Gols', title: 'Gols' },
  { key: 'assists', label: 'Assist.', title: 'Assistências' },
  { key: 'yellowCards', label: 'CA', title: 'Cartões Amarelos' },
  { key: 'redCards', label: 'CV', title: 'Cartões Vermelhos' },
]

const TABS = ['Todos', ...QUADROS]

function FrequencyBar({ percent }) {
  const color = percent >= 75 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-slate-400">{percent}%</span>
    </div>
  )
}

export function Estatisticas() {
  const navigate = useNavigate()
  const { allStats } = useStats()
  const [sortKey, setSortKey] = useState('goals')
  const [sortDir, setSortDir] = useState('desc')
  const [activeTab, setActiveTab] = useState('Todos')

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => allStats.filter(({ player }) => {
    if (activeTab === 'Todos') return true
    return (player.quadro ?? 'Quadro 1') === activeTab
  }), [allStats, activeTab])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = sortKey === 'name' ? a.player.name : a[sortKey]
    const bv = sortKey === 'name' ? b.player.name : b[sortKey]
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  }), [filtered, sortKey, sortDir])

  // Totals row — for freq: sum presences / sum totalQuadroMatches
  const totals = useMemo(() => {
    const totalPresences = sorted.reduce((s, r) => s + r.matchesPlayed, 0)
    const totalQuadroMatches = sorted.reduce((s, r) => s + r.totalQuadroMatches, 0)
    const freqPct = totalQuadroMatches > 0 ? Math.round((totalPresences / totalQuadroMatches) * 100) : 0
    return {
      matchesPlayed: totalPresences,
      totalQuadroMatches,
      frequencia: totalQuadroMatches > 0 ? `${totalPresences}/${totalQuadroMatches}` : '0/0',
      frequenciaPercent: freqPct,
      goals: sorted.reduce((s, r) => s + r.goals, 0),
      assists: sorted.reduce((s, r) => s + r.assists, 0),
      yellowCards: sorted.reduce((s, r) => s + r.yellowCards, 0),
      redCards: sorted.reduce((s, r) => s + r.redCards, 0),
    }
  }, [sorted])

  if (allStats.length === 0) {
    return <EmptyState icon="📊" title="Sem dados ainda" description="Adicione jogadores e registre partidas para ver as estatísticas." />
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Gestão da Equipe</h1>
        <p className="text-sm text-slate-400">Clique em um jogador para ver detalhes · Clique no cabeçalho para ordenar</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          const qColor = QUADRO_COLORS[tab]
          const count = allStats.filter(({ player }) => tab === 'Todos' ? true : (player.quadro ?? 'Quadro 1') === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? qColor ? `${qColor.bg} text-white border-transparent` : 'bg-pitch text-white border-transparent'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
              }`}
            >
              {tab} <span className="ml-1 text-xs opacity-75">({count})</span>
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
                    {sortKey === col.key ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-500 text-sm">Nenhum jogador neste quadro.</td></tr>
            ) : (
              sorted.map(({ player, goals, assists, yellowCards, redCards, matchesPlayed, frequencia, frequenciaPercent }) => (
                <tr
                  key={player.id}
                  className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/elenco/${player.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{player.name}</span>
                      <PositionBadge position={player.position} />
                      {activeTab === 'Todos' && <QuadroBadge quadro={player.quadro ?? 'Quadro 1'} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium">{frequencia}</td>
                  <td className="px-4 py-3"><FrequencyBar percent={frequenciaPercent} /></td>
                  <td className="px-4 py-3 font-semibold text-green-400">{goals}</td>
                  <td className="px-4 py-3 text-slate-300">{assists}</td>
                  <td className="px-4 py-3 text-yellow-400">{yellowCards}</td>
                  <td className="px-4 py-3 text-red-400">{redCards}</td>
                </tr>
              ))
            )}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-600 bg-slate-700/30">
                <td className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wide">Total</td>
                <td className="px-4 py-2 text-slate-300 font-bold text-sm">{totals.frequencia}</td>
                <td className="px-4 py-2"><FrequencyBar percent={totals.frequenciaPercent} /></td>
                <td className="px-4 py-2 font-bold text-green-400">{totals.goals}</td>
                <td className="px-4 py-2 font-bold text-slate-300">{totals.assists}</td>
                <td className="px-4 py-2 font-bold text-yellow-400">{totals.yellowCards}</td>
                <td className="px-4 py-2 font-bold text-red-400">{totals.redCards}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
