export function StatCard({ icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  )
}
