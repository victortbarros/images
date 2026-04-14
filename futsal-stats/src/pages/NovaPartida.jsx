import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, UserCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { createEvent } from '../models/schema'
import { VENUE_OPTIONS, EVENT_TYPES, QUADROS, QUADRO_COLORS } from '../constants/positions'

const COMPETITION_OPTIONS = ['Liga JR', 'Festival', 'Amistoso', 'Copa', 'Torneio', 'Campeonato']

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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Quadro *</label>
          <select className="input" value={form.quadro} onChange={set('quadro')}>
            {QUADROS.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Competição</label>
          <select className="input" value={form.competition} onChange={set('competition')}>
            <option value="">Selecionar...</option>
            {COMPETITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
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
          Próximo: Presença e Eventos <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function Step2({ form, events, setEvents, presences, setPresences, players, onBack, onSave }) {
  const [type, setType] = useState('goal')
  const [playerId, setPlayerId] = useState('')
  const [minute, setMinute] = useState('')
  const [value, setValue] = useState('1')

  const quadroPlayers = players.filter((p) => p.active && (p.quadro ?? 'Quadro 1') === form.quadro)
  const qColor = QUADRO_COLORS[form.quadro]

  const togglePresence = (id) => {
    setPresences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
    // auto-set player in event form when checked
    if (!presences.includes(id)) setPlayerId(id)
  }

  const selectAll = () => setPresences(quadroPlayers.map((p) => p.id))
  const clearAll = () => setPresences([])

  const presentPlayers = quadroPlayers.filter((p) => presences.includes(p.id))

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
    <div className="space-y-5">
      {/* Presence section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-slate-400" />
            <span className="text-sm font-semibold text-white">Presença — {form.quadro}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${qColor?.bg ?? 'bg-slate-600'} text-white`}>
              {presences.length}/{quadroPlayers.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="text-xs text-slate-400 hover:text-white" onClick={selectAll}>Todos</button>
            <span className="text-slate-600">·</span>
            <button className="text-xs text-slate-400 hover:text-white" onClick={clearAll}>Nenhum</button>
          </div>
        </div>

        {quadroPlayers.length === 0 ? (
          <p className="text-sm text-amber-400 bg-amber-900/30 rounded-lg p-3">
            Nenhum jogador do {form.quadro} cadastrado.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {quadroPlayers.map((p) => {
              const checked = presences.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePresence(p.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                    checked
                      ? `${qColor?.bg ?? 'bg-pitch'} text-white border-transparent`
                      : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'
                  }`}
                >
                  <span className="font-bold w-5 text-center text-xs">#{p.number}</span>
                  <span className="truncate">{p.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-700" />

      {/* Events section */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">Eventos (opcional)</p>

        {presences.length === 0 ? (
          <p className="text-xs text-slate-500 mb-3">Marque os jogadores presentes para registrar eventos.</p>
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
                  <option value="">Selecionar...</option>
                  {presentPlayers.map((p) => (
                    <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
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
          <div className="space-y-1 mt-3">
            <p className="text-xs text-slate-400 font-medium">Eventos ({events.length})</p>
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                <span>{getEventIcon(ev.type)}</span>
                <span className="text-slate-300 text-xs">{getEventLabel(ev.type)}</span>
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
      </div>

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
  const { players, addMatch, addEventsToMatch, setPresences: savePresences } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    opponent: '',
    date: new Date().toISOString().slice(0, 10),
    venue: 'home',
    competition: '',
    ourScore: '0',
    theirScore: '0',
    notes: '',
    quadro: 'Quadro 1',
  })
  const [events, setEvents] = useState([])
  const [presences, setPresences] = useState([])

  const handleSave = () => {
    const id = addMatch(form)
    if (events.length > 0) addEventsToMatch(id, events)
    if (presences.length > 0) savePresences(id, presences)
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
          <Step2
            form={form}
            events={events}
            setEvents={setEvents}
            presences={presences}
            setPresences={setPresences}
            players={players}
            onBack={() => setStep(1)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  )
}
