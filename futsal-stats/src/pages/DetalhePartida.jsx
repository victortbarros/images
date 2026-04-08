import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { VenueBadge } from '../components/common/Badge'
import { formatDate, formatMatchResult, resultColor } from '../utils/formatters'
import { EVENT_TYPES } from '../constants/positions'
import { createEvent } from '../models/schema'

function AddEventForm({ matchId, players, onClose }) {
  const { addEvent } = useApp()
  const [type, setType] = useState('goal')
  const [playerId, setPlayerId] = useState(players[0]?.id ?? '')
  const [minute, setMinute] = useState('')
  const [value, setValue] = useState('1')

  const active = players.filter((p) => p.active)

  const handleAdd = () => {
    if (!playerId) return
    addEvent(matchId, {
      type,
      playerId,
      minute: minute !== '' ? Number(minute) : null,
      value: type === 'minutes' ? Number(value) : 1,
    })
    onClose()
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Jogador</label>
          <select className="input" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            {active.map((p) => <option key={p.id} value={p.id}>#{p.number} {p.name}</option>)}
          </select>
        </div>
      </div>
      {type !== 'minutes' ? (
        <div>
          <label className="label">Minuto (opcional)</label>
          <input className="input" type="number" min={1} max={40} value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="Ex: 12" />
        </div>
      ) : (
        <div>
          <label className="label">Minutos jogados</label>
          <input className="input" type="number" min={0} max={40} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" onClick={handleAdd} disabled={!playerId}>Adicionar</button>
      </div>
    </div>
  )
}

export function DetalhePartida() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matches, players, removeEvent, deleteMatch } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)

  const match = matches.find((m) => m.id === id)

  if (!match) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Partida não encontrada.</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/partidas')}>
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
    )
  }

  const getPlayerName = (pid) => players.find((p) => p.id === pid)?.name ?? 'Jogador desconhecido'
  const getEventLabel = (t) => EVENT_TYPES.find((e) => e.value === t)?.label ?? t
  const getEventIcon = (t) => EVENT_TYPES.find((e) => e.value === t)?.icon ?? ''

  const sortedEvents = [...match.events].sort((a, b) => (a.minute ?? 99) - (b.minute ?? 99))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white transition-colors" onClick={() => navigate('/partidas')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">vs {match.opponent}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">{formatDate(match.date)}</span>
              <VenueBadge venue={match.venue} />
              {match.competition && <span className="text-xs text-slate-500">{match.competition}</span>}
            </div>
          </div>
        </div>
        <button
          className="text-slate-500 hover:text-red-400 transition-colors p-2"
          onClick={() => setConfirmDelete(true)}
          title="Excluir partida"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Scoreboard */}
      <div className="card p-6 text-center mb-4">
        <div className="text-6xl font-bold text-white mb-2">
          {match.ourScore} <span className="text-slate-500 text-4xl">×</span> {match.theirScore}
        </div>
        <div className={`text-lg font-semibold ${resultColor(match)}`}>
          {formatMatchResult(match)}
        </div>
        <div className="text-sm text-slate-400 mt-1">Nosso time · {match.opponent}</div>
      </div>

      {/* Events */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Eventos da partida</h2>
          <button className="btn-secondary text-xs py-1 px-3" onClick={() => setShowAddEvent(!showAddEvent)}>
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {showAddEvent && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
            <AddEventForm matchId={match.id} players={players} onClose={() => setShowAddEvent(false)} />
          </div>
        )}

        {sortedEvents.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhum evento registrado.</p>
        ) : (
          <div className="space-y-1">
            {sortedEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 py-2 border-b border-slate-700 last:border-0 text-sm">
                <span className="text-base">{getEventIcon(ev.type)}</span>
                <span className="text-slate-400 text-xs w-16">{getEventLabel(ev.type)}</span>
                <span className="text-white font-medium flex-1">{getPlayerName(ev.playerId)}</span>
                {ev.minute && <span className="text-slate-500 text-xs">{ev.minute}'</span>}
                {ev.type === 'minutes' && <span className="text-slate-500 text-xs">{ev.value} min</span>}
                <button
                  className="text-slate-600 hover:text-red-400 transition-colors ml-1"
                  onClick={() => removeEvent(match.id, ev.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {match.notes && (
        <div className="card p-4 mt-3">
          <p className="text-xs text-slate-400 font-medium mb-1">Observações</p>
          <p className="text-sm text-slate-300">{match.notes}</p>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir partida"
          message={`Deseja excluir a partida contra ${match.opponent}? Esta ação não pode ser desfeita.`}
          onConfirm={() => { deleteMatch(id); navigate('/partidas') }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
