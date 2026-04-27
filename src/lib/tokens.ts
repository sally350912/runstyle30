export const QUOTES = [
  '「跑過的每一步，都是在與更好的自己相遇」',
  '「汗水是身體在說謝謝你」',
  '「慢一點沒關係，你仍然在超越昨天的自己」',
  '「每次出門，都是一場與自己的約會」',
  '「路的盡頭，是更寬闊的你」',
  '「今天的堅持，是明天的底氣」',
  '「流汗的樣子，是最美的妳」',
  '「不是在變更好，就是在路上」',
]

export const PLAYLISTS = [
  { id: 'dawn',   emoji: '🌅', name: '晨曦慢跑', bpm: 120, desc: '輕盈啟動', bg: 'rgba(255,220,180,0.4)' },
  { id: 'sunset', emoji: '🌇', name: '夕陽漫步', bpm: 130, desc: '能量爆發', bg: 'rgba(255,158,125,0.25)' },
  { id: 'night',  emoji: '🌙', name: '深夜沉思', bpm: 110, desc: '沉靜內觀', bg: 'rgba(58,40,32,0.12)' },
] as const

export const SHARE_STYLES = [
  {
    id: 'sunset-beach', emoji: '🌅', name: '夕陽海灘', sub: '暖橘金光',
    mood: '溫柔的夕陽將你的每一步染成金色',
    bg: 'linear-gradient(160deg,#C45A18 0%,#E8822A 18%,#F5A848 35%,#F7C870 52%,#E89050 68%,#A84820 84%,#5A2008 100%)',
    orb1: { top:'8%', left:'60%', size:'150px', color:'#FFD080' },
    orb2: { top:'55%', left:'8%', size:'110px', color:'#FF8030' },
    igBg: 'white', igColor: '#C45A18',
  },
  {
    id: 'city-dawn', emoji: '🌆', name: '城市晨光', sub: '霧藍金調',
    mood: '都市的清晨屬於最早醒來的跑者',
    bg: 'linear-gradient(165deg,#1A2A40 0%,#2A3E5A 15%,#3A5070 30%,#6A7860 45%,#A89858 60%,#C8A848 72%,#7A5828 85%,#2A1808 100%)',
    orb1: { top:'12%', left:'55%', size:'130px', color:'#C8B858' },
    orb2: { top:'40%', left:'5%', size:'90px', color:'#4A6888' },
    igBg: 'white', igColor: '#7A5828',
  },
  {
    id: 'forest-mist', emoji: '🌲', name: '山林霧氣', sub: '翠綠療癒',
    mood: '霧氣中的每一步，都是與自然的對話',
    bg: 'linear-gradient(170deg,#0E1E10 0%,#1E3018 12%,#2E4822 25%,#486838 40%,#6A8850 55%,#90A870 68%,#C8C8A0 80%,#485830 100%)',
    orb1: { top:'15%', left:'50%', size:'120px', color:'#A8C878' },
    orb2: { top:'60%', left:'15%', size:'85px', color:'#507840' },
    igBg: 'white', igColor: '#385820',
  },
  {
    id: 'night-lights', emoji: '🌙', name: '深夜街燈', sub: '電影感暗金',
    mood: '深夜的街燈是只屬於你的舞台',
    bg: 'linear-gradient(168deg,#050508 0%,#0E0E18 12%,#181520 25%,#221820 38%,#302015 52%,#483018 65%,#604020 78%,#301808 90%,#080508 100%)',
    orb1: { top:'20%', left:'55%', size:'105px', color:'#C07828' },
    orb2: { top:'62%', left:'8%', size:'75px', color:'#804818' },
    igBg: '#C07828', igColor: 'white',
  },
] as const

export type ShareStyleId = typeof SHARE_STYLES[number]['id']
export type PlaylistId   = typeof PLAYLISTS[number]['id']
