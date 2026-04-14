import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Modal } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { StatCard } from '../components/common/StatCard'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, getCategories } from '../constants/financial'
import { formatDate } from '../utils/formatters'

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function EntryForm({ entry, onClose }) {
  const { addEntry, updateEntry } = useApp()
  const [form, setForm] = useState({
    type: entry?.type ?? 'income',
    category: entry?.category ?? INCOME_CATEGORIES[0],
    description: entry?.description ?? '',
    amount: entry?.amount ?? '',
    date: entry?.date ?? new Date().toISOString().slice(0, 10),
  })
  const [error, setError] = useState('')

  const set = (field) => (e) => {
    const value = e.target.value
    setForm((f) => {
      const next = { ...f, [field]: value }
      // reset category when type changes
      if (field === 'type') next.category = getCategories(value)[0]
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return setError('Informe um valor válido.')
    if (!form.date) return setError('Informe a data.')
    if (entry) updateEntry(entry.id, form)
    else addEntry(form)
    onClose()
  }

  const categories = getCategories(form.type)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Tipo *</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ value: 'income', label: '💰 Entrada' }, { value: 'expense', label: '💸 Saída' }].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('type')({ target: { value: opt.value } })}
              className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                form.type === opt.value
                  ? opt.value === 'income' ? 'bg-green-700 text-white border-transparent' : 'bg-red-700 text-white border-transparent'
                  : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Categoria *</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Data *</label>
          <input className="input" type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>
      <div>
        <label className="label">Valor (R$) *</label>
        <input
          className="input"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={set('amount')}
          placeholder="0,00"
        />
      </div>
      <div>
        <label className="label">Descrição</label>
        <input className="input" value={form.description} onChange={set('description')} maxLength={100} placeholder="Ex: Aluguel quadra março" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">{entry ? 'Salvar' : 'Adicionar'}</button>
      </div>
    </form>
  )
}

export function Financeiro() {
  const { entries, deleteEntry } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')

  const allCategories = useMemo(() => {
    const cats = new Set(entries.map((e) => e.category))
    return ['Todas', ...Array.from(cats).sort()]
  }, [entries])

  const filtered = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((e) => {
        if (typeFilter !== 'all' && e.type !== typeFilter) return false
        if (categoryFilter !== 'Todas' && e.category !== categoryFilter) return false
        if (dateFrom && e.date < dateFrom) return false
        if (dateTo && e.date > dateTo) return false
        return true
      })
  }, [entries, typeFilter, categoryFilter, dateFrom, dateTo])

  const summary = useMemo(() => {
    const income = filtered.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const expense = filtered.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    return { income, expense, balance: income - expense }
  }, [filtered])

  const hasFilters = typeFilter !== 'all' || categoryFilter !== 'Todas' || dateFrom || dateTo

  const clearFilters = () => {
    setTypeFilter('all')
    setCategoryFilter('Todas')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Financeiro</h1>
          <p className="text-sm text-slate-400">{entries.length} lançamento{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditEntry(null); setShowForm(true) }}>
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard icon={<TrendingUp size={14} />} label="Entradas" value={formatBRL(summary.income)} color="text-green-400" />
        <StatCard icon={<TrendingDown size={14} />} label="Saídas" value={formatBRL(summary.expense)} color="text-red-400" />
        <StatCard
          icon={<DollarSign size={14} />}
          label="Saldo"
          value={formatBRL(summary.balance)}
          color={summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {/* Filters */}
      <div className="card p-3 mb-4 space-y-2">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'income', label: '💰 Entradas' },
            { value: 'expense', label: '💸 Saídas' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                typeFilter === opt.value
                  ? 'bg-pitch text-white border-transparent'
                  : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <select
            className="input text-xs w-auto py-1"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 ml-auto" onClick={clearFilters}>
              <X size={12} /> Limpar
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500">Período:</span>
          <input type="date" className="input text-xs w-auto py-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-xs text-slate-500">–</span>
          <input type="date" className="input text-xs w-auto py-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <EmptyState
          icon="💰"
          title="Nenhum lançamento ainda"
          description="Registre entradas e saídas para controlar o financeiro do time."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Primeiro lançamento
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhum resultado" description="Tente outros filtros."
          action={<button className="btn-secondary" onClick={clearFilters}><X size={14} /> Limpar filtros</button>}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div key={entry.id} className={`card p-4 flex items-center gap-3 border ${
              entry.type === 'income' ? 'border-green-800/50' : 'border-red-800/50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                entry.type === 'income' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
              }`}>
                {entry.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{entry.category}</span>
                  {entry.description && (
                    <span className="text-xs text-slate-400 truncate">— {entry.description}</span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{formatDate(entry.date)}</span>
              </div>
              <div className={`text-base font-bold shrink-0 ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {entry.type === 'income' ? '+' : '-'}{formatBRL(entry.amount)}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                  onClick={() => { setEditEntry(entry); setShowForm(true) }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                  onClick={() => setDeleteTarget(entry)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editEntry ? 'Editar lançamento' : 'Novo lançamento'} onClose={() => { setShowForm(false); setEditEntry(null) }}>
          <EntryForm entry={editEntry} onClose={() => { setShowForm(false); setEditEntry(null) }} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir lançamento"
          message={`Deseja excluir o lançamento de ${formatBRL(deleteTarget.amount)} (${deleteTarget.category})?`}
          onConfirm={() => { deleteEntry(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
