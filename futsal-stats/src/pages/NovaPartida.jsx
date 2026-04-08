import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Plus, Trash2, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { createEvent } from '../models/schema'
import { VENUE_OPTIONS, EVENT_TYPES } from '../constants/positions'

const COMPETITION_SUGGESTIONS = ['Amistoso', 'Liga Municipal', 'Copa', 'Torneio', 'Campeonato']

function Step1({ form, setForm, onNext }) {
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const valid = form.opponent.trim() && form.date

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Adversário *</label>
        <input className="input" value={form.opponent} onChange={set('opponent')} placeholder="Nome do adversário" maxLength={60} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Data *</label>
          <input className="input" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">Local</label>
          <select className="input" value={form.venue} onChange={set('venue')}>
            {VENUE_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Competição</label>
        <input className="input" value={form.competition} onChange={set('competition')} list="competitions" placeholder="Ex: Liga Municipal" />
        <datalist id="competitions">
          {COMPETITION_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nosso placar *</label>
          <input className="input" type="number" min={0} value={form.ourScore} onChange={set('ourScore')} />
        </div>
        <div>
          <label className="label">Placar adversário *</label>
          <input className="input" type="number" min={0} value={form.theirScore} onChange={set('theirScore')} />
        </div>
      </div>
      <div>
        <label className="label">Observações</label>
        <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Notas sobre a partida..." />
      </div>
      <div className="flex justify-end pt-2">
        <button className="btn-primary" onClick={onNext} disabled={!valid}>
          Próximo: Eventos <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function Step2({ events, setEvents, players, onBack, onSave }) {
  const [type, setType] = useState('goal')
  const [playerId, setPlayerId] = useState(players[0]?.id ?? '')
  const [minute, setMinute] = useState('')
  const [value, setValue] = useState('1')

  const activePlayers = players.filter((p) => p.active)

  const addEvent = () => {
    if (!playerId) return
    const ev = createEvent({
      type,
      playerId,
      minute: minute !== '' ? Number(minute) : null,
      value: type === 'minutes' ? Number(value) : 1,
    })
    setEvents((prev) => [...prev, ev])
    setMinute('')
    setValue('1')
  }

  const removeEvent = (id) => setEvents((prev) => prev.filter((e) => e.id !== id))

  const getPlayerName = (id) => players.find((p) => p.id === id)?.name ?? '?'
  const getEventLabel = (t) => EVENT_TYPES.find((e) => e.value === t)?.label ?? t
  const getEventIcon = (t) => EVENT_TYPES.find((e) => e.value === t)?.icon ?? ''

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Registre os eventos desta partida (opcional). Você pode adicionar depois.</p>

      {activePlayers.length === 0 ? (
        <p className="text-sm text-amber-400 bg-amber-900/30 rounded-lg p-3">
          Nenhum jogador ativo no elenco. Adicione jogadores para registrar eventos.
        </p>
      ) : (
        <div className="card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo de evento</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Jogador</label>
              <select className="input" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
                {activePlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <button className="btn-secondary w-full justify-center" onClick={addEvent} disabled={!playerId}>
            <Plus size={16} /> Adicionar evento
          </button>
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-medium">Eventos registrados ({events.length})</p>
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
              <span>{getEventIcon(ev.type)}</span>
              <span className="text-slate-300">{getEventLabel(ev.type)}</span>
              <span className="text-white font-medium flex-1">{getPlayerName(ev.playerId)}</span>
              {ev.minute && <span className="text-slate-400 text-xs">{ev.minute}'</span>}
              {ev.type === 'minutes' && <span className="text-slate-400 text-xs">{ev.value} min</span>}
              <button onClick={() => removeEvent(ev.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-between pt-2">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <button className="btn-primary" onClick={onSave}>
          <Check size={16} /> Salvar partida
        </button>
      </div>
    </div>
  )
}

export function NovaPartida() {
  const navigate = useNavigate()
  const { players, addMatch, addEventsToMatch } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    opponent: '',
    date: new Date().toISOString().slice(0, 10),
    venue: 'home',
    competition: '',
    ourScore: '0',
    theirScore: '0',
    notes: '',
  })
  const [events, setEvents] = useState([])

  const handleSave = () => {
    const id = addMatch(form)
    if (events.length > 0) {
      addEventsToMatch(id, events)
    }
    navigate(`/partidas/${id}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button className="text-slate-400 hover:text-white transition-colors" onClick={() => navigate('/partidas')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Nova Partida</h1>
          <p className="text-sm text-slate-400">Passo {step} de 2</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-pitch' : 'bg-slate-700'}`} />
        ))}
      </div>

      <div className="card p-5">
        {step === 1 ? (
          <Step1 form={form} setForm={setForm} onNext={() => setStep(2)} />
        ) : (
          <Step2 events={events} setEvents={setEvents} players={players} onBack={() => setStep(1)} onSave={handleSave} />
        )}
      </div>
    </div>
  )
}
