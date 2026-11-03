import { useState } from 'react'

// 관리자 페이지. 토큰을 Authorization 헤더에 담아 /admin 을 호출하고
// 성공/거부 응답(JSON)을 그대로 보여준다.
export default function Admin({ token, apiBase }: { token: string; apiBase: string }) {
  const [status, setStatus] = useState<number | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function accessAdmin() {
    setLoading(true)
    setResult('')
    setStatus(null)
    try {
      const res = await fetch(`${apiBase}/admin`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
      const data = await res.json().catch(() => ({}))
      setStatus(res.status)
      setResult(JSON.stringify(data, null, 2))
    } catch (e) {
      setResult('서버 연결 실패: ' + String(e))
    } finally {
      setLoading(false)
    }
  }

  const ok = status !== null && status >= 200 && status < 300

  return (
    <div className="content">
      <div className="page-head">
        <h2 className="page-title">관리자</h2>
        <p className="page-sub">
          현재 토큰으로 <code>GET /api/admin</code> 을 호출한다. ADMIN 권한이 있어야 성공한다.
        </p>
      </div>

      <div className="panel">
        <div className="panel-body">
          <button
            className="btn btn-primary"
            onClick={accessAdmin}
            disabled={loading || !token.trim()}
          >
            {loading ? '요청 중…' : '관리자 API 호출'}
          </button>
          {!token.trim() && <p className="muted inline-note">사용할 토큰이 없습니다.</p>}

          {status !== null && (
            <div className="result-block">
              <span className={ok ? 'status-pill ok' : 'status-pill deny'}>
                HTTP {status} · {ok ? '접근 성공' : '접근 거부'}
              </span>
              <pre className="result">{result}</pre>
            </div>
          )}
          {status === null && result && <pre className="result">{result}</pre>}
        </div>
      </div>
    </div>
  )
}
