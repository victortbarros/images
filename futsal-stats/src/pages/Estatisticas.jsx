import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { PositionBadge } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'

const COLUMNS = [
  { key: 'name', label: 'Jogador', numeric: false },
  { key: 'matchesPlayed', label: 'J', title: 'Partidas' },
  { key: 'goals', label: 'G', title: 'Gols' },
  { key: 'assists', label: 'A', title: 'Assistências' },
  { key: 'yellowCards', label: 'CA', title: 'Cartões Amarelos' },
  { key: 'redCards', label: 'CV', title: 'Cartões Vermelhos' },
  { key: 'minutesPlayed', label: 'Min', title: 'Minutos' },
]

export function Estatisticas() {
  const navigate = useNavigate()
  const { allStats } = useStats()
  const [sortKey, setSortKey] = useState('goals')
  const [sortDir, setSortDir] = useState('desc')

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...allStats].sort((a, b) => {
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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Estatísticas</h1>
        <p className="text-sm text-slate-400">Clique em um jogador para ver detalhes</p>
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
            {sorted.map(({ player, goals, assists, yellowCards, redCards, minutesPlayed, matchesPlayed }) => (
              <tr
                key={player.id}
                className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/elenco/${player.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{player.name}</span>
                    <PositionBadge position={player.position} />
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{matchesPlayed}</td>
                <td className="px-4 py-3 font-semibold text-green-400">{goals}</td>
                <td className="px-4 py-3 text-slate-300">{assists}</td>
                <td className="px-4 py-3 text-yellow-400">{yellowCards}</td>
                <td className="px-4 py-3 text-red-400">{redCards}</td>
                <td className="px-4 py-3 text-slate-400">{minutesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
