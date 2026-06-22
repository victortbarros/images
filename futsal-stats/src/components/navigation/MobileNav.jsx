import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, BarChart2, DollarSign, FileText, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { canSeeFinance, canManageTeam } from '../../utils/permissions'

const allLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/elenco', icon: Users, label: 'Elenco' },
  { to: '/partidas', icon: Calendar, label: 'Partidas' },
  { to: '/estatisticas', icon: BarChart2, label: 'Equipe' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', finance: true },
  { to: '/relatorios', icon: FileText, label: 'Relatórios' },
  { to: '/equipe', icon: Shield, label: 'Membros', admin: true },
]

export function MobileNav() {
  const { userRole } = useApp()
  const links = allLinks.filter(
    (l) => (!l.finance || canSeeFinance(userRole)) && (!l.admin || canManageTeam(userRole))
  )

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-40 overflow-x-auto safe-bottom">
      {links.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 min-w-[52px] flex flex-col items-center justify-center py-2 gap-0.5 font-medium transition-colors ${
              isActive ? 'text-green-400' : 'text-slate-400'
            }`
          }
        >
          <Icon size={18} />
          <span className="text-[9px] leading-tight">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
