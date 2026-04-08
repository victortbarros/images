import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, BarChart2 } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/elenco', icon: Users, label: 'Elenco' },
  { to: '/partidas', icon: Calendar, label: 'Partidas' },
  { to: '/estatisticas', icon: BarChart2, label: 'Estatísticas' },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-700 shrink-0">
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Futsal Stats</div>
            <div className="text-xs text-slate-400">Estatísticas do time</div>
          </div>
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
  )
}
