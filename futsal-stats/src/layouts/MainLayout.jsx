import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { MobileNav } from '../components/navigation/MobileNav'
import { useApp } from '../context/AppContext'

export function MainLayout() {
  const { dataLoading } = useApp()

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⚽</div>
          <div className="text-slate-400 text-sm">Carregando dados do time...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-800 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
