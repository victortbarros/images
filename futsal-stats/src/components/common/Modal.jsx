import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ title, children, onClose, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative card w-full ${sizeClass} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
