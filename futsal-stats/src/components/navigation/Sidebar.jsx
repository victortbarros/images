import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, BarChart2, Settings, DollarSign, FileText, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { SettingsModal } from '../common/SettingsModal'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/elenco', icon: Users, label: 'Elenco' },
  { to: '/partidas', icon: Calendar, label: 'Partidas' },
  { to: '/estatisticas', icon: BarChart2, label: 'Gestão da Equipe' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/relatorios', icon: FileText, label: 'Relatórios' },
]

export function Sidebar() {
  const { settings } = useApp()
  const { user, signOut } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-700 shrink-0">
        {/* Team header */}
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-pitch transition-colors"
              onClick={() => setShowSettings(true)}
              title="Configurações do time"
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
              <div className="text-xs text-slate-400">Gestão da equipe</div>
            </div>
            <button
              className="text-slate-600 hover:text-slate-300 transition-colors p-1 shrink-0"
              onClick={() => setShowSettings(true)}
              title="Editar"
            >
              <Settings size={14} />
            </button>
          </div>
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
