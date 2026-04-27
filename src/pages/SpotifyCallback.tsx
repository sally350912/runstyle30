// src/pages/SpotifyCallback.tsx
// RunStyle 30 — Spotify OAuth Callback 頁面
//
// 在 React Router 中掛載：
//   <Route path="/callback" element={<SpotifyCallback />} />
//
// Spotify 授權成功後會跳轉到這個頁面：
//   http://localhost:3000/callback?code=AQD...
// 本頁面負責：
//   1. 從 URL 取出 code
//   2. 送給後端換 tokens
//   3. 存入 localStorage
//   4. 跳轉回 App 主頁

import { useEffect, useState } from 'react';
import { saveTokens, type SpotifyTokens } from '../api/spotify';

type Status = 'loading' | 'success' | 'error';

export default function SpotifyCallback() {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      // 用戶在 Spotify 授權頁點「拒絕」
      if (error) {
        setErrorMsg(
          error === 'access_denied'
            ? '你取消了 Spotify 授權，返回後可以重試。'
            : `Spotify 授權失敗：${error}`
        );
        setStatus('error');
        return;
      }

      if (!code) {
        setErrorMsg('未收到授權碼，請重新嘗試連結 Spotify。');
        setStatus('error');
        return;
      }

      try {
        // 送給後端換 tokens
        const res = await fetch('/api/spotify/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const data = await res.json() as { error?: string; description?: string };
          throw new Error(data.description ?? data.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json() as {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        };

        const tokens: SpotifyTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: Date.now() + data.expiresIn * 1000,
        };

        saveTokens(tokens);
        setStatus('success');

        // 1 秒後跳回主頁
        setTimeout(() => {
          window.location.replace('/');
        }, 1000);

      } catch (e) {
        console.error('[SpotifyCallback]', e);
        setErrorMsg((e as Error).message ?? '未知錯誤，請重試。');
        setStatus('error');
      }
    };

    run();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={styles.spinner} />
            <p style={styles.title}>正在連結 Spotify…</p>
            <p style={styles.sub}>請稍候，馬上就好</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={styles.iconSuccess}>✓</div>
            <p style={styles.title}>Spotify 連結成功！</p>
            <p style={styles.sub}>正在返回 RunStyle 30…</p>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={styles.iconError}>✕</div>
            <p style={styles.title}>連結失敗</p>
            <p style={styles.sub}>{errorMsg}</p>
            <button
              style={styles.btn}
              onClick={() => window.location.replace('/')}
            >
              返回首頁
            </button>
          </>
        )}

      </div>
    </div>
  );
}

// ─── 樣式（與 RunStyle 30 莫蘭迪暖色調一致）───
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FFF8F4',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: 'white',
    border: '1px solid #E8DDD8',
    borderRadius: 20,
    padding: '40px 32px',
    textAlign: 'center',
    maxWidth: 320,
    width: '90%',
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '3px solid #FFD4BC',
    borderTopColor: '#FF9E7D',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 20px',
  },
  iconSuccess: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'rgba(255,158,125,0.15)',
    color: '#FF9E7D',
    fontSize: 24,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  iconError: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: '#FFF0ED',
    color: '#C4684A',
    fontSize: 22,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: 17,
    fontWeight: 500,
    color: '#3A2820',
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: '#9C7B6B',
    lineHeight: 1.5,
    marginBottom: 24,
  },
  btn: {
    background: '#FF9E7D',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
};
