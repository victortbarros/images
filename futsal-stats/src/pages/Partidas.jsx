import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { EmptyState } from '../components/common/EmptyState'
import { MatchCard } from '../components/partidas/MatchCard'

export function Partidas() {
  const navigate = useNavigate()
  const { matches } = useApp()

  const sorted = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Partidas</h1>
          <p className="text-sm text-slate-400">{matches.length} partida{matches.length !== 1 ? 's' : ''} registrada{matches.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/partidas/nova')}>
          <Plus size={16} /> Nova partida
        </button>
      </div>

      {sorted.length === 0 ? (
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
      ) : (
        <div className="space-y-2">
          {sorted.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  )
}
