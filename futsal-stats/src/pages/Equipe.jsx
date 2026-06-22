import { useState, useEffect, useCallback } from 'react'
import { Shield, UserPlus, Trash2, Mail, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '../utils/permissions'

const ROLES = ['admin', 'gestor', 'leitura']

function RoleSelect({ value, onChange, disabled }) {
  return (
    <select className="input text-xs w-auto py-1" value={value} onChange={onChange} disabled={disabled}>
      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
    </select>
  )
}

export function Equipe() {
  const { currentTeamId, settings } = useApp()
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('gestor')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)        // { type, text }
  const [removeTarget, setRemoveTarget] = useState(null)

  const load = useCallback(async () => {
    if (!currentTeamId) return
    setLoading(true)
    const [m, i] = await Promise.all([
      supabase.rpc('get_team_members', { tid: currentTeamId }),
      supabase.from('team_invites').select('*').eq('team_id', currentTeamId).order('created_at'),
    ])
    setMembers(m.data ?? [])
    setInvites(i.data ?? [])
    setLoading(false)
  }, [currentTeamId])

  useEffect(() => { load() }, [load])

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000) }

  const handleInvite = async (e) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!clean || busy) return
    setBusy(true)
    try {
      // já é membro?
      if (members.some((m) => m.email?.toLowerCase() === clean)) {
        flash('error', 'Essa pessoa já é membro do time.')
        return
      }
      // já existe convite? atualiza o papel
      const existing = invites.find((iv) => iv.email?.toLowerCase() === clean)
      if (existing) {
        await supabase.from('team_invites').update({ role }).eq('id', existing.id)
      } else {
        const { error } = await supabase.from('team_invites').insert({
          team_id: currentTeamId, email: clean, role, invited_by: user.id,
        })
        if (error) { flash('error', 'Não foi possível convidar. Tente novamente.'); return }
      }
      setEmail('')
      flash('success', `Convite registrado para ${clean}. A pessoa entra ao logar com esse email.`)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const changeRole = async (member, newRole) => {
    setMembers((prev) => prev.map((m) => (m.user_id === member.user_id ? { ...m, role: newRole } : m)))
    await supabase.from('team_members').update({ role: newRole }).eq('team_id', currentTeamId).eq('user_id', member.user_id)
  }

  const confirmRemove = async () => {
    const t = removeTarget
    setRemoveTarget(null)
    if (t.kind === 'member') {
      await supabase.from('team_members').delete().eq('team_id', currentTeamId).eq('user_id', t.id)
    } else {
      await supabase.from('team_invites').delete().eq('id', t.id)
    }
    await load()
  }

  const adminCount = members.filter((m) => m.role === 'admin').length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={22} className="text-pitch" />
        <div>
          <h1 className="text-xl font-bold text-white">Equipe & Acessos</h1>
          <p className="text-sm text-slate-400">{settings?.teamName} · gerencie quem acessa o time</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 rounded-lg px-3 py-2 text-sm border ${
          msg.type === 'success'
            ? 'bg-green-900/30 border-green-700 text-green-400'
            : 'bg-red-900/30 border-red-700 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Convidar */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Convidar pessoa</h2>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
          <input
            className="input flex-1"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <RoleSelect value={role} onChange={(e) => setRole(e.target.value)} />
          <button className="btn-primary" disabled={busy}>{busy ? '...' : 'Convidar'}</button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          {ROLE_LABELS[role]}: {ROLE_DESCRIPTIONS[role]}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 text-center py-8">Carregando...</p>
      ) : (
        <>
          {/* Membros */}
          <div className="card p-4 mb-4">
            <h2 className="text-sm font-semibold text-white mb-3">Membros ({members.length})</h2>
            <div className="space-y-2">
              {members.map((m) => {
                const isSelf = m.user_id === user.id
                const lastAdmin = m.role === 'admin' && adminCount <= 1
                return (
                  <div key={m.user_id} className="flex items-center gap-2 py-2 border-b border-slate-700/50 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-pitch flex items-center justify-center text-xs text-white font-bold shrink-0">
                      {m.email?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {m.email}{isSelf && <span className="text-xs text-slate-500"> (você)</span>}
                      </div>
                    </div>
                    <RoleSelect
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                      disabled={isSelf || lastAdmin}
                    />
                    <button
                      className="text-slate-600 hover:text-red-400 transition-colors p-1 disabled:opacity-30 disabled:hover:text-slate-600"
                      title="Remover do time"
                      disabled={isSelf || lastAdmin}
                      onClick={() => setRemoveTarget({ kind: 'member', id: m.user_id, label: m.email })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Convites pendentes */}
          {invites.length > 0 && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Convites pendentes ({invites.length})</h2>
              </div>
              <div className="space-y-2">
                {invites.map((iv) => (
                  <div key={iv.id} className="flex items-center gap-2 py-2 border-b border-slate-700/50 last:border-0">
                    <Mail size={15} className="text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-300 truncate">{iv.email}</div>
                      <div className="text-xs text-slate-500">{ROLE_LABELS[iv.role]} · aguardando primeiro login</div>
                    </div>
                    <button
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                      title="Cancelar convite"
                      onClick={() => setRemoveTarget({ kind: 'invite', id: iv.id, label: iv.email })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {removeTarget && (
        <ConfirmDialog
          title={removeTarget.kind === 'member' ? 'Remover membro' : 'Cancelar convite'}
          message={
            removeTarget.kind === 'member'
              ? `Remover ${removeTarget.label} do time? A pessoa perde o acesso imediatamente.`
              : `Cancelar o convite de ${removeTarget.label}?`
          }
          onConfirm={confirmRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  )
}
