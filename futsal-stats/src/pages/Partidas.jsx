import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { EmptyState } from '../components/common/EmptyState'
import { MatchCard } from '../components/partidas/MatchCard'
import { QUADROS } from '../constants/positions'

const ALL_QUADROS = ['Todos', ...QUADROS]

export function Partidas() {
  const navigate = useNavigate()
  const { matches } = useApp()
  const [search, setSearch] = useState('')
  const [quadroFilter, setQuadroFilter] = useState('Todos')

  const filtered = [...matches]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((m) => {
      if (quadroFilter !== 'Todos' && (m.quadro ?? 'Quadro 1') !== quadroFilter) return false
      if (search && !m.opponent.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Partidas</h1>
          <p className="text-sm text-slate-400">{matches.length} partida{matches.length !== 1 ? 's' : ''} registrada{matches.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/partidas/nova')}>
          <Plus size={16} /> Nova partida
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-8 text-xs"
            placeholder="Buscar adversário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {ALL_QUADROS.map((q) => (
            <button
              key={q}
              onClick={() => setQuadroFilter(q)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                quadroFilter === q
                  ? 'bg-pitch text-white border-transparent'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nenhuma partida registrada"
          description="Registre a primeira partida do time para começar a acompanhar os resultados."
          action={
            <button className="btn-primary" onClick={() => navigate('/partidas/nova')}>
              <Plus size={16} /> Registrar partida
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhuma partida encontrada" description="Tente outros filtros." />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  )
}
