import { useEffect, useState } from 'react'

const API_BASE = '/api'

const authRequest = async (endpoint, options = {}, token) => {
  const headers = { ...(options.headers || {}) }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed')
  }

  return payload
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('cyberguard-token') || '')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cyberguard-user') || 'null'))
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [form, setForm] = useState({ email: 'admin@cyberguard.local', password: 'admin123' })

  const fetchDashboard = async (authToken = token) => {
    if (!authToken) return
    setLoading(true)

    try {
      const data = await authRequest('/dashboard', {}, authToken)
      setDashboard(data)
      setAuthError('')
    } catch (error) {
      setAuthError(error.message)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboard(token)
    }
  }, [token])

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setAuthError('')

    try {
      const response = await authRequest('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      localStorage.setItem('cyberguard-token', response.token)
      localStorage.setItem('cyberguard-user', JSON.stringify(response.user))
      setToken(response.token)
      setUser(response.user)
      setForm({ ...form, password: '' })
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('cyberguard-token')
    localStorage.removeItem('cyberguard-user')
    setToken('')
    setUser(null)
    setDashboard(null)
  }

  if (!token || !user || !dashboard) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-mark">C</div>
            <div>
              <p className="eyebrow">CyberGuard SOC</p>
              <h2>Secure Access</h2>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@cyberguard.local"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>

            {authError && <div className="error-box">{authError}</div>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="demo-note">
            Demo credential: admin@cyberguard.local / admin123
          </div>
        </div>
      </div>
    )
  }

  const summaryCards = dashboard.summary || []
  const attackTrend = dashboard.attackTrend || []
  const threatMatrix = dashboard.threatMatrix || []
  const cases = dashboard.cases || []
  const assets = dashboard.assets || []
  const incidents = dashboard.incidents || []

  const pathFor = (points, key) => {
    return points
      .map((point, index) => {
        const x = 42 + index * 100
        const y = 220 - (point[key] / 40) * 160
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

  const maxValue = 40

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <p className="brand-name">CyberGuard</p>
            <span className="brand-tag">SOC Platform</span>
          </div>
        </div>

        <nav className="nav">
          <a className="nav-item active" href="#">
            <span className="icon">◈</span>
            Dashboard
          </a>
          <a className="nav-item" href="#">
            <span className="icon">◎</span>
            Threat Intel
          </a>
          <a className="nav-item" href="#">
            <span className="icon">▣</span>
            Assets
          </a>
          <a className="nav-item" href="#">
            <span className="icon">◍</span>
            Cases
          </a>
          <a className="nav-item" href="#">
            <span className="icon">▤</span>
            Vulnerability
          </a>
          <a className="nav-item" href="#">
            <span className="icon">◌</span>
            Policies
          </a>
          <a className="nav-item" href="#">
            <span className="icon">⚑</span>
            Compliance
          </a>
        </nav>

        <div className="side-card">
          <div className="side-card-head">
            <span className="dot pulse"></span>
            Live Threat Feed
          </div>
          <div className="mini-feed">
            <span>Ransomware Attempt</span>
            <strong>42 blocked</strong>
          </div>
          <div className="mini-feed">
            <span>Phishing Domains</span>
            <strong>13 flagged</strong>
          </div>
          <div className="mini-feed">
            <span>Suspicious IPs</span>
            <strong>256 active</strong>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Security Operations Center</p>
            <h1>Executive Threat Overview</h1>
          </div>

          <div className="topbar-actions">
            <span className="user-badge">{user.name}</span>
            <button className="ghost-btn" onClick={logout}>Logout</button>
            <button className="primary-btn">Investigate</button>
          </div>
        </header>

        <section className="stats-grid">
          {summaryCards.map((item) => (
            <div className="stat-card" key={item.label}>
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
              <div className={`trend ${item.isUp ? 'up' : 'down'}`}>{item.trend}</div>
            </div>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel panel-large">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Threat Activity</span>
                <h3>Attack Trend</h3>
              </div>
              <div className="legend">
                <span><i className="line blue"></i> Benign</span>
                <span><i className="line red"></i> Malicious</span>
              </div>
            </div>

            <div className="chart-area">
              <svg viewBox="0 0 700 250" className="chart-svg">
                {[0, 1, 2, 3, 4].map((line) => (
                  <line
                    key={line}
                    x1="32"
                    y1={30 + line * 45}
                    x2="670"
                    y2={30 + line * 45}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                ))}

                <path d={pathFor(attackTrend, 'benign')} fill="none" stroke="#5ad1ff" strokeWidth="3" strokeLinecap="round" />
                <path d={pathFor(attackTrend, 'malicious')} fill="none" stroke="#ff5d73" strokeWidth="3" strokeLinecap="round" />

                {attackTrend.map((point, index) => {
                  const x = 42 + index * 100
                  const benignY = 220 - (point.benign / maxValue) * 160
                  const maliciousY = 220 - (point.malicious / maxValue) * 160

                  return (
                    <g key={point.label}>
                      <circle cx={x} cy={benignY} r="4" fill="#5ad1ff" />
                      <circle cx={x} cy={maliciousY} r="4" fill="#ff5d73" />
                      <text x={x - 12} y="245" fill="rgba(180,196,220,0.85)" fontSize="11">{point.label}</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Risk posture</span>
                <h3>Overall Security Score</h3>
              </div>
            </div>

            <div className="score-ring">
              <div className="ring">
                <div className="ring-inner">
                  <span>{dashboard.score || 89}</span>
                  <small>Secure</small>
                </div>
              </div>
            </div>

            <ul className="score-list">
              <li><span>Endpoint</span><strong>92%</strong></li>
              <li><span>Network</span><strong>87%</strong></li>
              <li><span>Identity</span><strong>91%</strong></li>
              <li><span>Cloud</span><strong>84%</strong></li>
            </ul>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Active detection</span>
                <h3>Threat Matrix</h3>
              </div>
            </div>

            <div className="matrix">
              {threatMatrix.map((item) => (
                <div className="matrix-row" key={item.name}>
                  <span>{item.name}</span>
                  <div className="bar"><i style={{ width: `${item.value}%` }}></i></div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Priority incidents</span>
                <h3>Case Queue</h3>
              </div>
            </div>

            <div className="case-list">
              {cases.map((item) => (
                <div className="case-item" key={item.label}>
                  <div className={`case-badge ${item.severity}`}>{item.severity.toUpperCase()}</div>
                  <div className="case-meta">
                    <strong>{item.label}</strong>
                    <span>{item.meta}</span>
                  </div>
                  <div className="case-time">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Infrastructure</span>
                <h3>Asset Health</h3>
              </div>
            </div>

            <div className="asset-table">
              {assets.map((item) => (
                <div className="asset-row" key={item.name}>
                  <span className="asset-name">{item.name}</span>
                  <span className={`asset-state ${item.type}`}>{item.state}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel full-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Recent activity</span>
              <h3>Incident Timeline</h3>
            </div>
          </div>

          <table className="activity-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((item) => (
                <tr key={`${item.id || item.source}-${item.created_at}`}>
                  <td>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{item.source}</td>
                  <td>{item.type}</td>
                  <td className={`sev ${item.severity}`}>{item.severity}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default App
