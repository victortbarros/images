import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { POSITIONS, QUADROS } from '../../constants/positions'
import { getPlayerQuadros } from '../../utils/playerHelpers'

export function PlayerForm({ player, onClose }) {
  const { players, addPlayer, updatePlayer } = useApp()
  const [form, setForm] = useState({
    name: player?.name ?? '',
    number: player?.number ?? '',
    position: player?.position ?? 'Ala',
    quadros: getPlayerQuadros(player),
  })
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleQuadro = (q) => {
    setForm((f) => {
      const has = f.quadros.includes(q)
      // must have at least one quadro
      if (has && f.quadros.length === 1) return f
      return { ...f, quadros: has ? f.quadros.filter((x) => x !== q) : [...f.quadros, q] }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Nome é obrigatório.')
    const num = Number(form.number)
    if (!num || num < 1 || num > 99) return setError('Número deve ser entre 1 e 99.')
    if (form.quadros.length === 0) return setError('Selecione ao menos um quadro.')

    const duplicate = players.find((p) => p.active && p.number === num && p.id !== player?.id)
    if (duplicate) return setError(`Número ${num} já está em uso por ${duplicate.name}.`)

    if (player) {
      updatePlayer(player.id, { name: form.name.trim(), number: num, position: form.position, quadros: form.quadros })
    } else {
      addPlayer({ name: form.name.trim(), number: num, position: form.position, quadros: form.quadros })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nome *</label>
        <input className="input" value={form.name} onChange={set('name')} maxLength={50} placeholder="Nome do jogador" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Número da camisa *</label>
          <input className="input" type="number" min={1} max={99} value={form.number} onChange={set('number')} placeholder="Ex: 10" />
        </div>
        <div>
          <label className="label">Posição *</label>
          <select className="input" value={form.position} onChange={set('position')}>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Quadro(s) *</label>
        <div className="flex gap-2">
          {QUADROS.map((q) => {
            const checked = form.quadros.includes(q)
            return (
              <button
                key={q}
                type="button"
                onClick={() => toggleQuadro(q)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  checked
                    ? 'bg-pitch text-white border-transparent'
                    : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'
                }`}
              >
                {q}
                {checked && ' ✓'}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 mt-1">Selecione um ou ambos os quadros</p>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">{player ? 'Salvar' : 'Adicionar'}</button>
      </div>
    </form>
  )
}
