import type { AppState } from '../hooks/useStore'

const CELL_COLORS = [
  '#FFE4D4','#FFD4BC','#FFC4A4','#FFB48C',
  '#FFA474','#FF9E7D','#F08E6D','#E07E5D',
  '#D06E4D','#C46040',
]
const MILESTONE_DAYS = [7, 14, 21, 30]

export default function WallPage({ state }: { state: AppState }) {
  const done = state.currentDay

  return (
    <div style={{ paddingBottom:24 }}>

      {/* 標題 */}
      <div style={{ margin:'0 20px 16px', textAlign:'center' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#3A2820', margin:'0 0 4px' }}>成就牆</h2>
        <p style={{ fontSize:12, color:'#B89A8E', margin:0 }}>點亮全部 30 格，解鎖終極暖光勳章</p>
      </div>

      {/* 30 格拼圖 */}
      <div style={{ margin:'0 20px 16px', display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:6 }}>
        {Array.from({ length:30 }, (_,i) => {
          const day    = i + 1
          const isDone = day <= done
          const isMile = MILESTONE_DAYS.includes(day)
          return (
            <div key={day}
              style={{
                aspectRatio:'1', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:9, fontWeight:500, position:'relative', cursor: isDone ? 'pointer' : 'default',
                background: isDone ? CELL_COLORS[Math.min(i,9)] : '#E8DDD8',
                color: isDone ? '#7A3020' : '#B89A8E',
                boxShadow: day === done+1 ? '0 0 0 2px #FF9E7D' : 'none',
                transition:'transform 0.18s',
              }}
              onMouseEnter={e => isDone && ((e.currentTarget as HTMLElement).style.transform='scale(1.12)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform='scale(1)')}>
              {day}
              {isMile && (
                <span style={{ position:'absolute', top:2, right:3, fontSize:7, color: isDone ? 'rgba(255,255,255,0.9)' : '#B89A8E' }}>✦</span>
              )}
            </div>
          )
        })}
      </div>
      <p style={{ margin:'0 20px 16px', fontSize:10, color:'#B89A8E', textAlign:'center', letterSpacing:'1px' }}>✦ 里程碑日 · Day 7 · 14 · 21 · 30</p>

      {/* 補卡機會 */}
      <div style={{ margin:'0 20px 16px', background:'white', border:'1px solid #E8DDD8', borderRadius:20, padding:16, textAlign:'center' }}>
        <p style={{ fontSize:11, color:'#B89A8E', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:10 }}>本週補卡機會</p>
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:8 }}>
          {[0,1].map(i => {
            const used = i < state.restCardsUsed
            return (
              <div key={i} style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: used ? 14 : 11, background: used ? '#FF9E7D' : '#E8DDD8', border: used ? 'none' : '1px dashed #9C7B6B', color: used ? 'white' : '#B89A8E' }}>
                {used ? '✓' : '?'}
              </div>
            )
          })}
        </div>
        <p style={{ fontSize:11, color:'#9C7B6B', margin:0 }}>本週已使用 {state.restCardsUsed} 次 · 剩餘 {Math.max(0,1-state.restCardsUsed)} 次</p>
      </div>

      {/* 終極勳章 */}
      <div style={{ margin:'0 20px', background:'rgba(255,158,125,0.1)', border:'1px solid rgba(255,158,125,0.2)', borderRadius:14, padding:16, textAlign:'center' }}>
        <p style={{ fontSize:32, margin:'0 0 6px' }}>{done >= 30 ? '🏅' : '🔒'}</p>
        <p style={{ fontSize:13, fontWeight:500, color:'#3A2820', margin:'0 0 4px' }}>終極暖光勳章</p>
        <p style={{ fontSize:11, color:'#9C7B6B', margin:0 }}>
          {done >= 30 ? '恭喜解鎖！妳做到了 🎉' : `完成全部 30 天後解鎖（剩餘 ${30-done} 天）`}
        </p>
      </div>
    </div>
  )
}
