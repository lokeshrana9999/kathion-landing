import { useState, useCallback } from 'react'

export function useTweaks(defaults) {
  const [state, setState] = useState(defaults)
  const setTweak = useCallback((key, value) => {
    setState((s) => ({ ...s, [key]: value }))
  }, [])
  return [state, setTweak]
}
