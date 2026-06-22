import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, BarChart2, Settings, DollarSign, FileText, LogOut, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { SettingsModal } from '../common/SettingsModal'
import { canSeeFinance, canManageTeam, ROLE_LABELS } from '../../utils/permissions'

const allLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/elenco', icon: Users, label: 'Elenco' },
  { to: '/partidas', icon: Calendar, label: 'Partidas' },
  { to: '/estatisticas', icon: BarChart2, label: 'Gestão da Equipe' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', finance: true },
  { to: '/relatorios', icon: FileText, label: 'Relatórios' },
  { to: '/equipe', icon: Shield, label: 'Equipe', admin: true },
]

export function Sidebar() {
  const { settings, userRole, teams, currentTeamId, setCurrentTeam } = useApp()
  const { user, signOut } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  const links = allLinks.filter(
    (l) => (!l.finance || canSeeFinance(userRole)) && (!l.admin || canManageTeam(userRole))
  )

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-700 shrink-0">
        {/* Team header */}
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0 transition-colors ${canManageTeam(userRole) ? 'cursor-pointer hover:border-pitch' : ''}`}
              onClick={() => { if (canManageTeam(userRole)) setShowSettings(true) }}
              title={canManageTeam(userRole) ? 'Configurações do time' : undefined}
            >
              {settings?.teamLogo
                ? <img src={settings.teamLogo} alt="logo" className="w-full h-full object-cover" />
                : <span className="text-xl">⚽</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white leading-tight truncate">
                {settings?.teamName ?? 'Futsal Stats'}
              </div>
              <div className="text-xs text-slate-400">{ROLE_LABELS[userRole] ?? 'Gestão da equipe'}</div>
            </div>
            {canManageTeam(userRole) && (
              <button
                className="text-slate-600 hover:text-slate-300 transition-colors p-1 shrink-0"
                onClick={() => setShowSettings(true)}
                title="Editar"
              >
                <Settings size={14} />
              </button>
            )}
          </div>

          {teams.length > 1 && (
            <select
              className="input text-xs mt-3 py-1.5"
              value={currentTeamId ?? ''}
              onChange={(e) => setCurrentTeam(e.target.value)}
              title="Trocar de time"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {ROLE_LABELS[t.role] ?? t.role}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-pitch flex items-center justify-center text-xs text-white font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-xs text-slate-400 truncate flex-1">{user?.email}</span>
            <button
              onClick={signOut}
              title="Sair"
              className="text-slate-600 hover:text-red-400 transition-colors p-1 shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
