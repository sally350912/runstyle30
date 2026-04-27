// src/pages/WeatherPage.tsx
import { useEffect, useState } from 'react'

interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: number
}

function getWeatherInfo(code: number, isDay: number): { label: string; emoji: string } {
  if (code === 0)  return { label: '晴空萬里', emoji: isDay ? '☀️' : '🌙' }
  if (code <= 2)   return { label: '多雲時晴', emoji: '⛅' }
  if (code === 3)  return { label: '陰天',     emoji: '☁️' }
  if (code <= 49)  return { label: '有霧',     emoji: '🌫️' }
  if (code <= 59)  return { label: '毛毛雨',   emoji: '🌦️' }
  if (code <= 69)  return { label: '下雨',     emoji: '🌧️' }
  if (code <= 79)  return { label: '降雪',     emoji: '❄️' }
  if (code <= 82)  return { label: '陣雨',     emoji: '🌧️' }
  if (code <= 86)  return { label: '大雪',     emoji: '🌨️' }
  if (code <= 99)  return { label: '雷雨',     emoji: '⛈️' }
  return { label: '未知', emoji: '🌡️' }
}

function getRunningAdvice(w: WeatherData) {
  const { temp, humidity, windSpeed, weatherCode } = w
  const isRaining = weatherCode >= 51
  const isStormy  = weatherCode >= 80

  let score = 100
  if (temp < 5)        score -= 30
  else if (temp < 10)  score -= 15
  else if (temp > 35)  score -= 35
  else if (temp > 30)  score -= 20
  if (humidity > 85)   score -= 20
  else if (humidity > 70) score -= 10
  if (windSpeed > 40)  score -= 25
  else if (windSpeed > 25) score -= 10
  if (isStormy)        score -= 50
  else if (isRaining)  score -= 30
  score = Math.max(0, Math.min(100, score))

  let scoreLabel: string, scoreColor: string, advice: string, bestTime: string

  if (score >= 80) {
    scoreLabel = '非常適合'; scoreColor = '#6A8850'
    advice   = `今天 ${temp}°C，天氣宜人，是跑步的絕佳時機！`
    bestTime = temp > 28 ? '建議傍晚 17:00–19:00，避開正午高溫' : '任何時段都適合，早晨與傍晚最舒適'
  } else if (score >= 60) {
    scoreLabel = '適合跑步'; scoreColor = '#FF9E7D'
    advice   = `今天 ${temp}°C，天氣尚可，注意適時補水。`
    bestTime = temp > 26 ? '建議傍晚 18:00 後，氣溫較低' : '早晨 06:00–08:00 最為清爽'
  } else if (score >= 40) {
    scoreLabel = '勉強可跑'; scoreColor = '#C4684A'
    advice   = isRaining ? '目前有雨，建議等雨停後再出門。' : '天氣條件不太理想，縮短距離並放慢配速。'
    bestTime = '建議等待天氣改善，或選擇室內運動'
  } else {
    scoreLabel = '不建議跑步'; scoreColor = '#7A3020'
    advice   = isStormy ? '目前有雷雨，請待在室內，安全第一！' : '今日天氣條件較差，建議室內瑜珈或伸展。'
    bestTime = '今日建議休息或室內運動'
  }

  const outfit: string[] = []
  if (temp < 10)      outfit.push('🧥 保暖外套', '🧤 手套', '🧣 圍巾')
  else if (temp < 16) outfit.push('🧥 輕薄運動外套', '👕 長袖排汗衣')
  else if (temp < 22) outfit.push('👕 短袖排汗衣', '👖 運動長褲')
  else if (temp < 28) outfit.push('👕 短袖排汗衣', '🩳 運動短褲')
  else                outfit.push('👕 涼感短袖', '🩳 輕薄短褲', '🧢 遮陽帽')
  if (humidity > 70)  outfit.push('💧 多帶一瓶水')
  if (isRaining)      outfit.push('🧥 防水外套', '👟 防水跑鞋')
  if (windSpeed > 20) outfit.push('🧥 防風夾克')

  return { score, scoreLabel, scoreColor, advice, bestTime, outfit }
}

async function getCityName(lat: number, lon: number): Promise<string> {
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=zh-TW`)
    const data = await res.json()
    return data.address?.city || data.address?.town || data.address?.county || '你的位置'
  } catch { return '你的位置' }
}

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [city,    setCity]    = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!navigator.geolocation) { setError('瀏覽器不支援定位'); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lon } = pos.coords
      try {
        const [wRes, cityName] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&timezone=auto`),
          getCityName(lat, lon),
        ])
        const wd = await wRes.json()
        const c  = wd.current
        setWeather({ temp: Math.round(c.temperature_2m), feelsLike: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m, windSpeed: Math.round(c.wind_speed_10m), weatherCode: c.weather_code, isDay: c.is_day })
        setCity(cityName)
      } catch { setError('無法取得天氣資料，請確認網路連線') }
      finally  { setLoading(false) }
    }, () => { setError('請允許瀏覽器存取位置權限，再重新整理頁面'); setLoading(false) }, { timeout: 10000 })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid #FFD4BC', borderTopColor:'#FF9E7D', animation:'spin 0.8s linear infinite' }} />
      <p style={{ fontSize:13, color:'#9C7B6B', margin:0 }}>正在取得天氣資料…</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )

  if (error || !weather) return (
    <div style={{ margin:'0 20px', padding:24, borderRadius:20, border:'1px solid #E8DDD8', background:'white', textAlign:'center' }}>
      <p style={{ fontSize:28, margin:'0 0 12px' }}>📍</p>
      <p style={{ fontSize:14, fontWeight:500, color:'#3A2820', margin:'0 0 8px' }}>無法取得天氣</p>
      <p style={{ fontSize:12, color:'#9C7B6B', margin:'0 0 16px', lineHeight:1.6 }}>{error || '請重新整理頁面'}</p>
      <button onClick={() => window.location.reload()} style={{ background:'#FF9E7D', color:'white', border:'none', borderRadius:12, padding:'8px 20px', fontSize:13, cursor:'pointer' }}>重新整理</button>
    </div>
  )

  const wi  = getWeatherInfo(weather.weatherCode, weather.isDay)
  const adv = getRunningAdvice(weather)

  // 半圓弧計算（總長約 246）
  const arcLen = Math.round((adv.score / 100) * 246)

  return (
    <div style={{ paddingBottom:24 }}>

      {/* 天氣主卡 */}
      <div style={{ margin:'0 20px 16px', borderRadius:24, overflow:'hidden', position:'relative', background: weather.isDay ? 'linear-gradient(160deg,#FFD2B8 0%,#FF9E7D 50%,#C4684A 100%)' : 'linear-gradient(160deg,#1A1A2E 0%,#302015 60%,#483018 100%)', padding:'28px 24px 24px' }}>
        <div style={{ position:'absolute', top:-20, right:-20, width:160, height:160, borderRadius:'50%', background: weather.isDay ? 'rgba(255,220,120,0.3)' : 'rgba(200,120,40,0.2)', filter:'blur(30px)' }} />
        <div style={{ position:'relative' }}>
          <p style={{ fontSize:11, letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', margin:'0 0 4px' }}>{city}</p>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:72, fontWeight:300, color:'white', lineHeight:1, margin:0 }}>{weather.temp}°</p>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.88)', margin:'4px 0 0', fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic' }}>{wi.label}</p>
            </div>
            <div style={{ fontSize:52, lineHeight:1 }}>{wi.emoji}</div>
          </div>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.18)', borderRadius:14, overflow:'hidden' }}>
            {[{ l:'體感', v:`${weather.feelsLike}°` },{ l:'濕度', v:`${weather.humidity}%` },{ l:'風速', v:`${weather.windSpeed}km/h` }].map(({ l, v }, i) => (
              <div key={l} style={{ flex:1, padding:'10px 12px', textAlign:'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                <p style={{ fontSize:9, letterSpacing:'1px', textTransform:'uppercase', color:'rgba(255,255,255,0.65)', margin:'0 0 3px' }}>{l}</p>
                <p style={{ fontSize:16, fontWeight:500, color:'white', margin:0 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 跑步指數（無指針）*/}
      <div style={{ margin:'0 20px 16px', background:'white', borderRadius:20, border:'1px solid #E8DDD8', padding:'20px 20px 16px', textAlign:'center' }}>
        <p style={{ fontSize:10, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E', marginBottom:16 }}>今日跑步指數</p>
        <div style={{ position:'relative', width:180, height:96, margin:'0 auto 16px' }}>
          <svg width="180" height="96" viewBox="0 0 180 96">
            <defs>
              <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#E8DDD8"/>
                <stop offset="35%"  stopColor="#FFD4BC"/>
                <stop offset="65%"  stopColor="#FF9E7D"/>
                <stop offset="100%" stopColor="#6A8850"/>
              </linearGradient>
            </defs>
            <path d="M 12 88 A 78 78 0 0 1 168 88" fill="none" stroke="#F0EAE5" strokeWidth="14" strokeLinecap="round"/>
            <path d="M 12 88 A 78 78 0 0 1 168 88" fill="none" stroke="url(#arcGrad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${arcLen} 246`}/>
            <text x="90" y="72" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontSize="42" fontWeight="300" fill={adv.scoreColor}>{adv.score}</text>
            <text x="90" y="88" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="11" fill="#B89A8E">/100</text>
          </svg>
        </div>
        <p style={{ fontSize:13, fontWeight:500, color:adv.scoreColor, margin:'0 0 8px' }}>{adv.scoreLabel}</p>
        <p style={{ fontSize:13, color:'#7A5A4E', lineHeight:1.6, margin:0 }}>{adv.advice}</p>
      </div>

      {/* 最佳時段 */}
      <div style={{ margin:'0 20px 16px', background:'rgba(255,158,125,0.08)', border:'1px solid rgba(255,158,125,0.2)', borderRadius:16, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
        <span style={{ fontSize:22, flexShrink:0 }}>⏰</span>
        <div>
          <p style={{ fontSize:11, letterSpacing:'1px', textTransform:'uppercase', color:'#B89A8E', margin:'0 0 4px' }}>最佳跑步時段</p>
          <p style={{ fontSize:13, color:'#3A2820', lineHeight:1.5, margin:0 }}>{adv.bestTime}</p>
        </div>
      </div>

      {/* 穿搭建議 */}
      <p style={{ margin:'0 20px 10px', fontSize:10, letterSpacing:'1.2px', textTransform:'uppercase', color:'#B89A8E' }}>今日跑步穿搭</p>
      <div style={{ margin:'0 20px', display:'flex', flexDirection:'column', gap:8 }}>
        {adv.outfit.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, background:'white', border:'1px solid #E8DDD8', borderRadius:12, padding:'10px 14px' }}>
            <span style={{ fontSize:20 }}>{item.split(' ')[0]}</span>
            <p style={{ fontSize:13, color:'#3A2820', margin:0 }}>{item.split(' ').slice(1).join(' ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
