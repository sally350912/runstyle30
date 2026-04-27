import { useState, useRef, useCallback } from 'react'
import type { AppState, DayLog } from '../hooks/useStore'

interface Props {
  state: AppState
  todayLog: DayLog | undefined
  onCheckIn: (km: number, minutes: number) => void
}

export default function HomePage({ state, todayLog, onCheckIn }: Props) {
  const [holding, setHolding]     = useState(false)
  const [holdPct, setHoldPct]     = useState(0)
  const [checkedAnim, setChecked] = useState(state.todayCheckedIn)
  const [showModal, setShowModal] = useState(false)
  const [km, setKm]               = useState('3.2')
  const [minutes, setMinutes]     = useState('28')

  const holdStart = useRef<number>(0)
  const holdTimer = useRef<ReturnType<typeof setInterval>>()

  const done = state.todayCheckedIn || checkedAnim

  const weekKm     = state.logs.slice(-7).reduce((a, l) => a + l.km, 0).toFixed(1)
  const pct        = Math.round((state.currentDay / 30) * 100)
  const displayKm  = todayLog ? todayLog.km      : parseFloat(km)
  const displayMin = todayLog ? todayLog.minutes  : parseFloat(minutes)
  const displayKcal= todayLog ? todayLog.kcal     : Math.round(displayKm * 55)
  const displayBoba= (displayKcal / 230).toFixed(1)

  const startHold = useCallback(() => {
    if (done) return
    holdStart.current = Date.now()
    setHolding(true)
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current
      const p = Math.min(100, (elapsed / 3000) * 100)
      setHoldPct(p)
      if (elapsed >= 3000) {
        clearInterval(holdTimer.current)
        setHolding(false)
        setHoldPct(100)
        setShowModal(true)
      }
    }, 50)
  }, [done])

  const endHold = useCallback(() => {
    if (done) return
    clearInterval(holdTimer.current)
    setHolding(false)
    if (holdPct < 100) setHoldPct(0)
  }, [done, holdPct])

  const handleConfirm = () => {
    const kmVal  = Math.max(0.1, Math.min(99,  parseFloat(km)      || 3.2))
    const minVal = Math.max(1,   Math.min(999, parseFloat(minutes)  || 28))
    setShowModal(false)
    setChecked(true)
    onCheckIn(kmVal, minVal)
  }

  const QUICK_KM  = ['1','2','3','5','10']
  const QUICK_MIN = ['15','20','30','45','60']

  return (
    <div style={{ paddingBottom:24 }}>

      {/* 里程碑橫幅（只顯示天數，無 Reels 字樣） */}
      {[7,14,21,30].includes(state.currentDay) && (
        <div style={{ margin:'0 20px 16px', display:'flex', alignItems:'center', gap:12, borderRadius:14, border:'1px solid rgba(255,158,125,0.3)', background:'rgba(255,158,125,0.1)', padding:'14px 16px' }}>
          <span style={{ fontSize:22 }}>✦</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:500, color:'#3A2820', margin:'0 0 2px' }}>第 {state.currentDay} 天里程碑達成！</p>
            <p style={{ fontSize:11, color:'#9C7B6B', margin:0 }}>恭喜完成這個階段，繼續加油！</p>
          </div>
        </div>
      )}

      {/* 英雄卡 */}
      <div style={{ margin:'0 20px 16px', borderRadius:20, border:'1px solid rgba(255,158,125,0.25)', background:'rgba(255,158,125,0.1)', padding:20 }}>
        <p style={{ fontSize:11, color:'#B89A8E', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:6 }}>今日挑戰</p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:300, color:'#3A2820', lineHeight:1, marginBottom:4 }}>
          {String(state.currentDay).padStart(2,'0')}{' '}
          <span style={{ fontSize:18, fontStyle:'italic', color:'#9C7B6B' }}>/ 30</span>
        </p>
        <p style={{ fontSize:13, color:'#7A5A4E', marginBottom:16 }}>
          連續 {state.streak} 天 · 本週剩餘 {Math.max(0,1-state.restCardsUsed)} 次補卡
        </p>
        <div style={{ background:'#E8DDD8', borderRadius:10, height:6, marginBottom:8 }}>
          <div style={{ width:`${pct}%`, height:'100%', borderRadius:10, background:'linear-gradient(90deg,#FFD4BC,#FF9E7D)' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#B89A8E' }}>
          <span>第 1 天</span><span>{pct}%</span><span>第 30 天</span>
        </div>
      </div>

      {/* 數據格 */}
      <div style={{ margin:'0 20px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { label:'今日里程', val:displayKm,   unit:'km' },
          { label:'珍奶熱量', val:displayBoba, unit:'杯' },
          { label:'本週總計', val:weekKm,      unit:'km' },
          { label:'消耗熱量', val:displayKcal, unit:'kcal' },
        ].map(({ label, val, unit }) => (
          <div key={label} style={{ background:'white', border:'1px solid #E8DDD8', borderRadius:14, padding:14 }}>
            <p style={{ fontSize:10, color:'#B89A8E', letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:4 }}>{label}</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:'#3A2820', lineHeight:1, margin:0 }}>
              {val}<span style={{ fontSize:12, color:'#9C7B6B', marginLeft:3 }}>{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 暖光簽到 */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 4px' }}>
        <button
          onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
          onTouchStart={startHold} onTouchEnd={endHold}
          style={{
            width:80, height:80, borderRadius:'50%', border:'none',
            background: done ? '#C4684A' : '#FF9E7D',
            boxShadow: holding
              ? '0 0 0 14px rgba(255,158,125,0.25),0 0 0 26px rgba(255,158,125,0.08)'
              : '0 0 0 8px rgba(255,158,125,0.15),0 0 0 16px rgba(255,158,125,0.07)',
            cursor: done ? 'default' : 'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            transition:'box-shadow 0.3s,background 0.3s', margin:'0 auto 8px',
          }}
        >
          <span style={{ fontSize:28 }}>{done ? '✓' : '☀️'}</span>
          <span style={{ fontSize:8, color:'white', fontWeight:500, marginTop:2 }}>
            {done ? '已簽到' : '暖光簽到'}
          </span>
        </button>
        <div style={{ width:80, height:3, background:'#E8DDD8', borderRadius:10, margin:'0 auto 6px', overflow:'hidden' }}>
          <div style={{ width:`${holdPct}%`, height:'100%', background:'#FF9E7D', borderRadius:10, transition:'width 0.1s linear' }} />
        </div>
        <p style={{ fontSize:11, color: done ? '#FF9E7D' : '#B89A8E', textAlign:'center' }}>
          {done ? '✓ 今日能量已注入！' : '長按 3 秒完成今日簽到'}
        </p>
      </div>

      {/* 跑步記錄輸入彈窗 */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(58,40,32,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ width:'100%', maxWidth:390, background:'#FFF8F4', borderRadius:'24px 24px 0 0', padding:'28px 24px 40px', boxShadow:'0 -8px 32px rgba(58,40,32,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, color:'#3A2820', margin:'0 0 2px' }}>今日跑步記錄 ☀️</p>
                <p style={{ fontSize:12, color:'#9C7B6B', margin:0 }}>填入今天的成果，一起點亮 Day {state.currentDay}！</p>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width:32, height:32, borderRadius:'50%', border:'1px solid #E8DDD8', background:'white', cursor:'pointer', fontSize:14, color:'#B89A8E', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>

            {/* 里程 */}
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E', marginBottom:10 }}>跑步里程</p>
              <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                {QUICK_KM.map(v => (
                  <button key={v} onClick={() => setKm(v)}
                    style={{ flex:1, padding:'7px 4px', borderRadius:10, border: km===v ? '1.5px solid #FF9E7D' : '1px solid #E8DDD8', background: km===v ? '#FFF5F0' : 'white', fontSize:12, fontWeight: km===v ? 500 : 400, color: km===v ? '#C4684A' : '#7A5A4E', cursor:'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', background:'white', border:'1px solid #E8DDD8', borderRadius:14, padding:'0 16px', height:52 }}>
                <input type="number" min="0.1" max="99" step="0.1" value={km} onChange={e => setKm(e.target.value)}
                  style={{ flex:1, border:'none', background:'transparent', fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#3A2820', outline:'none' }} placeholder="3.2"/>
                <span style={{ fontSize:14, color:'#9C7B6B', fontWeight:500 }}>km</span>
              </div>
            </div>

            {/* 時間 */}
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:11, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E', marginBottom:10 }}>跑步時間</p>
              <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                {QUICK_MIN.map(v => (
                  <button key={v} onClick={() => setMinutes(v)}
                    style={{ flex:1, padding:'7px 4px', borderRadius:10, border: minutes===v ? '1.5px solid #FF9E7D' : '1px solid #E8DDD8', background: minutes===v ? '#FFF5F0' : 'white', fontSize:12, fontWeight: minutes===v ? 500 : 400, color: minutes===v ? '#C4684A' : '#7A5A4E', cursor:'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', background:'white', border:'1px solid #E8DDD8', borderRadius:14, padding:'0 16px', height:52 }}>
                <input type="number" min="1" max="999" step="1" value={minutes} onChange={e => setMinutes(e.target.value)}
                  style={{ flex:1, border:'none', background:'transparent', fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#3A2820', outline:'none' }} placeholder="28"/>
                <span style={{ fontSize:14, color:'#9C7B6B', fontWeight:500 }}>分鐘</span>
              </div>
            </div>

            {/* 預估熱量 */}
            <div style={{ background:'rgba(255,158,125,0.08)', border:'1px solid rgba(255,158,125,0.2)', borderRadius:12, padding:'10px 16px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#9C7B6B' }}>預估消耗</span>
              <div style={{ display:'flex', gap:12 }}>
                <span style={{ fontSize:13, fontWeight:500, color:'#3A2820' }}>{Math.round((parseFloat(km)||0)*55)} kcal</span>
                <span style={{ fontSize:13, color:'#9C7B6B' }}>≈</span>
                <span style={{ fontSize:13, fontWeight:500, color:'#FF9E7D' }}>🧋 {((parseFloat(km)||0)*55/230).toFixed(1)} 杯珍奶</span>
              </div>
            </div>

            {/* 確認 */}
            <button onClick={handleConfirm}
              style={{ width:'100%', height:56, borderRadius:20, border:'none', background:'linear-gradient(135deg,#FFD2B8,#FF9E7D 45%,#E87A5C)', boxShadow:'0 8px 20px -8px rgba(232,122,92,0.5),inset 0 1px 0 rgba(255,255,255,0.4)', color:'white', fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontStyle:'italic', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              ☀️ 注入今日能量！
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
