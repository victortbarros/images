import { useState, useMemo, useRef } from 'react'
import { Printer, Trophy, Target, Calendar, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { computeAllStats } from '../utils/statsCalculator'
import { formatDate, formatMatchResult, resultColor } from '../utils/formatters'
import { getPlayerQuadros } from '../utils/playerHelpers'
import { QUADROS, QUADRO_COLORS } from '../constants/positions'

const REPORT_TYPES = [
  { id: 'artilharia', label: 'Artilharia', icon: Trophy },
  { id: 'assistencias', label: 'Assistências', icon: Target },
  { id: 'frequencia', label: 'Frequência', icon: Calendar },
  { id: 'resultados', label: 'Resultados', icon: TrendingUp },
]

function ArtilhariaReport({ allStats, quadroFilter, settings }) {
  const filtered = allStats
    .filter(({ player }) => quadroFilter === 'Todos' || getPlayerQuadros(player).includes(quadroFilter))
    .filter(({ goals }) => goals > 0)
    .slice(0, 10)

  const max = filtered[0]?.goals ?? 1

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">⚽ Artilheiros</h3>
      {filtered.length === 0 && <p className="text-slate-500 text-sm">Nenhum gol registrado.</p>}
      {filtered.map(({ player, goals, assists }, i) => (
        <div key={player.id} className="flex items-center gap-3">
          <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
            {i + 1}º
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">{player.name}</span>
              <div className="flex items-center gap-2">
                {assists > 0 && <span className="text-xs text-slate-400">{assists} assist.</span>}
                <span className="text-green-400 font-bold">{goals} ⚽</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: `${(goals / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AssistenciasReport({ allStats, quadroFilter }) {
  const filtered = allStats
    .filter(({ player }) => quadroFilter === 'Todos' || getPlayerQuadros(player).includes(quadroFilter))
    .filter(({ assists }) => assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10)

  const max = filtered[0]?.assists ?? 1

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">🎯 Assistências</h3>
      {filtered.length === 0 && <p className="text-slate-500 text-sm">Nenhuma assistência registrada.</p>}
      {filtered.map(({ player, assists, goals }, i) => (
        <div key={player.id} className="flex items-center gap-3">
          <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
            {i + 1}º
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">{player.name}</span>
              <div className="flex items-center gap-2">
                {goals > 0 && <span className="text-xs text-slate-400">{goals} gols</span>}
                <span className="text-blue-400 font-bold">{assists} 🎯</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(assists / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FrequenciaReport({ allStats, quadroFilter }) {
  const filtered = allStats
    .filter(({ player }) => quadroFilter === 'Todos' || getPlayerQuadros(player).includes(quadroFilter))
    .filter(({ totalQuadroMatches }) => totalQuadroMatches > 0)
    .sort((a, b) => b.frequenciaPercent - a.frequenciaPercent)
    .slice(0, 10)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">📋 Frequência</h3>
      {filtered.length === 0 && <p className="text-slate-500 text-sm">Nenhum dado de presença registrado.</p>}
      {filtered.map(({ player, frequencia, frequenciaPercent }, i) => {
        const color = frequenciaPercent >= 75 ? 'bg-green-600' : frequenciaPercent >= 50 ? 'bg-yellow-600' : 'bg-red-600'
        return (
          <div key={player.id} className="flex items-center gap-3">
            <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
              {i + 1}º
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">{player.name}</span>
                <span className="text-slate-300 font-medium text-sm">{frequencia} <span className="text-xs text-slate-400">({frequenciaPercent}%)</span></span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${frequenciaPercent}%` }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ResultadosReport({ matches, quadroFilter }) {
  const filtered = matches.filter((m) =>
    quadroFilter === 'Todos' || (m.quadro ?? 'Quadro 1') === quadroFilter
  )

  const wins = filtered.filter((m) => m.ourScore > m.theirScore).length
  const draws = filtered.filter((m) => m.ourScore === m.theirScore).length
  const losses = filtered.filter((m) => m.ourScore < m.theirScore).length
  const goalsFor = filtered.reduce((s, m) => s + m.ourScore, 0)
  const goalsAgainst = filtered.reduce((s, m) => s + m.theirScore, 0)
  const total = filtered.length

  const recent = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">📊 Resultados</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-900/40 rounded-lg p-2">
          <div className="text-xl font-bold text-green-400">{wins}</div>
          <div className="text-xs text-slate-400">Vitórias</div>
        </div>
        <div className="bg-yellow-900/40 rounded-lg p-2">
          <div className="text-xl font-bold text-yellow-400">{draws}</div>
          <div className="text-xs text-slate-400">Empates</div>
        </div>
        <div className="bg-red-900/40 rounded-lg p-2">
          <div className="text-xl font-bold text-red-400">{losses}</div>
          <div className="text-xs text-slate-400">Derrotas</div>
        </div>
      </div>
      <div className="flex gap-4 text-sm text-slate-400">
        <span>⚽ Gols marcados: <strong className="text-white">{goalsFor}</strong></span>
        <span>🥅 Gols sofridos: <strong className="text-white">{goalsAgainst}</strong></span>
        <span>Saldo: <strong className={goalsFor >= goalsAgainst ? 'text-green-400' : 'text-red-400'}>{goalsFor - goalsAgainst > 0 ? '+' : ''}{goalsFor - goalsAgainst}</strong></span>
      </div>
      {total > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Aproveitamento: {total > 0 ? Math.round(((wins * 3 + draws) / (total * 3)) * 100) : 0}%</p>
          <h4 className="text-xs text-slate-400 font-medium mb-2">Últimas partidas</h4>
          <div className="space-y-1">
            {recent.map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <span className={`font-bold w-6 text-center ${resultColor(m)}`}>
                  {m.ourScore > m.theirScore ? 'V' : m.ourScore === m.theirScore ? 'E' : 'D'}
                </span>
                <span className="text-white font-medium w-10 text-center">{m.ourScore}×{m.theirScore}</span>
                <span className="text-slate-400 truncate">vs {m.opponent}</span>
                <span className="text-slate-500 text-xs ml-auto shrink-0">{formatDate(m.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Relatorios() {
  const { players, matches, settings } = useApp()
  const [reportType, setReportType] = useState('artilharia')
  const [quadroFilter, setQuadroFilter] = useState('Todos')
  const printRef = useRef()

  const allStats = useMemo(() => computeAllStats(matches, players), [matches, players])

  const handlePrint = () => {
    const content = printRef.current
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>${settings?.teamName ?? 'Futsal Stats'} — Relatório</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #1e293b; color: #f1f5f9; font-family: system-ui, sans-serif; padding: 24px; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .sub { color: #94a3b8; font-size: 13px; margin-bottom: 20px; }
            .bar-bg { background: #334155; border-radius: 4px; height: 8px; margin-top: 4px; }
            .bar { height: 8px; border-radius: 4px; background: #16a34a; }
            .row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
            .rank { width: 24px; font-weight: bold; color: #94a3b8; }
            .name { flex: 1; font-weight: 600; }
            .val { font-weight: bold; color: #4ade80; }
            .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 12px 0; }
            .stat-box { background: #0f172a; border-radius: 8px; padding: 10px; text-align: center; }
            .stat-num { font-size: 22px; font-weight: bold; }
            .stat-lbl { font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h1>${settings?.teamName ?? 'Futsal Stats'}</h1>
          <p class="sub">Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} · ${quadroFilter}</p>
          ${content.innerHTML}
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const TABS = ['Todos', ...QUADROS]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios</h1>
          <p className="text-sm text-slate-400">Visualize e imprima relatórios do time</p>
        </div>
        <button className="btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Imprimir / Salvar
        </button>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setReportType(id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
              reportType === id
                ? 'bg-pitch text-white border-transparent'
                : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Quadro filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const qColor = QUADRO_COLORS[tab]
          return (
            <button
              key={tab}
              onClick={() => setQuadroFilter(tab)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                quadroFilter === tab
                  ? qColor ? `${qColor.bg} text-white border-transparent` : 'bg-pitch text-white border-transparent'
                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Report content */}
      <div className="card p-5" ref={printRef}>
        {reportType === 'artilharia' && <ArtilhariaReport allStats={allStats} quadroFilter={quadroFilter} settings={settings} />}
        {reportType === 'assistencias' && <AssistenciasReport allStats={allStats} quadroFilter={quadroFilter} />}
        {reportType === 'frequencia' && <FrequenciaReport allStats={allStats} quadroFilter={quadroFilter} />}
        {reportType === 'resultados' && <ResultadosReport matches={matches} quadroFilter={quadroFilter} />}
      </div>

      <p className="text-xs text-slate-500 mt-3 text-center">
        Use "Imprimir / Salvar" para gerar um PDF ou salvar como imagem via screenshot
      </p>
    </div>
  )
}
