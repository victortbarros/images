import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

function mapPlayer(p) {
  return {
    id: p.id, name: p.name, number: p.number, position: p.position,
    quadros: p.quadros ?? ['Quadro 1'], active: p.active, createdAt: p.created_at,
  }
}

function mapEvent(e) {
  return { id: e.id, type: e.type, playerId: e.player_id, minute: e.minute, value: e.value }
}

function mapMatch(m) {
  return {
    id: m.id, date: m.date, opponent: m.opponent, venue: m.venue,
    competition: m.competition, ourScore: m.our_score, theirScore: m.their_score,
    notes: m.notes, quadro: m.quadro, presences: m.presences ?? [],
    events: (m.match_events ?? []).map(mapEvent), createdAt: m.created_at,
  }
}

function mapEntry(e) {
  return {
    id: e.id, type: e.type, category: e.category, description: e.description,
    amount: Number(e.amount), date: e.date, createdAt: e.created_at,
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [teamId, setTeamId] = useState(null)
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [settings, setSettings] = useState({ teamName: 'Futsal Stats', teamLogo: null })
  const [entries, setEntries] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const teamIdRef = useRef(null)

  useEffect(() => { teamIdRef.current = teamId }, [teamId])

  useEffect(() => {
    if (!user) {
      setTeamId(null); setPlayers([]); setMatches([]); setEntries([]); setDataLoading(false)
      return
    }
    initTeam()
  }, [user?.id])

  const initTeam = async () => {
    setDataLoading(true)
    try {
      let { data: teams } = await supabase.from('teams').select('*').eq('owner_id', user.id).limit(1)
      let team = teams?.[0]
      if (!team) {
        const { data } = await supabase.from('teams').insert({ owner_id: user.id, name: 'Meu Time' }).select().single()
        team = data
      }
      setTeamId(team.id)
      teamIdRef.current = team.id
      setSettings({ teamName: team.name, teamLogo: team.logo ?? null })
      await Promise.all([loadPlayers(team.id), loadMatches(team.id), loadEntries(team.id)])
    } finally {
      setDataLoading(false)
    }
  }

  const loadPlayers = async (tid) => {
    const { data } = await supabase.from('players').select('*').eq('team_id', tid).order('number')
    setPlayers((data ?? []).map(mapPlayer))
  }
  const loadMatches = async (tid) => {
    const { data } = await supabase.from('matches').select('*, match_events(*)').eq('team_id', tid).order('date', { ascending: false })
    setMatches((data ?? []).map(mapMatch))
  }
  const loadEntries = async (tid) => {
    const { data } = await supabase.from('financial_entries').select('*').eq('team_id', tid).order('date', { ascending: false })
    setEntries((data ?? []).map(mapEntry))
  }

  const updateSettings = useCallback(async (data) => {
    setSettings((prev) => {
      const next = { ...prev, ...data }
      if (teamIdRef.current)
        supabase.from('teams').update({ name: next.teamName, logo: next.teamLogo ?? null }).eq('id', teamIdRef.current).then(() => {})
      return next
    })
  }, [])

  const addPlayer = useCallback(async (data) => {
    const { data: row } = await supabase.from('players').insert({
      team_id: teamIdRef.current, name: data.name, number: Number(data.number),
      position: data.position, quadros: data.quadros ?? [data.quadro ?? 'Quadro 1'], active: true,
    }).select().single()
    if (row) setPlayers((prev) => [...prev, mapPlayer(row)])
  }, [])

  const updatePlayer = useCallback(async (id, data) => {
    const { data: row } = await supabase.from('players').update({
      name: data.name, number: Number(data.number), position: data.position,
      quadros: data.quadros ?? [data.quadro ?? 'Quadro 1'],
    }).eq('id', id).select().single()
    if (row) setPlayers((prev) => prev.map((p) => (p.id === id ? mapPlayer(row) : p)))
  }, [])

  const removePlayer = useCallback(async (id) => {
    await supabase.from('players').update({ active: false }).eq('id', id)
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)))
  }, [])

  const addMatch = useCallback(async (data) => {
    const { data: row } = await supabase.from('matches').insert({
      team_id: teamIdRef.current, date: data.date, opponent: data.opponent,
      venue: data.venue, competition: data.competition ?? '',
      our_score: Number(data.ourScore), their_score: Number(data.theirScore),
      notes: data.notes ?? '', quadro: data.quadro ?? 'Quadro 1', presences: [],
    }).select().single()
    if (row) {
      const match = mapMatch({ ...row, match_events: [] })
      setMatches((prev) => [match, ...prev])
      return match.id
    }
  }, [])

  const updateMatch = useCallback(async (id, data) => {
    const db = {}
    if ('opponent' in data)    db.opponent = data.opponent
    if ('ourScore' in data)    db.our_score = Number(data.ourScore)
    if ('theirScore' in data)  db.their_score = Number(data.theirScore)
    if ('venue' in data)       db.venue = data.venue
    if ('competition' in data) db.competition = data.competition
    if ('notes' in data)       db.notes = data.notes
    if ('date' in data)        db.date = data.date
    if ('quadro' in data)      db.quadro = data.quadro
    if (Object.keys(db).length > 0) await supabase.from('matches').update(db).eq('id', id)
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)))
  }, [])

  const deleteMatch = useCallback(async (id) => {
    await supabase.from('matches').delete().eq('id', id)
    setMatches((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const addEvent = useCallback(async (matchId, eventData) => {
    const { data: row } = await supabase.from('match_events').insert({
      match_id: matchId, type: eventData.type, player_id: eventData.playerId,
      minute: eventData.minute ?? null, value: Number(eventData.value) || 1,
    }).select().single()
    if (row) setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, events: [...m.events, mapEvent(row)] } : m))
    )
  }, [])

  const removeEvent = useCallback(async (matchId, eventId) => {
    await supabase.from('match_events').delete().eq('id', eventId)
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, events: m.events.filter((e) => e.id !== eventId) } : m))
    )
  }, [])

  const addEventsToMatch = useCallback(async (matchId, events) => {
    const rows = events.map((e) => ({
      match_id: matchId, type: e.type, player_id: e.playerId,
      minute: e.minute ?? null, value: Number(e.value) || 1,
    }))
    const { data } = await supabase.from('match_events').insert(rows).select()
    if (data) setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, events: [...m.events, ...data.map(mapEvent)] } : m))
    )
  }, [])

  const togglePresence = useCallback(async (matchId, playerId) => {
    setMatches((prev) => {
      const match = prev.find((m) => m.id === matchId)
      if (!match) return prev
      const newPresences = match.presences.includes(playerId)
        ? match.presences.filter((id) => id !== playerId)
        : [...match.presences, playerId]
      supabase.from('matches').update({ presences: newPresences }).eq('id', matchId).then(() => {})
      return prev.map((m) => (m.id === matchId ? { ...m, presences: newPresences } : m))
    })
  }, [])

  const setPresences = useCallback(async (matchId, playerIds) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, presences: playerIds } : m)))
    await supabase.from('matches').update({ presences: playerIds }).eq('id', matchId)
  }, [])

  const addEntry = useCallback(async (data) => {
    const { data: row } = await supabase.from('financial_entries').insert({
      team_id: teamIdRef.current, type: data.type, category: data.category,
      description: data.description ?? '', amount: Number(data.amount), date: data.date,
    }).select().single()
    if (row) setEntries((prev) => [mapEntry(row), ...prev])
  }, [])

  const updateEntry = useCallback(async (id, data) => {
    const { data: row } = await supabase.from('financial_entries').update({
      type: data.type, category: data.category, description: data.description ?? '',
      amount: Number(data.amount), date: data.date,
    }).eq('id', id).select().single()
    if (row) setEntries((prev) => prev.map((e) => (e.id === id ? mapEntry(row) : e)))
  }, [])

  const deleteEntry = useCallback(async (id) => {
    await supabase.from('financial_entries').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      players, matches, settings, entries, dataLoading,
      updateSettings,
      addPlayer, updatePlayer, removePlayer,
      addMatch, updateMatch, deleteMatch,
      addEvent, removeEvent, addEventsToMatch,
      togglePresence, setPresences,
      addEntry, updateEntry, deleteEntry,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
