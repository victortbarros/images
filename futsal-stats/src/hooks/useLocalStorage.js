import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = (next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      localStorage.setItem(key, JSON.stringify(resolved))
      return resolved
    })
  }

  return [value, set]
}
