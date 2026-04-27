// src/App.tsx
import { useState, useCallback } from 'react'
import { useStore } from './hooks/useStore'
import HomePage       from './pages/HomePage'
import SoundPage      from './pages/SoundPage'
import SharePage      from './pages/SharePage'
import WallPage       from './pages/WallPage'
import MilestoneModal from './components/MilestoneModal'
import { QUOTES }     from './lib/tokens'
import type { ShareStyleId, PlaylistId } from './lib/tokens'

type TabId = 'home' | 'sound' | 'share' | 'wall'

const TABS: { id: TabId; label: string }[] = [
  { id:'home',  label:'今日' },
  { id:'sound', label:'音樂' },
  { id:'share', label:'打卡' },
  { id:'wall',  label:'成就牆' },
]

const MILESTONE_DAYS = [7, 14, 21, 30]

export default function App() {
  const [tab, setTab]        = useState<TabId>('home')
  const [milestone, setMile] = useState<number | null>(null)
  const { state, todayLog, checkIn, setPlaylist, setShareStyle, nextQuote } = useStore()

  const handleCheckIn = useCallback((km: number, minutes: number) => {
    checkIn(km, minutes)
    const nextDay = state.currentDay + (state.todayCheckedIn ? 0 : 1)
    if (MILESTONE_DAYS.includes(nextDay)) {
      setTimeout(() => setMile(nextDay), 600)
    }
  }, [checkIn, state.currentDay, state.todayCheckedIn])

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#FFF8F4', minHeight:'100dvh', maxWidth:390, margin:'0 auto', display:'flex', flexDirection:'column' }}>

      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 12px' }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:'#3A2820', margin:0 }}>
          Run<span style={{ color:'#FF9E7D', fontStyle:'italic' }}>Style</span> 30
        </h1>
        <div style={{ background:'#FF9E7D', color:'white', fontSize:11, fontWeight:500, padding:'4px 10px', borderRadius:20 }}>
          Day {String(state.currentDay).padStart(2,'0')} / 30
        </div>
      </header>

      <nav style={{ display:'flex', padding:'0 20px', borderBottom:'1px solid #E8DDD8' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontSize:12, padding:'8px 12px', border:'none', background:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", borderBottom: tab===t.id ? '2px solid #FF9E7D' : '2px solid transparent', color: tab===t.id ? '#FF9E7D' : '#B89A8E', fontWeight: tab===t.id ? 500 : 400, transition:'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ flex:1, overflowY:'auto', paddingTop:20 }}>
        {tab==='home'  && <HomePage  state={state} todayLog={todayLog} onCheckIn={handleCheckIn} />}
        {tab==='sound' && <SoundPage state={state} onPlaylistChange={(id: PlaylistId) => setPlaylist(id)} />}
        {tab==='share' && <SharePage state={state} todayLog={todayLog} onStyleChange={(id: ShareStyleId) => setShareStyle(id)} onNextQuote={() => nextQuote(QUOTES.length)} />}
        {tab==='wall'  && <WallPage  state={state} />}
      </main>

      {milestone !== null && (
        <MilestoneModal day={milestone} onClose={() => setMile(null)} />
      )}
    </div>
  )
}
