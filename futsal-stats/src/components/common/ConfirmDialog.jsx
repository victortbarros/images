import { Modal } from './Modal'

export function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className="text-sm text-slate-300 mb-4">{message}</p>
      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
          Confirmar
        </button>
      </div>
    </Modal>
  )
}
