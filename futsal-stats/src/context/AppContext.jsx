import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createPlayer, createMatch, createEvent } from '../models/schema'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [players, setPlayers] = useLocalStorage('futsal_players', [])
  const [matches, setMatches] = useLocalStorage('futsal_matches', [])

  // ── Player actions ──────────────────────────────────────────────────────
  const addPlayer = useCallback((data) => {
    setPlayers((prev) => [...prev, createPlayer(data)])
  }, [setPlayers])

  const updatePlayer = useCallback((id, data) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }, [setPlayers])

  const removePlayer = useCallback((id) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)))
  }, [setPlayers])

  // ── Match actions ────────────────────────────────────────────────────────
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
        return {
          ...m,
          presences: isPresent
            ? presences.filter((id) => id !== playerId)
            : [...presences, playerId],
        }
      })
    )
  }, [setMatches])

  const setPresences = useCallback((matchId, playerIds) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, presences: playerIds } : m))
    )
  }, [setMatches])

  return (
    <AppContext.Provider
      value={{
        players,
        matches,
        addPlayer,
        updatePlayer,
        removePlayer,
        addMatch,
        updateMatch,
        deleteMatch,
        addEvent,
        removeEvent,
        addEventsToMatch,
        togglePresence,
        setPresences,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
