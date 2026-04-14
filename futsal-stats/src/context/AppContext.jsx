import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createPlayer, createMatch, createEvent } from '../models/schema'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = { teamName: 'Futsal Stats', teamLogo: null }

export function AppProvider({ children }) {
  const [players, setPlayers] = useLocalStorage('futsal_players', [])
  const [matches, setMatches] = useLocalStorage('futsal_matches', [])
  const [settings, setSettings] = useLocalStorage('futsal_settings', DEFAULT_SETTINGS)
  const [entries, setEntries] = useLocalStorage('futsal_financial', [])

  // ── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback((data) => {
    setSettings((prev) => ({ ...prev, ...data }))
  }, [setSettings])

  // ── Player actions ────────────────────────────────────────────────────────
  const addPlayer = useCallback((data) => {
    setPlayers((prev) => [...prev, createPlayer(data)])
  }, [setPlayers])

  const updatePlayer = useCallback((id, data) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }, [setPlayers])

  const removePlayer = useCallback((id) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)))
  }, [setPlayers])

  // ── Match actions ─────────────────────────────────────────────────────────
  const addMatch = useCallback((data) => {
    const match = createMatch(data)
    setMatches((prev) => [match, ...prev])
    return match.id
  }, [setMatches])

  const updateMatch = useCallback((id, data) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)))
  }, [setMatches])

  const deleteMatch = useCallback((id) => {
    setMatches((prev) => prev.filter((m) => m.id !== id))
  }, [setMatches])

  const addEvent = useCallback((matchId, eventData) => {
    const event = createEvent(eventData)
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, events: [...m.events, event] } : m))
    )
  }, [setMatches])

  const removeEvent = useCallback((matchId, eventId) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, events: m.events.filter((e) => e.id !== eventId) } : m
      )
    )
  }, [setMatches])

  const addEventsToMatch = useCallback((matchId, events) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, events: [...m.events, ...events.map(createEvent)] } : m
      )
    )
  }, [setMatches])

  const togglePresence = useCallback((matchId, playerId) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m
        const presences = m.presences ?? []
        const isPresent = presences.includes(playerId)
        return { ...m, presences: isPresent ? presences.filter((id) => id !== playerId) : [...presences, playerId] }
      })
    )
  }, [setMatches])

  const setPresences = useCallback((matchId, playerIds) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, presences: playerIds } : m))
    )
  }, [setMatches])

  // ── Financial actions ────────────────────────────────────────────────────
  const addEntry = useCallback((data) => {
    const entry = {
      id: crypto.randomUUID(),
      type: data.type,
      category: data.category,
      description: data.description ?? '',
      amount: Number(data.amount),
      date: data.date,
      createdAt: new Date().toISOString(),
    }
    setEntries((prev) => [entry, ...prev])
  }, [setEntries])

  const updateEntry = useCallback((id, data) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data, amount: Number(data.amount) } : e)))
  }, [setEntries])

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [setEntries])

  return (
    <AppContext.Provider value={{
      players, matches, settings, entries,
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
