import { useState } from 'react'
import './App.css'
import Board from './Board'
import Admin from './Admin'

// 백엔드 REST API 주소. vite 프록시가 /app 을 WebLogic(7001)로 전달한다.
const API = '/app/api'
const STORAGE_KEY = 'team2_session'

type Session = {
  token: string
  role: string
  username: string
}

// localStorage 안전하게 읽기 (프라이빗 모드 등에서 깨지지 않게 try/catch)
function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (typeof s?.token === 'string' && typeof s?.username === 'string') {
      return { token: s.token, role: s.role ?? '', username: s.username }
    }
  } catch {
    /* 저장소 사용 불가 → 비로그인 상태로 동작 */
  }
  return null
}

function saveSession(s: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* 저장 실패해도 메모리 세션은 유지된다 */
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* noop */
  }
}

export default function App() {
  // 새로고침해도 세션이 유지되도록 localStorage에서 초기값을 읽는다
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginMsg, setLoginMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'board' | 'admin'>('board')

  const loggedIn = session !== null
  const isAdmin = session?.role === 'ADMIN'

  // 로그인: 아이디/비번을 보내 JWT를 받는다
  async function login() {
    setLoginMsg('')
    if (!username.trim() || !password) {
      setLoginMsg('아이디와 비밀번호를 입력하세요')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setLoginMsg(`로그인 실패 (HTTP ${res.status})`)
        return
      }
      const data = await res.json()
      const next: Session = {
        token: data.token,
        role: data.role ?? '',
        username,
      }
      setSession(next)
      saveSession(next)
      setPassword('')
      setView('board')
    } catch (e) {
      setLoginMsg('서버 연결 실패 (백엔드가 떠 있는지 확인): ' + String(e))
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃: 세션 비우고 저장소 정리
  function logout() {
    setSession(null)
    setUsername('')
    setPassword('')
    setLoginMsg('')
    setView('board')
    clearSession()
  }

  // ── 비로그인: 로그인 화면만 보인다 ─────────────────────────────
  if (!loggedIn) {
    return (
      <div className="signin-wrap">
        <div className="signin-card">
          <div className="signin-brand">team2</div>
          <h1 className="signin-title">Sign in to team2</h1>
          <div className="signin-box">
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              autoComplete="username"
            />
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              autoComplete="current-password"
            />
            <button className="btn btn-primary btn-block" onClick={login} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            {loginMsg && <p className="form-error">{loginMsg}</p>}
          </div>
          <div className="signin-hint">
            <div className="signin-hint-title">테스트 계정</div>
            <code>admin / admin123</code> <span className="muted">(관리자)</span>
            <br />
            <code>user / user123</code> <span className="muted">(일반 사용자)</span>
          </div>
        </div>
      </div>
    )
  }

  // ── 로그인: 헤더 + 본문(게시판 / 관리자) ───────────────────────
  // 관리자 메뉴는 ADMIN 권한일 때만 보인다 (일반 사용자 UI에는 없음).
  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-left">
            <span className="app-logo">team2</span>
            <nav className="app-nav">
              <button
                className={view === 'board' ? 'nav-link active' : 'nav-link'}
                onClick={() => setView('board')}
              >
                게시판
              </button>
              {isAdmin && (
                <button
                  className={view === 'admin' ? 'nav-link active' : 'nav-link'}
                  onClick={() => setView('admin')}
                >
                  관리자
                </button>
              )}
            </nav>
          </div>
          <div className="app-header-right">
            <span className="app-user">
              {session.username}
              {session.role && <span className="role-badge">{session.role}</span>}
            </span>
            <button className="btn-signout" onClick={logout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {isAdmin && view === 'admin' ? (
          <Admin token={session.token} apiBase={API} />
        ) : (
          <Board token={session.token} />
        )}
      </main>
    </>
  )
}
