import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, BarChart2 } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/elenco', icon: Users, label: 'Elenco' },
  { to: '/partidas', icon: Calendar, label: 'Partidas' },
  { to: '/estatisticas', icon: BarChart2, label: 'Stats' },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-40">
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-green-400' : 'text-slate-400'
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
