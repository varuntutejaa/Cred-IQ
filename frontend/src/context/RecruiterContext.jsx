import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const KEY_CANDIDATES = 'ciq_r_candidates'
const KEY_SHORTLISTS = 'ciq_r_shortlists'

const RecruiterContext = createContext(null)

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export function RecruiterProvider({ children }) {
  const [candidates, setCandidates] = useState(() => load(KEY_CANDIDATES, []))
  const [shortlists, setShortlists] = useState(() => load(KEY_SHORTLISTS, []))

  useEffect(() => { localStorage.setItem(KEY_CANDIDATES, JSON.stringify(candidates)) }, [candidates])
  useEffect(() => { localStorage.setItem(KEY_SHORTLISTS, JSON.stringify(shortlists)) }, [shortlists])

  const addCandidate = useCallback((candidate) => {
    setCandidates(prev => {
      const exists = prev.find(c => c.username === candidate.username)
      if (exists) {
        return prev.map(c => c.username === candidate.username ? { ...candidate, verified_at: new Date().toISOString() } : c)
      }
      return [{ ...candidate, verified_at: new Date().toISOString() }, ...prev]
    })
  }, [])

  const removeCandidate = useCallback((username) => {
    setCandidates(prev => prev.filter(c => c.username !== username))
    setShortlists(prev => prev.map(sl => ({
      ...sl,
      candidateHandles: sl.candidateHandles.filter(h => h !== username),
    })))
  }, [])

  const createShortlist = useCallback((name, color = '#6366f1') => {
    const sl = { id: Date.now().toString(), name, color, candidateHandles: [] }
    setShortlists(prev => [...prev, sl])
    return sl
  }, [])

  const deleteShortlist = useCallback((id) => {
    setShortlists(prev => prev.filter(sl => sl.id !== id))
  }, [])

  const addToShortlist = useCallback((listId, username) => {
    setShortlists(prev => prev.map(sl =>
      sl.id === listId
        ? { ...sl, candidateHandles: sl.candidateHandles.includes(username) ? sl.candidateHandles : [...sl.candidateHandles, username] }
        : sl
    ))
  }, [])

  const removeFromShortlist = useCallback((listId, username) => {
    setShortlists(prev => prev.map(sl =>
      sl.id === listId
        ? { ...sl, candidateHandles: sl.candidateHandles.filter(h => h !== username) }
        : sl
    ))
  }, [])

  const getCandidatesByShortlist = useCallback((listId) => {
    const sl = shortlists.find(s => s.id === listId)
    if (!sl) return []
    return sl.candidateHandles.map(h => candidates.find(c => c.username === h)).filter(Boolean)
  }, [shortlists, candidates])

  return (
    <RecruiterContext.Provider value={{
      candidates, shortlists,
      addCandidate, removeCandidate,
      createShortlist, deleteShortlist,
      addToShortlist, removeFromShortlist,
      getCandidatesByShortlist,
    }}>
      {children}
    </RecruiterContext.Provider>
  )
}

export const useRecruiter = () => {
  const ctx = useContext(RecruiterContext)
  if (!ctx) throw new Error('useRecruiter must be used inside RecruiterProvider')
  return ctx
}
