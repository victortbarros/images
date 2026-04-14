import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, BarChart2, Settings, DollarSign, FileText } from 'lucide-react'
import { useApp } from '../../context/AppContext'
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
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-700 shrink-0">
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2 group">
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
        <nav className="flex-1 p-3 space-y-1">
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
      </aside>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
