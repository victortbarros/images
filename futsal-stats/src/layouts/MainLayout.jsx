import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { MobileNav } from '../components/navigation/MobileNav'

export function MainLayout() {
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
