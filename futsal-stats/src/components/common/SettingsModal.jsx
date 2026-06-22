import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Modal } from './Modal'
import { useApp } from '../../context/AppContext'

async function resizeLogo(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) return reject(new Error('Imagem muito grande (máx. 5 MB)'))
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const SIZE = 80
      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      // crop to square center
      const s = Math.min(img.width, img.height)
      const sx = (img.width - s) / 2
      const sy = (img.height - s) / 2
      ctx.drawImage(img, sx, sy, s, s, 0, 0, SIZE, SIZE)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem'))
    img.src = url
  })
}

export function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useApp()
  const [name, setName] = useState(settings.teamName ?? 'Futsal Stats')
  const [logo, setLogo] = useState(settings.teamLogo ?? null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    try {
      const dataUrl = await resizeLogo(file)
      setLogo(dataUrl)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSave = () => {
    if (!name.trim()) return setError('Nome não pode ser vazio.')
    updateSettings({ teamName: name.trim(), teamLogo: logo })
    onClose()
  }

  return (
    <Modal title="Configurações do time" onClose={onClose} size="sm">
      <div className="space-y-4">
        {/* Logo */}
        <div>
          <label className="label">Logo do time</label>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-pitch transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {logo
                ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-3xl">⚽</span>
              }
            </div>
            <div className="flex flex-col gap-1.5">
              <button className="btn-secondary text-xs py-1.5" onClick={() => fileRef.current?.click()}>
                <Upload size={14} /> Enviar imagem
              </button>
              {logo && (
                <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1" onClick={() => setLogo(null)}>
                  <X size={12} /> Remover logo
                </button>
              )}
              <span className="text-xs text-slate-500">JPG, PNG · máx. 5 MB</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Team name */}
        <div>
          <label className="label">Nome do time</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Ex: Guerreiros FC"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-2 justify-end pt-1">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </Modal>
  )
}
