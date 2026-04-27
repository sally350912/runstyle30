import { useState, useEffect, useCallback } from 'react'
import type { ShareStyleId, PlaylistId } from '../lib/tokens'

export interface DayLog {
  date: string
  km: number
  minutes: number
  kcal: number
  playlistId: PlaylistId
  shareStyleId: ShareStyleId
  checkedIn: boolean
}

export interface AppState {
  currentDay: number
  streak: number
  restCardsUsed: number
  logs: DayLog[]
  activePlaylist: PlaylistId
  activeShareStyle: ShareStyleId
  quoteIndex: number
  todayCheckedIn: boolean
}

const DEFAULT_STATE: AppState = {
  currentDay: 1,
  streak: 0,
  restCardsUsed: 0,
  logs: [],
  activePlaylist: 'dawn',
  activeShareStyle: 'sunset-beach',
  quoteIndex: 0,
  todayCheckedIn: false,
}

const KEY = 'runstyle30_state'

// 以 55kg、MET 8.2 計算跑步消耗熱量
function calcKcal(km: number, minutes: number): number {
  const met = 8.2
  const kg  = 55
  const hrs = minutes / 60
  return Math.round(met * kg * hrs)
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    const saved = JSON.parse(raw) as Partial<AppState>
    const today = new Date().toISOString().split('T')[0]
    const lastLog = saved.logs?.at(-1)
    const todayCheckedIn = lastLog?.date === today && lastLog.checkedIn
    return { ...DEFAULT_STATE, ...saved, todayCheckedIn: !!todayCheckedIn }
  } catch {
    return DEFAULT_STATE
  }
}

export function useStore() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const checkIn = useCallback((km = 3.2, minutes = 28) => {
    const today = new Date().toISOString().split('T')[0]
    const kcal  = calcKcal(km, minutes)
    setState(prev => {
      const log: DayLog = {
        date: today, km, minutes, kcal,
        playlistId: prev.activePlaylist,
        shareStyleId: prev.activeShareStyle,
        checkedIn: true,
      }
      const logs = [...prev.logs.filter(l => l.date !== today), log]
      return {
        ...prev, logs,
        streak: prev.streak + (prev.todayCheckedIn ? 0 : 1),
        currentDay: Math.min(30, prev.currentDay + (prev.todayCheckedIn ? 0 : 1)),
        todayCheckedIn: true,
      }
    })
  }, [])

  const setPlaylist = useCallback((id: PlaylistId) => {
    setState(prev => ({ ...prev, activePlaylist: id }))
  }, [])

  const setShareStyle = useCallback((id: ShareStyleId) => {
    setState(prev => ({ ...prev, activeShareStyle: id }))
  }, [])

  const nextQuote = useCallback((total: number) => {
    setState(prev => ({ ...prev, quoteIndex: (prev.quoteIndex + 1) % total }))
  }, [])

  const todayLog = state.logs.find(
    l => l.date === new Date().toISOString().split('T')[0]
  )

  return { state, todayLog, checkIn, setPlaylist, setShareStyle, nextQuote }
}
