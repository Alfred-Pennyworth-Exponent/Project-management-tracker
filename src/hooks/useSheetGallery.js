import { useState, useCallback } from 'react'
import { SHEET_ID } from '../config.js'

const STORAGE_KEY_LIST    = 'projectSheets'
const STORAGE_KEY_CURRENT = 'currentSheetId'

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_LIST) || '[]')
  } catch {
    return []
  }
}

function saveProjects(list) {
  localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(list))
}

export function useSheetGallery() {
  const [projects, setProjects] = useState(loadProjects)

  const currentId = localStorage.getItem(STORAGE_KEY_CURRENT) || SHEET_ID

  const currentProject = projects.find(p => p.id === currentId) || null

  const addProject = useCallback((project) => {
    setProjects(prev => {
      const next = [...prev, project]
      saveProjects(next)
      return next
    })
  }, [])

  const removeProject = useCallback((id) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      saveProjects(next)
      // If removed project was active, fall back to default
      if (localStorage.getItem(STORAGE_KEY_CURRENT) === id) {
        const fallback = next[0]?.id || SHEET_ID
        localStorage.setItem(STORAGE_KEY_CURRENT, fallback)
      }
      return next
    })
  }, [])

  const switchProject = useCallback((id) => {
    localStorage.setItem(STORAGE_KEY_CURRENT, id)
    window.location.reload()
  }, [])

  return {
    projects,
    currentId,
    currentProject,
    addProject,
    removeProject,
    switchProject,
  }
}
