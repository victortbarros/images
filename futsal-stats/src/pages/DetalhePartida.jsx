import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, UserCheck, Star, Lock, Send, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { VenueBadge, QuadroBadge } from '../components/common/Badge'
import { formatDate, formatMatchResult, resultColor } from '../utils/formatters'
import { EVENT_TYPES, QUADRO_COLORS } from '../constants/positions'
import { getPlayerQuadros } from '../utils/playerHelpers'

// ── Presence Section ──────────────────────────────────────────────────────────
function PresenceSection({ match, players, togglePresence, readOnly }) {
  const quadro = match.quadro ?? 'Quadro 1'
  const qColor = QUADRO_COLORS[quadro]
  const quadroPlayers = players.filter((p) => p.active && getPlayerQuadros(p).includes(quadro))
  const presences = match.presences ?? []
  if (quadroPlayers.length === 0) return null

  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-white">Presença</h2>
        <span className={`text-xs px-2 py-0.5 rounded font-bold ${qColor?.bg ?? 'bg-slate-600'} text-white`}>
          {presences.length}/{quadroPlayers.length}
        </span>
        {readOnly && <Lock size={12} className="text-slate-500 ml-auto" />}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {quadroPlayers.map((p) => {
          const checked = presences.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && togglePresence(match.id, p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                checked
                  ? `${qColor?.bg ?? 'bg-pitch'} text-white border-transparent`
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              } ${readOnly ? 'opacity-75 cursor-default' : 'hover:text-white'}`}
            >
              <span className="font-bold w-5 text-center text-xs">#{p.number}</span>
              <span className="truncate">{p.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Starters Section ──────────────────────────────────────────────────────────
function StartersSection({ match, players, toggleStarter, readOnly }) {
  const quadro = match.quadro ?? 'Quadro 1'
  const qColor = QUADRO_COLORS[quadro]
  const presences = match.presences ?? []
  const starters = match.starters ?? []
  const presentPlayers = players.filter((p) => p.active && presences.includes(p.id))

  if (presentPlayers.length === 0) {
    return (
      <div className="card p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Star size={16} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Escalação — Titulares</h2>
        </div>
        <p className="text-xs text-slate-500">Marque a presença dos atletas primeiro.</p>
      </div>
    )
  }

  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-white">Escalação — Titulares</h2>
        <span className={`text-xs px-2 py-0.5 rounded font-bold ${starters.length === 5 ? 'bg-amber-600' : 'bg-slate-600'} text-white`}>
          {starters.length}/5
        </span>
        {readOnly && <Lock size={12} className="text-slate-500 ml-auto" />}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {presentPlayers.map((p) => {
          const isStarter = starters.includes(p.id)
          const maxReached = starters.length >= 5 && !isStarter
          return (
            <button
              key={p.id}
              type="button"
              disabled={readOnly || maxReached}
              onClick={() => !readOnly && !maxReached && toggleStarter(match.id, p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                isStarter
                  ? 'bg-amber-700 text-white border-transparent'
                  : maxReached
                  ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              } ${!readOnly && !maxReached ? 'hover:text-white' : ''} ${readOnly ? 'cursor-default' : ''}`}
            >
              <Star size={12} className={isStarter ? 'text-amber-300' : 'text-slate-600'} />
              <span className="font-bold w-5 text-center text-xs">#{p.number}</span>
              <span className="truncate">{p.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── MVP Section ───────────────────────────────────────────────────────────────
function MvpSection({ match, players, setMvp, readOnly }) {
  const presences = match.presences ?? []
  const presentPlayers = players.filter((p) => p.active && presences.includes(p.id))
  const mvpId = match.mvpPlayerId ?? null

  if (presentPlayers.length === 0) return null

  const handleSelect = (pid) => {
    if (readOnly) return
    setMvp(match.id, mvpId === pid ? null : pid)
  }

  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={16} className="text-yellow-400" />
        <h2 className="text-sm font-semibold text-white">Destaque da Partida</h2>
        {readOnly && <Lock size={12} className="text-slate-500 ml-auto" />}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {presentPlayers.map((p) => {
          const isMvp = mvpId === p.id
          return (
            <button
              key={p.id}
              type="button"
              disabled={readOnly}
              onClick={() => handleSelect(p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                isMvp
                  ? 'bg-yellow-600 text-white border-transparent'
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              } ${readOnly ? 'opacity-75 cursor-default' : 'hover:text-white'}`}
            >
              <Trophy size={12} className={isMvp ? 'text-yellow-200' : 'text-slate-600'} />
              <span className="font-bold w-5 text-center text-xs">#{p.number}</span>
              <span className="truncate">{p.name}</span>
            </button>
          )
        })}
      </div>
      {mvpId && (
        <p className="text-xs text-yellow-400 mt-2">
          🏆 {players.find((p) => p.id === mvpId)?.name} — Destaque da partida
        </p>
      )}
    </div>
  )
}

// ── Add Event Form ─────────────────────────────────────────────────────────────
function AddEventForm({ match, players, onClose }) {
  const { addEvent } = useApp()
  const [type, setType] = useState('goal')
  const [playerId, setPlayerId] = useState('')
  const [minute, setMinute] = useState('')
  const [value, setValue] = useState('1')

  const quadro = match.quadro ?? 'Quadro 1'
  const presences = match.presences ?? []
  const eligiblePlayers = players.filter(
    (p) => p.active && getPlayerQuadros(p).includes(quadro) && (presences.length === 0 || presences.includes(p.id))
  )

  const handleAdd = async () => {
    if (!playerId) return
    await addEvent(match.id, {
      type, playerId,
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
            <option value="">Selecionar...</option>
            {eligiblePlayers.map((p) => <option key={p.id} value={p.id}>#{p.number} {p.name}</option>)}
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

// ── Main Component ─────────────────────────────────────────────────────────────
export function DetalhePartida() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { matches, players, removeEvent, deleteMatch, togglePresence, toggleStarter, updateMatch, publishMatch, setMvp } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [editingScore, setEditingScore] = useState(false)
  const [theirScore, setTheirScore] = useState('')

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

  const isDraft = match.status === 'draft'
  const getPlayer = (pid) => players.find((p) => p.id === pid)
  const getPlayerName = (pid) => getPlayer(pid)?.name ?? 'Jogador desconhecido'
  const getEventLabel = (t) => EVENT_TYPES.find((e) => e.value === t)?.label ?? t
  const getEventIcon = (t) => EVENT_TYPES.find((e) => e.value === t)?.icon ?? ''
  const sortedEvents = [...match.events].sort((a, b) => (a.minute ?? 99) - (b.minute ?? 99))

  const handleSaveScore = async () => {
    const val = Number(theirScore)
    if (!isNaN(val) && val >= 0) {
      await updateMatch(id, { theirScore: val })
    }
    setEditingScore(false)
  }

  const handlePublish = async () => {
    await publishMatch(id)
    setConfirmPublish(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white transition-colors" onClick={() => navigate('/partidas')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">vs {match.opponent}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-400">{formatDate(match.date)}</span>
              <VenueBadge venue={match.venue} />
              <QuadroBadge quadro={match.quadro ?? 'Quadro 1'} />
              {match.competition && <span className="text-xs text-slate-500">{match.competition}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDraft ? (
            <span className="text-xs bg-amber-900/50 text-amber-400 border border-amber-700 px-2 py-1 rounded-full font-medium">
              Rascunho
            </span>
          ) : (
            <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Lock size={10} /> Publicada
            </span>
          )}
          {isDraft && (
            <button
              className="text-slate-500 hover:text-red-400 transition-colors p-2"
              onClick={() => setConfirmDelete(true)}
              title="Excluir partida"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="card p-5 text-center mb-3">
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Placar</div>
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="text-center">
            <div className="text-5xl font-bold text-white">{match.ourScore}</div>
            <div className="text-xs text-slate-400 mt-1">Nosso time</div>
            <div className="text-xs text-green-500 mt-0.5">⚽ calculado pelos gols</div>
          </div>
          <div className="text-slate-500 text-3xl font-light">×</div>
          <div className="text-center">
            {editingScore ? (
              <div className="flex flex-col items-center gap-2">
                <input
                  className="input w-20 text-center text-3xl font-bold py-1"
                  type="number"
                  min={0}
                  value={theirScore}
                  onChange={(e) => setTheirScore(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveScore(); if (e.key === 'Escape') setEditingScore(false) }}
                />
                <div className="flex gap-1">
                  <button className="btn-primary text-xs py-1 px-2" onClick={handleSaveScore}>OK</button>
                  <button className="btn-secondary text-xs py-1 px-2" onClick={() => setEditingScore(false)}>✕</button>
                </div>
              </div>
            ) : (
              <div
                className={`text-5xl font-bold text-white ${isDraft ? 'cursor-pointer hover:text-amber-400 transition-colors' : ''}`}
                onClick={() => { if (isDraft) { setTheirScore(String(match.theirScore)); setEditingScore(true) } }}
                title={isDraft ? 'Clique para editar gols sofridos' : ''}
              >
                {match.theirScore}
              </div>
            )}
            <div className="text-xs text-slate-400 mt-1">{match.opponent}</div>
            {isDraft && !editingScore && <div className="text-xs text-amber-500 mt-0.5">toque para editar</div>}
          </div>
        </div>
        {!isDraft && (
          <div className={`text-base font-semibold ${resultColor(match)}`}>
            {formatMatchResult(match)}
          </div>
        )}
      </div>

      {/* Presence */}
      <PresenceSection match={match} players={players} togglePresence={togglePresence} readOnly={!isDraft} />

      {/* Starters */}
      <StartersSection match={match} players={players} toggleStarter={toggleStarter} readOnly={!isDraft} />

      {/* MVP */}
      <MvpSection match={match} players={players} setMvp={setMvp} readOnly={!isDraft} />

      {/* Events */}
      <div className="card p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Eventos da partida</h2>
          {isDraft && (
            <button className="btn-secondary text-xs py-1 px-3" onClick={() => setShowAddEvent(!showAddEvent)}>
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>

        {isDraft && showAddEvent && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
            <AddEventForm match={match} players={players} onClose={() => setShowAddEvent(false)} />
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
                <button
                  className="text-white font-medium flex-1 text-left hover:text-green-400 transition-colors"
                  onClick={() => { const p = getPlayer(ev.playerId); if (p) navigate(`/elenco/${p.id}`) }}
                >
                  {getPlayerName(ev.playerId)}
                </button>
                {ev.minute && <span className="text-slate-500 text-xs">{ev.minute}'</span>}
                {ev.type === 'minutes' && <span className="text-slate-500 text-xs">{ev.value} min</span>}
                {isDraft && (
                  <button
                    className="text-slate-600 hover:text-red-400 transition-colors ml-1"
                    onClick={() => removeEvent(match.id, ev.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {match.notes && (
        <div className="card p-4 mb-3">
          <p className="text-xs text-slate-400 font-medium mb-1">Observações</p>
          <p className="text-sm text-slate-300">{match.notes}</p>
        </div>
      )}

      {/* Publish button */}
      {isDraft && (
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold transition-colors"
          onClick={() => setConfirmPublish(true)}
        >
          <Send size={18} /> Publicar partida
        </button>
      )}

      {confirmPublish && (
        <ConfirmDialog
          title="Publicar partida"
          message="Ao publicar, a partida não poderá mais ser editada. Confirmar?"
          onConfirm={handlePublish}
          onCancel={() => setConfirmPublish(false)}
        />
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
