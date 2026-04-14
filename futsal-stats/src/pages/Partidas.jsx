import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return [...matches]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((m) => {
        if (quadroFilter !== 'Todos' && (m.quadro ?? 'Quadro 1') !== quadroFilter) return false
        if (search && !m.opponent.toLowerCase().includes(search.toLowerCase())) return false
        if (dateFrom && m.date < dateFrom) return false
        if (dateTo && m.date > dateTo) return false
        return true
      })
  }, [matches, search, quadroFilter, dateFrom, dateTo])

  const hasFilters = search || dateFrom || dateTo || quadroFilter !== 'Todos'

  const clearFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setQuadroFilter('Todos')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Partidas</h1>
          <p className="text-sm text-slate-400">
            {filtered.length} de {matches.length} partida{matches.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/partidas/nova')}>
          <Plus size={16} /> Nova partida
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-4 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8 text-xs"
              placeholder="Buscar adversário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasFilters && (
            <button className="btn-secondary text-xs py-1.5 px-3 shrink-0" onClick={clearFilters}>
              <X size={13} /> Limpar
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
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
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-slate-500">De</span>
            <input type="date" className="input text-xs w-auto py-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="text-xs text-slate-500">até</span>
            <input type="date" className="input text-xs w-auto py-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nenhuma partida registrada"
          description="Registre a primeira partida do time para começar a acompanhar os resultados."
          action={<button className="btn-primary" onClick={() => navigate('/partidas/nova')}><Plus size={16} /> Registrar partida</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhuma partida encontrada" description="Tente outros filtros." action={
          <button className="btn-secondary" onClick={clearFilters}><X size={14} /> Limpar filtros</button>
        } />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  )
}
