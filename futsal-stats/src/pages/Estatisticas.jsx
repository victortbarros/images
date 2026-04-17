import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useStats } from '../hooks/useStats'
import { PositionBadge, QuadrosBadges } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { QUADROS, QUADRO_COLORS } from '../constants/positions'
import { getPlayerQuadros } from '../utils/playerHelpers'
import { computeAllStats } from '../utils/statsCalculator'

const COLUMNS = [
  { key: 'name', label: 'Jogador' },
  { key: 'matchesPlayed', label: 'Jogos', title: 'Partidas presentes' },
  { key: 'frequenciaPercent', label: 'Freq.', title: 'Frequência (%)' },
  { key: 'starterCount', label: 'Tit.', title: 'Vezes titular' },
  { key: 'goals', label: 'Gols' },
  { key: 'assists', label: 'Assist.' },
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
  const { players, matches } = useApp()
  const [sortKey, setSortKey] = useState('goals')
  const [sortDir, setSortDir] = useState('desc')
  const [activeTab, setActiveTab] = useState('Todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredMatches = useMemo(() => {
    if (!dateFrom && !dateTo) return matches
    return matches.filter((m) => {
      if (dateFrom && m.date < dateFrom) return false
      if (dateTo && m.date > dateTo) return false
      return true
    })
  }, [matches, dateFrom, dateTo])

  const allStats = useMemo(() => computeAllStats(filteredMatches, players), [filteredMatches, players])

  const hasDateFilter = dateFrom || dateTo
  const clearDates = () => { setDateFrom(''); setDateTo('') }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => allStats.filter(({ player }) => {
    if (activeTab === 'Todos') return true
    return getPlayerQuadros(player).includes(activeTab)
  }), [allStats, activeTab])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = sortKey === 'name' ? a.player.name : a[sortKey]
    const bv = sortKey === 'name' ? b.player.name : b[sortKey]
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  }), [filtered, sortKey, sortDir])

  const totals = useMemo(() => {
    const totalPresences = sorted.reduce((s, r) => s + r.matchesPlayed, 0)
    const totalQ = sorted.reduce((s, r) => s + r.totalQuadroMatches, 0)
    return {
      frequencia: totalQ > 0 ? `${totalPresences}/${totalQ}` : '0/0',
      frequenciaPercent: totalQ > 0 ? Math.round((totalPresences / totalQ) * 100) : 0,
      starterCount: sorted.reduce((s, r) => s + (r.starterCount ?? 0), 0),
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
        <p className="text-sm text-slate-400">Clique em um jogador para detalhes · Clique no cabeçalho para ordenar</p>
      </div>

      {/* Quadro tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          const qColor = QUADRO_COLORS[tab]
          const count = allStats.filter(({ player }) =>
            tab === 'Todos' ? true : getPlayerQuadros(player).includes(tab)
          ).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
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

      {/* Date filter */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        <span className="text-xs text-slate-500">Período:</span>
        <input type="date" className="input text-xs w-auto py-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <span className="text-xs text-slate-500">–</span>
        <input type="date" className="input text-xs w-auto py-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        {hasDateFilter && (
          <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1" onClick={clearDates}>
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {hasDateFilter && (
        <p className="text-xs text-amber-400 mb-3">
          ⚠ Estatísticas filtradas pelo período selecionado ({filteredMatches.length} de {matches.length} partidas)
        </p>
      )}

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
              <tr><td colSpan={8} className="text-center py-8 text-slate-500 text-sm">Nenhum jogador neste filtro.</td></tr>
            ) : (
              sorted.map(({ player, goals, assists, yellowCards, redCards, frequencia, frequenciaPercent, starterCount }) => (
                <tr
                  key={player.id}
                  className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/elenco/${player.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{player.name}</span>
                      <PositionBadge position={player.position} />
                      {activeTab === 'Todos' && <QuadrosBadges quadros={getPlayerQuadros(player)} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium">{frequencia}</td>
                  <td className="px-4 py-3"><FrequencyBar percent={frequenciaPercent} /></td>
                  <td className="px-4 py-3 text-amber-400 font-medium">{starterCount ?? 0}</td>
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
                <td className="px-4 py-2 text-slate-300 font-bold">{totals.frequencia}</td>
                <td className="px-4 py-2"><FrequencyBar percent={totals.frequenciaPercent} /></td>
                <td className="px-4 py-2 font-bold text-amber-400">{totals.starterCount}</td>
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
