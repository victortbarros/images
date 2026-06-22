import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { VENUE_OPTIONS, QUADROS } from '../constants/positions'

const COMPETITION_OPTIONS = ['Liga JR', 'Festival', 'Amistoso', 'Copa', 'Torneio', 'Campeonato']

export function NovaPartida() {
  const navigate = useNavigate()
  const { addMatch } = useApp()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    opponent: '',
    date: new Date().toISOString().slice(0, 10),
    venue: 'home',
    competition: '',
    quadro: 'Quadro 1',
    notes: '',
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const valid = form.opponent.trim() && form.date

  const handleSave = async () => {
    if (!valid || saving) return
    setSaving(true)
    const id = await addMatch(form)
    if (id) navigate(`/partidas/${id}`)
    else setSaving(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button className="text-slate-400 hover:text-white transition-colors" onClick={() => navigate('/partidas')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Nova Partida</h1>
          <p className="text-sm text-slate-400">Presença, escalação e placar serão preenchidos no dia do jogo</p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <label className="label">Adversário *</label>
          <input className="input" value={form.opponent} onChange={set('opponent')} placeholder="Nome do adversário" maxLength={60} autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data *</label>
            <input className="input" type="date" value={form.date} onChange={set('date')} />
          </div>
          <div>
            <label className="label">Quadro *</label>
            <select className="input" value={form.quadro} onChange={set('quadro')}>
              {QUADROS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Local</label>
            <select className="input" value={form.venue} onChange={set('venue')}>
              {VENUE_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
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

        <div>
          <label className="label">Observações</label>
          <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Notas sobre a partida..." />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button className="btn-secondary" onClick={() => navigate('/partidas')}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={!valid || saving}>
            {saving ? 'Salvando...' : 'Criar partida'}
          </button>
        </div>
      </div>
    </div>
  )
}
