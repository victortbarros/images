import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { PlayerCard } from '../components/elenco/PlayerCard'
import { PlayerForm } from '../components/elenco/PlayerForm'

export function Elenco() {
  const { players, removePlayer } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editPlayer, setEditPlayer] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const filtered = players.filter((p) => {
    if (!showInactive && !p.active) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activePlayers = players.filter((p) => p.active)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Elenco</h1>
          <p className="text-sm text-slate-400">{activePlayers.length} jogador{activePlayers.length !== 1 ? 'es' : ''} ativo{activePlayers.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditPlayer(null); setShowForm(true) }}>
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Buscar jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded"
          />
          Inativos
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={players.length === 0 ? 'Nenhum jogador cadastrado' : 'Nenhum resultado encontrado'}
          description={players.length === 0 ? 'Adicione jogadores ao elenco para começar a registrar estatísticas.' : undefined}
          action={
            players.length === 0 ? (
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Adicionar primeiro jogador
              </button>
            ) : undefined
          }
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
        <Modal
          title={editPlayer ? 'Editar Jogador' : 'Novo Jogador'}
          onClose={() => { setShowForm(false); setEditPlayer(null) }}
        >
          <PlayerForm
            player={editPlayer}
            onClose={() => { setShowForm(false); setEditPlayer(null) }}
          />
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
