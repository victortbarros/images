import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { POSITIONS } from '../../constants/positions'

export function PlayerForm({ player, onClose }) {
  const { players, addPlayer, updatePlayer } = useApp()
  const [form, setForm] = useState({
    name: player?.name ?? '',
    number: player?.number ?? '',
    position: player?.position ?? 'Ala',
  })
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Nome é obrigatório.')
    const num = Number(form.number)
    if (!num || num < 1 || num > 99) return setError('Número deve ser entre 1 e 99.')

    const duplicate = players.find(
      (p) => p.active && p.number === num && p.id !== player?.id
    )
    if (duplicate) return setError(`Número ${num} já está em uso por ${duplicate.name}.`)

    if (player) {
      updatePlayer(player.id, { name: form.name.trim(), number: num, position: form.position })
    } else {
      addPlayer({ name: form.name.trim(), number: num, position: form.position })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nome *</label>
        <input className="input" value={form.name} onChange={set('name')} maxLength={50} placeholder="Nome do jogador" />
      </div>
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
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">{player ? 'Salvar' : 'Adicionar'}</button>
      </div>
    </form>
  )
}
