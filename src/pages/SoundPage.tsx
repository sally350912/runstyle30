import { useState } from 'react'
import { PLAYLISTS } from '../lib/tokens'
import type { PlaylistId } from '../lib/tokens'

interface Props {
  onPlaylistChange: (id: PlaylistId) => void
}

export default function SoundPage({ onPlaylistChange }: Props) {
  const [playing, setPlaying] = useState<PlaylistId | null>(null)

  const handlePlay = (id: PlaylistId) => {
    const next = playing === id ? null : id
    setPlaying(next)
    if (next) onPlaylistChange(next)
  }

  return (
    <div style={{ paddingBottom:24 }}>
      <p style={{ margin:'0 20px 10px', fontSize:10, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E' }}>Sound of Run</p>
      <div style={{ margin:'0 20px 20px', display:'flex', flexDirection:'column', gap:8 }}>
        {PLAYLISTS.map(pl => {
          const on = playing === pl.id
          return (
            <button key={pl.id} onClick={() => handlePlay(pl.id)}
              style={{ display:'flex', alignItems:'center', gap:12, background:'white', border: on ? '1.5px solid #FF9E7D' : '1px solid #E8DDD8', borderRadius:14, padding:'14px 16px', cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:pl.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{pl.emoji}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:500, color:'#3A2820', margin:'0 0 2px' }}>{pl.name}</p>
                <p style={{ fontSize:11, color:'#B89A8E', margin:0 }}>{pl.bpm} BPM · {pl.desc}</p>
              </div>
              <div style={{ width:28, height:28, borderRadius:'50%', background: on ? '#FF9E7D' : 'white', border: on ? '1px solid #FF9E7D' : '1px solid #E8DDD8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color: on ? 'white' : '#FF9E7D', flexShrink:0 }}>
                {on ? '⏸' : '▶'}
              </div>
            </button>
          )
        })}
      </div>

      <p style={{ margin:'0 20px 10px', fontSize:10, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E' }}>本週最常播放</p>
      <div style={{ margin:'0 20px', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, background:'white', border:'1px solid #E8DDD8', borderRadius:14, padding:'12px 14px' }}>
          <span style={{ fontSize:22 }}>🎵</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:500, color:'#3A2820', margin:'0 0 2px' }}>Golden Hour</p>
            <p style={{ fontSize:11, color:'#B89A8E', margin:0 }}>JVKE · 播放 14 次</p>
          </div>
          <span style={{ fontSize:11, fontWeight:500, color:'#FF9E7D' }}>🔥 熱門</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, background:'white', border:'1px solid #E8DDD8', borderRadius:14, padding:'12px 14px' }}>
          <span style={{ fontSize:22 }}>🎵</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:500, color:'#3A2820', margin:'0 0 2px' }}>Hummingbird</p>
            <p style={{ fontSize:11, color:'#B89A8E', margin:0 }}>LocalSound · 播放 9 次</p>
          </div>
        </div>
      </div>
    </div>
  )
}
