import { useRef, useState } from 'react'
import { SHARE_STYLES, QUOTES } from '../lib/tokens'
import type { ShareStyleId } from '../lib/tokens'
import type { AppState, DayLog } from '../hooks/useStore'

interface Props {
  state: AppState
  todayLog: DayLog | undefined
  onStyleChange: (id: ShareStyleId) => void
  onNextQuote: () => void
}

export default function SharePage({ state, todayLog, onStyleChange, onNextQuote }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const style   = SHARE_STYLES.find(s => s.id === state.activeShareStyle) ?? SHARE_STYLES[0]
  const quote   = QUOTES[state.quoteIndex % QUOTES.length]
  const km      = todayLog?.km ?? 3.2
  const minutes = todayLog?.minutes ?? 28
  const kcal    = todayLog?.kcal ?? 184
  const boba    = (kcal / 230).toFixed(1)
  const dayStr  = String(state.currentDay).padStart(2, '0')

  const handleDownload = async () => {
    if (saving) return
    setSaving(true)
    setSaved(false)

    try {
      const W = 1080
      const H = 1920
      const canvas = document.createElement('canvas')
      canvas.width  = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!

      // 1. 背景漸層
      const bgMap: Record<string, [number, string][]> = {
        'sunset-beach': [[0,'#C45A18'],[0.18,'#E8822A'],[0.35,'#F5A848'],[0.52,'#F7C870'],[0.68,'#E89050'],[0.84,'#A84820'],[1,'#5A2008']],
        'city-dawn':    [[0,'#1A2A40'],[0.15,'#2A3E5A'],[0.3,'#3A5070'],[0.45,'#6A7860'],[0.6,'#A89858'],[0.72,'#C8A848'],[0.85,'#7A5828'],[1,'#2A1808']],
        'forest-mist':  [[0,'#0E1E10'],[0.12,'#1E3018'],[0.25,'#2E4822'],[0.4,'#486838'],[0.55,'#6A8850'],[0.68,'#90A870'],[0.8,'#C8C8A0'],[1,'#485830']],
        'night-lights': [[0,'#050508'],[0.12,'#0E0E18'],[0.25,'#181520'],[0.38,'#221820'],[0.52,'#302015'],[0.65,'#483018'],[0.78,'#604020'],[0.9,'#301808'],[1,'#080508']],
      }
      const stops = bgMap[style.id] ?? bgMap['sunset-beach']
      const grad = ctx.createLinearGradient(0, 0, W * 0.7, H)
      stops.forEach(([s, c]) => grad.addColorStop(s, c))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // 2. 光暈
      const drawOrb = (cx: number, cy: number, r: number, color: string) => {
        const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        orb.addColorStop(0, color + '55')
        orb.addColorStop(1, color + '00')
        ctx.fillStyle = orb
        ctx.fillRect(0, 0, W, H)
      }
      drawOrb(W * 0.75, H * 0.12, 420, style.orb1.color)
      drawOrb(W * 0.15, H * 0.60, 300, style.orb2.color)

      // 3. 暗角
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.75)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      const PAD = 80

      // 4. 天數標籤
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      rrect(ctx, PAD, PAD, 290, 72, 36); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 2
      rrect(ctx, PAD, PAD, 290, 72, 36); ctx.stroke()
      ctx.fillStyle = 'white'
      ctx.font = '500 34px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Day ${dayStr} / 30`, PAD + 26, PAD + 48)

      // 5. 品牌名
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.font = 'italic 300 42px serif'
      ctx.textAlign = 'right'
      ctx.fillText('RunStyle', W - PAD, PAD + 48)

      // 6. 金句
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.font = 'italic 300 58px serif'
      ctx.textAlign = 'left'
      const quoteY = H * 0.50
      const lines  = wrapText(ctx, quote, W - PAD * 2)
      lines.forEach((line, i) => ctx.fillText(line, PAD, quoteY + i * 84))

      // 7. 數據
      const dataY = quoteY + lines.length * 84 + 64
      ;[{v:String(km),u:'KM'},{v:String(minutes),u:'MIN'},{v:String(kcal),u:'KCAL'}].forEach(({v,u},i) => {
        const x = PAD + i * 300
        ctx.fillStyle = 'white'
        ctx.font = '300 100px serif'
        ctx.textAlign = 'left'
        ctx.fillText(v, x, dataY)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '500 28px sans-serif'
        ctx.fillText(u, x, dataY + 44)
      })

      // 8. 分隔線
      const lineY = dataY + 76
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(PAD, lineY); ctx.lineTo(W - PAD, lineY); ctx.stroke()

      // 9. 珍奶區塊
      const bobaY = H - PAD - 140
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      rrect(ctx, PAD, bobaY, 290, 124, 24); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2
      rrect(ctx, PAD, bobaY, 290, 124, 24); ctx.stroke()
      ctx.fillStyle = 'white'
      ctx.font = '500 54px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(`${boba} 杯`, PAD + 26, bobaY + 68)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '400 28px sans-serif'
      ctx.fillText('珍珠奶茶熱量', PAD + 26, bobaY + 106)

      // 10. 下載
      const link = document.createElement('a')
      link.download = `RunStyle30_Day${dayStr}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()

      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      console.error('下載失敗：', err)
      alert('下載失敗，請確認瀏覽器允許下載')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ paddingBottom: 24 }}>

      <p style={{ margin:'0 20px 10px', fontSize:10, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E' }}>選擇底圖風格</p>
      <div style={{ margin:'0 20px 10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
        {SHARE_STYLES.map(s => {
          const active = s.id === state.activeShareStyle
          return (
            <button key={s.id} onClick={() => onStyleChange(s.id)}
              style={{ padding:'9px 6px', borderRadius:11, border: active ? '1.5px solid #FF9E7D' : '1px solid #E8DDD8', background: active ? '#FFF5F0' : 'white', cursor:'pointer', textAlign:'center', lineHeight:1.5 }}>
              <div style={{ fontSize:16 }}>{s.emoji}</div>
              <div style={{ fontSize:10, fontWeight:500, color: active ? '#C4684A' : '#7A5A4E', marginTop:2 }}>{s.name}</div>
              <div style={{ fontSize:9, color:'#B89A8E', marginTop:1 }}>{s.sub}</div>
            </button>
          )
        })}
      </div>

      <p style={{ margin:'0 20px 10px', fontSize:11, color:'#B89A8E', textAlign:'center', fontStyle:'italic' }}>{style.mood}</p>

      {/* 打卡卡片預覽 */}
      <div ref={cardRef} style={{ margin:'0 20px 12px', borderRadius:20, overflow:'hidden', aspectRatio:'9/16', maxHeight:380, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:style.bg }} />
        <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(38px)', opacity:0.32, width:style.orb1.size, height:style.orb1.size, background:style.orb1.color, top:style.orb1.top, left:style.orb1.left }} />
        <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(38px)', opacity:0.32, width:style.orb2.size, height:style.orb2.size, background:style.orb2.color, top:style.orb2.top, left:style.orb2.left }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.5) 100%)' }} />
        <div style={{ position:'absolute', inset:0, padding:22, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.32)', color:'white', fontSize:11, fontWeight:500, padding:'5px 13px', borderRadius:20 }}>
              Day {dayStr} / 30
            </div>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:'rgba(255,255,255,0.65)', fontStyle:'italic' }}>RunStyle</span>
          </div>
          <div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontStyle:'italic', color:'white', lineHeight:1.6, marginBottom:14, fontWeight:300 }}>{quote}</p>
            <div style={{ display:'flex', gap:18 }}>
              {[{v:km,u:'km'},{v:minutes,u:'min'},{v:kcal,u:'kcal'}].map(({v,u}) => (
                <div key={u}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:300, lineHeight:1, color:'white', margin:0 }}>{v}</p>
                  <p style={{ fontSize:9, letterSpacing:'1px', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginTop:2 }}>{u}</p>
                </div>
              ))}
            </div>
            <div style={{ height:1, background:'rgba(255,255,255,0.15)', margin:'12px 0' }} />
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:12, padding:'8px 12px', color:'white' }}>
              <p style={{ fontSize:17, fontWeight:500, margin:'0 0 1px' }}>{boba} 杯</p>
              <p style={{ fontSize:9, opacity:0.7, margin:0 }}>珍珠奶茶熱量</p>
            </div>
            <button onClick={onNextQuote}
              style={{ border:'none', borderRadius:11, padding:'9px 14px', fontSize:11, fontWeight:500, cursor:'pointer', background:style.igBg, color:style.igColor }}>
              換金句 ✨
            </button>
          </div>
        </div>
      </div>

      {/* 按鈕區 */}
      <div style={{ margin:'0 20px 12px', display:'flex', flexDirection:'column', gap:10 }}>
        <button onClick={handleDownload} disabled={saving}
          style={{
            width:'100%', height:54, borderRadius:20, border:'none',
            cursor: saving ? 'wait' : 'pointer',
            background: saved
              ? 'linear-gradient(135deg,#A8C878,#507840)'
              : 'linear-gradient(135deg,#FFD2B8,#FF9E7D 45%,#E87A5C)',
            boxShadow:'0 8px 20px -8px rgba(232,122,92,0.45),inset 0 1px 0 rgba(255,255,255,0.4)',
            color:'white', fontFamily:"'Cormorant Garamond',serif",
            fontSize:18, fontStyle:'italic',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            opacity: saving ? 0.75 : 1, transition:'background 0.3s',
          }}>
          {saving ? '⏳ 正在生成圖片…'
           : saved  ? '✓ 已儲存到下載資料夾！'
           : <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>下載打卡卡片 PNG</>
          }
        </button>
        <button style={{ width:'100%', height:50, borderRadius:20, border:'1px solid #C4684A', background:'transparent', color:'#C4684A', fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontStyle:'italic', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="3" stroke="#C4684A" strokeWidth="1.3"/><circle cx="7" cy="7" r="2.5" stroke="#C4684A" strokeWidth="1.3"/><circle cx="10.5" cy="3.5" r="0.7" fill="#C4684A"/></svg>
          開啟 Instagram 上傳
        </button>
      </div>

      {/* 成功提示 */}
      {saved && (
        <div style={{ margin:'0 20px 12px', background:'rgba(168,200,120,0.12)', border:'1px solid rgba(168,200,120,0.3)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>🎉</span>
          <div>
            <p style={{ fontSize:12, fontWeight:500, color:'#385820', margin:'0 0 2px' }}>卡片已下載！</p>
            <p style={{ fontSize:11, color:'#507840', margin:0 }}>開啟 IG → 新增限時動態 → 從相簿選取圖片</p>
          </div>
        </div>
      )}

      {/* 金句庫 */}
      <p style={{ margin:'0 20px 10px', fontSize:10, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E' }}>金句庫</p>
      <div style={{ margin:'0 20px', display:'flex', flexDirection:'column', gap:8 }}>
        {QUOTES.slice(0,3).map((q, i) => (
          <div key={i} style={{ background:'white', border:'1px solid #E8DDD8', borderLeft:'3px solid #FF9E7D', borderRadius:'0 12px 12px 0', padding:'12px 14px' }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14, fontStyle:'italic', color:'#3A2820', lineHeight:1.5, margin:0 }}>{q}</p>
          </div>
        ))}
        <button onClick={onNextQuote}
          style={{ width:'100%', background:'none', border:'1px solid #E8DDD8', borderRadius:10, padding:'9px 16px', fontSize:12, color:'#9C7B6B', cursor:'pointer', marginTop:4 }}>
          換一句金句 ✨
        </button>
      </div>
    </div>
  )
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const char of [...text]) {
    const test = current + char
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = char
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
