import { useEffect, useState } from 'react'

// 백엔드 REST API 주소. vite 프록시가 /app 을 WebLogic(7001)로 전달한다.
const API = '/app/api'

type Post = {
  id: number
  title: string
  author: string
  content: string
  createdAt: string
}

// 게시판. 목록 조회는 누구나, 글쓰기는 로그인(토큰) 필요.
export default function Board({ token }: { token: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [openId, setOpenId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [composing, setComposing] = useState(false)

  // 글 목록 불러오기
  async function loadPosts() {
    try {
      const res = await fetch(`${API}/posts`)
      if (!res.ok) {
        setMsg(`목록 불러오기 실패 (HTTP ${res.status})`)
        return
      }
      setPosts(await res.json())
    } catch (e) {
      setMsg('서버 연결 실패 (백엔드 확인): ' + String(e))
    }
  }

  // 화면이 처음 뜰 때 한 번 목록을 불러온다
  useEffect(() => {
    loadPosts()
  }, [])

  // 글쓰기: 토큰을 Authorization 헤더에 담아 보낸다
  async function submit() {
    setMsg('')
    if (!title.trim() || !content.trim()) {
      setMsg('제목과 내용을 입력하세요')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
        },
        body: JSON.stringify({ title, content }),
      })
      if (res.status === 401) {
        setMsg('로그인이 필요합니다 (토큰이 없거나 유효하지 않음)')
        return
      }
      if (!res.ok) {
        setMsg(`작성 실패 (HTTP ${res.status})`)
        return
      }
      setTitle('')
      setContent('')
      setComposing(false)
      setMsg('작성 완료')
      await loadPosts()
    } catch (e) {
      setMsg('서버 연결 실패: ' + String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <div className="page-head board-head">
        <h2 className="page-title">게시판</h2>
        <button className="btn btn-primary" onClick={() => setComposing((v) => !v)}>
          {composing ? '닫기' : '글쓰기'}
        </button>
      </div>

      {composing && (
        <div className="panel compose">
          <div className="panel-body">
            <input
              className="input"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="input"
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
            <div className="compose-actions">
              {msg && <span className="msg">{msg}</span>}
              <button className="btn btn-primary" onClick={submit} disabled={loading}>
                {loading ? '등록 중…' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!composing && msg && <p className="msg standalone-msg">{msg}</p>}

      <div className="panel issue-list">
        <div className="issue-list-head">
          <span>{posts.length}개의 글</span>
        </div>
        {posts.length === 0 ? (
          <div className="empty">아직 글이 없습니다.</div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="issue-row">
              <button
                className="issue-main"
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
              >
                <span className="issue-title">{p.title}</span>
                <span className="issue-meta">
                  {p.author} · {p.createdAt}
                </span>
              </button>
              {openId === p.id && <div className="issue-body">{p.content}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
