import { useState, useEffect, useCallback, useRef } from 'react'
import { readSheet } from '../services/sheets.js'
import { SHEET_ID } from '../config.js'
import { signOut } from '../services/auth.js'

export function useSheets(sheetNames, token, sheetId = null, onTokenChange = null) {
  const id = sheetId || SHEET_ID

  const [data,     setData]     = useState({})
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        sheetNames.map(name => readSheet(name, token, id).then(rows => [name, rows]))
      )
      if (!mountedRef.current) return
      setData(Object.fromEntries(results))
      setLastSync(new Date())
    } catch (e) {
      if (!mountedRef.current) return
      if (e.message === 'AUTH_EXPIRED') {
        // Token expired — sign out so user sees Sign In prompt
        if (onTokenChange) signOut(onTokenChange)
        setError('Session expired. Please sign in again.')
      } else {
        setError(e.message)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [sheetNames.join(','), token, id, onTokenChange])

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, lastSync, refresh: fetch }
}
