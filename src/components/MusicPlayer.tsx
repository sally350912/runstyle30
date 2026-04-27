// src/components/MusicPlayer.tsx
// RunStyle 30 — 內建音樂播放器
// 音樂來源：Pixabay（免費授權，無需署名）
// 下載方式：進入下方每首歌的連結，點 Download 按鈕下載 MP3
// 下載後放入 public/music/ 對應資料夾，並重新命名成指定檔名

import { useState, useRef, useEffect, useCallback } from 'react';

export type PlaylistKey = 'dawn' | 'sunset' | 'night';

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  src: string;          // 檔案路徑：放在 public/music/ 底下
  coverColor: string;
  duration: number;     // 秒數
  pixabayUrl: string;   // 下載來源（開發參考）
}

export interface Playlist {
  key: PlaylistKey;
  label: string;
  bpm: number;
  emoji: string;
  description: string;
  accentColor: string;
  tracks: Track[];
}

// ─────────────────────────────────────────
// 音樂檔案下載對應表
//
// 步驟：
// 1. 點擊 pixabayUrl 進入頁面
// 2. 點 Download 按鈕（免費，不需登入）
// 3. 改名成 src 欄位的檔名
// 4. 放入 public/music/ 對應子資料夾
//
// 資料夾結構：
//   public/music/
//     dawn/
//       flashbacks-120bpm.mp3        ← dawn-1
//       warped-melody-120bpm.mp3     ← dawn-2
//     sunset/
//       black-mamba-130bpm.mp3       ← sunset-1
//       coral-snake-130bpm.mp3       ← sunset-2
//     night/
//       relaxing-night-ambient.mp3   ← night-1
//       please-calm-my-mind.mp3      ← night-2
// ─────────────────────────────────────────

export const PLAYLISTS: Playlist[] = [
  {
    key: 'dawn',
    label: '晨曦慢跑',
    bpm: 120,
    emoji: '🌅',
    description: '輕盈啟動，迎接清晨',
    accentColor: '#FFD4A3',
    tracks: [
      {
        id: 'dawn-1',
        title: 'Flashbacks',
        artist: 'ThisIsBeatKitchen',
        bpm: 120,
        src: '/music/dawn/flashbacks-120bpm.mp3',
        coverColor: '#FFB347',
        duration: 165,
        pixabayUrl: 'https://pixabay.com/music/upbeat-flashbacks-120-bpm-instrumental-233208/',
      },
      {
        id: 'dawn-2',
        title: 'Warped Melody Beat',
        artist: 'Pixabay',
        bpm: 120,
        src: '/music/dawn/warped-melody-120bpm.mp3',
        coverColor: '#FFA07A',
        duration: 156,
        pixabayUrl: 'https://pixabay.com/music/upbeat-warped-melody-beat-120-bpm-11391/',
      },
    ],
  },
  {
    key: 'sunset',
    label: '夕陽漫步',
    bpm: 130,
    emoji: '🌇',
    description: '能量爆發，燃燒黃金時刻',
    accentColor: '#FF9E7D',
    tracks: [
      {
        id: 'sunset-1',
        title: 'Black Mamba',
        artist: 'JustChilling1991',
        bpm: 130,
        src: '/music/sunset/black-mamba-130bpm.mp3',
        coverColor: '#FF7043',
        duration: 125,
        pixabayUrl: 'https://pixabay.com/music/search/130%20bpm/',
      },
      {
        id: 'sunset-2',
        title: 'Coral Snake',
        artist: 'JustChilling1991',
        bpm: 130,
        src: '/music/sunset/coral-snake-130bpm.mp3',
        coverColor: '#FF8C00',
        duration: 129,
        pixabayUrl: 'https://pixabay.com/music/search/130%20bpm/',
      },
    ],
  },
  {
    key: 'night',
    label: '深夜沉思',
    bpm: 110,
    emoji: '🌙',
    description: '沉靜內觀，與自己同行',
    accentColor: '#C4A882',
    tracks: [
      {
        id: 'night-1',
        title: 'Relaxing Night Ambient',
        artist: 'Clavier',
        bpm: 110,
        src: '/music/night/relaxing-night-ambient.mp3',
        coverColor: '#8B7355',
        duration: 240,
        pixabayUrl: 'https://pixabay.com/music/ambient-relaxing-night-ambient-calm-background-music-371793/',
      },
      {
        id: 'night-2',
        title: 'Please Calm My Mind',
        artist: 'music_for_video',
        bpm: 108,
        src: '/music/night/please-calm-my-mind.mp3',
        coverColor: '#6B5B45',
        duration: 175,
        pixabayUrl: 'https://pixabay.com/music/beautiful-plays-please-calm-my-mind-120766/',
      },
    ],
  },
];

// ─────────────────────────────────────────
// 跑步音樂記錄
// ─────────────────────────────────────────

const MUSIC_LOG_KEY = 'runstyle_music_log';

export interface RunMusicLog {
  date: string;
  playlistKey: PlaylistKey;
  playlistLabel: string;
  trackId: string;
  trackTitle: string;
  listenedAt: string;
}

export function logTrackForRun(date: string, playlist: Playlist, track: Track): void {
  const raw = localStorage.getItem(MUSIC_LOG_KEY);
  const logs: RunMusicLog[] = raw ? JSON.parse(raw) : [];
  logs.push({
    date,
    playlistKey: playlist.key,
    playlistLabel: playlist.label,
    trackId: track.id,
    trackTitle: track.title,
    listenedAt: new Date().toISOString(),
  });
  localStorage.setItem(MUSIC_LOG_KEY, JSON.stringify(logs));
}

export function getWeeklyTopPlaylist(): { key: PlaylistKey; label: string; count: number } | null {
  const raw = localStorage.getItem(MUSIC_LOG_KEY);
  if (!raw) return null;
  const logs: RunMusicLog[] = JSON.parse(raw);
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 6);
  const fromDate = from.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];
  const filtered = logs.filter((l) => l.date >= fromDate && l.date <= toDate);
  const counts: Record<string, number> = {};
  filtered.forEach((l) => { counts[l.playlistKey] = (counts[l.playlistKey] ?? 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  const playlist = PLAYLISTS.find((p) => p.key === top[0])!;
  return { key: top[0] as PlaylistKey, label: playlist.label, count: top[1] };
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// ─────────────────────────────────────────
// MusicPlayer 元件
// ─────────────────────────────────────────

interface MusicPlayerProps {
  onTrackLogged?: (log: RunMusicLog) => void;
  defaultPlaylist?: PlaylistKey;
}

export default function MusicPlayer({ onTrackLogged, defaultPlaylist = 'dawn' }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activePlaylistKey, setActivePlaylistKey] = useState<PlaylistKey>(defaultPlaylist);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [hasLogged, setHasLogged] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const activePlaylist = PLAYLISTS.find((p) => p.key === activePlaylistKey)!;
  const currentTrack = activePlaylist.tracks[trackIndex];

  const resetTrack = useCallback((newTrackIdx?: number) => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasLogged(false);
    setLoadError(false);
    if (newTrackIdx !== undefined) setTrackIndex(newTrackIdx);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }, []);

  const switchPlaylist = useCallback((key: PlaylistKey) => {
    setActivePlaylistKey(key);
    resetTrack(0);
  }, [resetTrack]);

  const nextTrack = useCallback(() => {
    resetTrack((trackIndex + 1) % activePlaylist.tracks.length);
  }, [trackIndex, activePlaylist.tracks.length, resetTrack]);

  const prevTrack = useCallback(() => {
    const prev = trackIndex === 0 ? activePlaylist.tracks.length - 1 : trackIndex - 1;
    resetTrack(prev);
  }, [trackIndex, activePlaylist.tracks.length, resetTrack]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || loadError) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        if (!hasLogged) {
          const log: RunMusicLog = {
            date: getTodayString(),
            playlistKey: activePlaylist.key,
            playlistLabel: activePlaylist.label,
            trackId: currentTrack.id,
            trackTitle: currentTrack.title,
            listenedAt: new Date().toISOString(),
          };
          logTrackForRun(getTodayString(), activePlaylist, currentTrack);
          setHasLogged(true);
          onTrackLogged?.(log);
        }
      } catch { setLoadError(true); }
    }
  }, [isPlaying, hasLogged, activePlaylist, currentTrack, onTrackLogged, loadError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => { setDuration(audio.duration); setLoadError(false); };
    const onEnded = () => nextTrack();
    const onError = () => setLoadError(true);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.volume = volume;
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [nextTrack, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setLoadError(false);
    audio.load();
    setCurrentTime(0);
    setDuration(currentTrack.duration);
  }, [currentTrack.src, currentTrack.duration]);

  return (
    <div style={S.container}>
      <audio ref={audioRef} preload="metadata">
        <source src={currentTrack.src} type="audio/mpeg" />
      </audio>

      {/* 歌單切換 */}
      <div style={S.plRow}>
        {PLAYLISTS.map((pl) => (
          <button key={pl.key} style={{
            ...S.plBtn,
            ...(activePlaylistKey === pl.key
              ? { borderColor: pl.accentColor, borderWidth: 1.5, background: '#FFFAF7' }
              : {}),
          }} onClick={() => switchPlaylist(pl.key)}>
            <span style={{ fontSize: 18 }}>{pl.emoji}</span>
            <div>
              <div style={S.plName}>{pl.label}</div>
              <div style={S.plBpm}>{pl.bpm} BPM · {pl.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* 現在播放 */}
      <div style={{ ...S.nowPlaying, background: `${activePlaylist.accentColor}18`, borderColor: `${activePlaylist.accentColor}44` }}>
        <div style={{ ...S.cover, background: `linear-gradient(135deg,${currentTrack.coverColor}66,${currentTrack.coverColor}22)` }}>
          <span style={{ fontSize: 28 }}>{activePlaylist.emoji}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.trackTitle}>{currentTrack.title}</div>
          <div style={S.trackArtist}>{currentTrack.artist}</div>
          <span style={{ ...S.bpmBadge, background: `${activePlaylist.accentColor}33`, color: '#7A3020' }}>
            ♩ {currentTrack.bpm} BPM
          </span>
          {loadError && (
            <a href={currentTrack.pixabayUrl} target="_blank" rel="noopener noreferrer" style={S.dlHint}>
              ↗ 點此到 Pixabay 下載此曲目
            </a>
          )}
        </div>
      </div>

      {/* 進度條 */}
      <div style={{ marginBottom: 14 }}>
        <input type="range" min={0} max={duration || 100} step={0.1} value={currentTime}
          onChange={(e) => { const t = Number(e.target.value); setCurrentTime(t); if (audioRef.current) audioRef.current.currentTime = t; }}
          style={{ width: '100%', accentColor: activePlaylist.accentColor }} />
        <div style={S.timeRow}>
          <span style={S.timeLabel}>{formatTime(currentTime)}</span>
          <span style={S.timeLabel}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div style={S.controls}>
        <button style={S.ctrlBtn} onClick={prevTrack}>⏮</button>
        <button style={{ ...S.playBtn, background: activePlaylist.accentColor }} onClick={togglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button style={S.ctrlBtn} onClick={nextTrack}>⏭</button>
      </div>

      {/* 音量 */}
      <div style={S.volRow}>
        <span style={{ fontSize: 13 }}>🔈</span>
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
          style={{ flex: 1, accentColor: '#FF9E7D' }} />
        <span style={{ fontSize: 13 }}>🔊</span>
      </div>

      {/* 曲目列表 */}
      <div style={{ borderTop: '1px solid #E8DDD8', paddingTop: 14 }}>
        <div style={S.trackListLabel}>歌單曲目</div>
        {activePlaylist.tracks.map((tr, i) => (
          <div key={tr.id}
            style={{ ...S.trackItem, ...(i === trackIndex ? { background: '#FFF0E8', borderLeftColor: activePlaylist.accentColor } : {}) }}
            onClick={() => resetTrack(i)}>
            <span style={S.tiNum}>{i === trackIndex && isPlaying ? '▶' : i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.tiTitle}>{tr.title}</div>
              <div style={S.tiArtist}>{tr.artist}</div>
            </div>
            <span style={S.tiDur}>{formatTime(tr.duration)}</span>
          </div>
        ))}
      </div>

      {/* 開發者下載指引（上線後可刪除此區塊）*/}
      <div style={S.devBox}>
        <div style={S.devTitle}>📁 音樂下載清單（開發用）</div>
        {PLAYLISTS.flatMap((pl) => pl.tracks.map((tr) => (
          <div key={tr.id} style={S.devRow}>
            <code style={S.devCode}>{tr.src.replace('/music/', '')}</code>
            <a href={tr.pixabayUrl} target="_blank" rel="noopener noreferrer" style={S.devLink}>
              Pixabay ↗
            </a>
          </div>
        )))}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { fontFamily: "'DM Sans',sans-serif", background: '#FFF8F4', borderRadius: 20, padding: 20, maxWidth: 380, margin: '0 auto' },
  plRow: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 },
  plBtn: { display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #E8DDD8', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textAlign: 'left' as const },
  plName: { fontSize: 13, fontWeight: 500, color: '#3A2820' },
  plBpm: { fontSize: 10, color: '#9C7B6B', marginTop: 1 },
  nowPlaying: { border: '1px solid', borderRadius: 16, padding: 14, display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 },
  cover: { width: 60, height: 60, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trackTitle: { fontSize: 14, fontWeight: 500, color: '#3A2820', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  trackArtist: { fontSize: 11, color: '#9C7B6B', marginBottom: 6 },
  bpmBadge: { fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 10 },
  dlHint: { fontSize: 10, color: '#FF9E7D', display: 'block', marginTop: 6, textDecoration: 'none' },
  timeRow: { display: 'flex', justifyContent: 'space-between', marginTop: 2 },
  timeLabel: { fontSize: 11, color: '#B89A8E' },
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 14 },
  ctrlBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9C7B6B', padding: 6 },
  playBtn: { width: 52, height: 52, borderRadius: '50%', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  volRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '0 4px' },
  trackListLabel: { fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' as const, color: '#B89A8E', marginBottom: 8 },
  trackItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', borderLeft: '2px solid transparent', marginBottom: 4 },
  tiNum: { fontSize: 11, color: '#B89A8E', width: 16, textAlign: 'center' as const },
  tiTitle: { fontSize: 13, fontWeight: 500, color: '#3A2820', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  tiArtist: { fontSize: 11, color: '#9C7B6B' },
  tiDur: { fontSize: 11, color: '#B89A8E' },
  devBox: { marginTop: 20, padding: 14, background: '#F5EDE5', borderRadius: 12, border: '1px dashed #D4B8A8' },
  devTitle: { fontSize: 11, fontWeight: 500, color: '#7A5A4E', marginBottom: 10 },
  devRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  devCode: { fontSize: 10, color: '#9C7B6B', fontFamily: 'monospace' },
  devLink: { fontSize: 10, color: '#FF9E7D', textDecoration: 'none', fontWeight: 500 },
};
