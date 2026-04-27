// src/components/MilestoneModal.tsx
// RunStyle 30 — 里程碑慶祝動畫（第 7/14/21/30 天）

import { useEffect, useRef, useState } from 'react'

interface Props {
  day: number
  onClose: () => void
}

const MILESTONE_COPY: Record<number, { title: string; sub: string; emoji: string; color: string }> = {
  7:  { title: '第一週完成！',   sub: '連續七天，習慣正在成形',     emoji: '🌅', color: '#FF9E7D' },
  14: { title: '兩週達成！',     sub: '妳已經跑過了半座城市的距離', emoji: '🌇', color: '#C4684A' },
  21: { title: '三週里程碑！',   sub: '21 天，新的自己正在誕生',    emoji: '🌲', color: '#6A8850' },
  30: { title: '30 天圓滿！🏅', sub: '妳做到了，這是屬於妳的成就', emoji: '☀️', color: '#E87A5C' },
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  rotation: number
  vr: number
}

const CONFETTI_COLORS = ['#FF9E7D','#FFD4BC','#C4684A','#F7C870','#A8C878','#FFB48C','#E07E5D','#90A870']

export default function MilestoneModal({ day, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const frameRef  = useRef<number>()
  const [visible, setVisible] = useState(false)

  const copy = MILESTONE_COPY[day] ?? MILESTONE_COPY[7]

  // 入場動畫
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // 彩紙粒子動畫
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = () => {
      for (let i = 0; i < 8; i++) {
        particles.current.push({
          id:       Math.random(),
          x:        Math.random() * canvas.width,
          y:        -20,
          vx:       (Math.random() - 0.5) * 3,
          vy:       Math.random() * 3 + 2,
          size:     Math.random() * 8 + 4,
          color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          opacity:  1,
          rotation: Math.random() * 360,
          vr:       (Math.random() - 0.5) * 8,
        })
      }
    }

    const spawnInterval = setInterval(spawn, 200)
    spawn()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter(p => p.opacity > 0.05)

      for (const p of particles.current) {
        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.08
        p.rotation += p.vr
        if (p.y > canvas.height * 0.7) p.opacity -= 0.02

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle   = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }

      frameRef.current = requestAnimationFrame(animate)
    }
    animate()

    const stopSpawn = setTimeout(() => clearInterval(spawnInterval), 3000)

    return () => {
      clearInterval(spawnInterval)
      clearTimeout(stopSpawn)
      cancelAnimationFrame(frameRef.current!)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(58,40,32,0.6)',
      transition:'opacity 0.3s',
      opacity: visible ? 1 : 0,
    }}>
      {/* 彩紙 */}
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:201 }} />

      {/* 卡片 */}
      <div style={{
        position:'relative', zIndex:202,
        width:'calc(100% - 48px)', maxWidth:340,
        background:'#FFF8F4',
        borderRadius:28,
        padding:'36px 28px 28px',
        textAlign:'center',
        boxShadow:'0 24px 60px rgba(58,40,32,0.25)',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
        transition:'transform 0.35s cubic-bezier(0.2,0.7,0.3,1)',
      }}>

        {/* 光暈圓圈 */}
        <div style={{
          width:100, height:100, borderRadius:'50%', margin:'0 auto 20px',
          background:`radial-gradient(circle, ${copy.color}33 0%, ${copy.color}00 70%)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:52,
          boxShadow:`0 0 0 12px ${copy.color}18, 0 0 0 24px ${copy.color}0A`,
        }}>
          {copy.emoji}
        </div>

        {/* 天數標籤 */}
        <p style={{ fontSize:11, letterSpacing:'2px', textTransform:'uppercase', color:copy.color, fontWeight:600, marginBottom:8 }}>
          ✦ DAY {String(day).padStart(2,'0')} MILESTONE
        </p>

        {/* 標題 */}
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:300, color:'#3A2820', lineHeight:1.2, margin:'0 0 10px' }}>
          {copy.title}
        </h2>

        {/* 副標題 */}
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontStyle:'italic', color:'#9C7B6B', lineHeight:1.5, margin:'0 0 24px' }}>
          {copy.sub}
        </p>

        {/* 統計數字 */}
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:28 }}>
          {[
            { label:'完成天數', val:`${day} 天` },
            { label:'里程碑',   val:`${Math.round(day/7)} / 4` },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:'#3A2820', margin:'0 0 2px' }}>{val}</p>
              <p style={{ fontSize:10, letterSpacing:'1px', color:'#B89A8E', textTransform:'uppercase' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* 繼續按鈕 */}
        <button onClick={handleClose}
          style={{
            width:'100%', height:52, borderRadius:18, border:'none',
            background:`linear-gradient(135deg,#FFD2B8,${copy.color} 45%,#E87A5C)`,
            boxShadow:`0 8px 20px -8px ${copy.color}88,inset 0 1px 0 rgba(255,255,255,0.4)`,
            color:'white', fontFamily:"'Cormorant Garamond',serif",
            fontSize:18, fontStyle:'italic', cursor:'pointer',
            marginBottom:12,
          }}>
          繼續我的旅程 ✦
        </button>

        <button onClick={handleClose}
          style={{ width:'100%', height:40, borderRadius:14, border:'1px solid #E8DDD8', background:'white', color:'#B89A8E', fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:'pointer' }}>
          關閉
        </button>
      </div>
    </div>
  )
}
