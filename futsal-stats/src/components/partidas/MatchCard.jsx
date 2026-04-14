import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatDate, formatMatchResult, resultColor, resultBg } from '../../utils/formatters'
import { VenueBadge, QuadroBadge } from '../common/Badge'

export function MatchCard({ match }) {
  const navigate = useNavigate()

  return (
    <div
      className={`card p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors border ${resultBg(match)}`}
      onClick={() => navigate(`/partidas/${match.id}`)}
    >
      <div className="text-center shrink-0 w-14">
        <div className="text-2xl font-bold text-white">
          {match.ourScore}<span className="text-slate-400 mx-0.5">×</span>{match.theirScore}
        </div>
        <div className={`text-xs font-semibold ${resultColor(match)}`}>
          {formatMatchResult(match)}
        </div>
      </div>

      <div className="w-px h-10 bg-slate-600 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">vs {match.opponent}</div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400">{formatDate(match.date)}</span>
          {match.competition && (
            <span className="text-xs text-slate-500">· {match.competition}</span>
          )}
          <VenueBadge venue={match.venue} />
          <QuadroBadge quadro={match.quadro ?? 'Quadro 1'} />
        </div>
      </div>

      <ChevronRight size={16} className="text-slate-500 shrink-0" />
    </div>
  )
}
