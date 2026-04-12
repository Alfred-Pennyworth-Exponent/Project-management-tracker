import { useState, useCallback, useRef } from 'react'
import { batchWrite, appendRows } from '../services/sheets.js'
import { SHEET_ID } from '../config.js'

export function useSave(token, sheetId = null) {
  const id = sheetId || SHEET_ID

  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const timeoutRef = useRef(null)
  const queueRef   = useRef([])

  const save = useCallback(async (updates) => {
    if (!token) return
    clearTimeout(timeoutRef.current)
    queueRef.current = [...queueRef.current, ...updates]

    timeoutRef.current = setTimeout(async () => {
      const batch = [...queueRef.current]
      queueRef.current = []
      setSaveState('saving')
      try {
        await batchWrite(batch, token, id)
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } catch {
        setSaveState('error')
        setTimeout(() => setSaveState('idle'), 4000)
      }
    }, 600)
  }, [token, id])

  const append = useCallback(async (sheetName, rows) => {
    if (!token) return
    setSaveState('saving')
    try {
      await appendRows(sheetName, rows, token, id)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 4000)
    }
  }, [token, id])

  return { save, append, saveState }
}
