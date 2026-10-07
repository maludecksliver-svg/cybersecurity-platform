const summaryCards = [
  { label: 'Critical Incidents', value: '12', trend: '+18.6%', isUp: true },
  { label: 'Blocked Threats', value: '8,462', trend: '+21.4%', isUp: true },
  { label: 'Vulnerabilities', value: '97', trend: '-8.2%', isUp: false },
  { label: 'Patch SLA', value: '94%', trend: 'Within target', isUp: true },
]

const attackTrend = [
  { label: '00h', benign: 18, malicious: 12 },
  { label: '04h', benign: 25, malicious: 17 },
  { label: '08h', benign: 22, malicious: 16 },
  { label: '12h', benign: 28, malicious: 19 },
  { label: '16h', benign: 32, malicious: 27 },
  { label: '20h', benign: 30, malicious: 24 },
  { label: '24h', benign: 34, malicious: 31 },
]

const threatMatrix = [
  { name: 'Credential Abuse', value: 62 },
  { name: 'Malware', value: 48 },
  { name: 'Phishing', value: 81 },
  { name: 'DoS', value: 31 },
]

const cases = [
  { label: 'Ransomware Encryption', meta: 'IP: 10.14.27.11', severity: 'critical', time: '02m ago' },
  { label: 'Suspicious IAM Login', meta: '3 failed MFA attempts', severity: 'high', time: '11m ago' },
  { label: 'Threat IOC Match', meta: 'Malicious URL in tenant', severity: 'medium', time: '28m ago' },
]

const assets = [
  { name: 'Firewall', state: 'Healthy', type: 'good' },
  { name: 'EDR Cluster', state: 'Watch', type: 'warning' },
  { name: 'Proxy', state: 'Healthy', type: 'good' },
  { name: 'IAM Portal', state: 'Critical', type: 'critical' },
]

const incidents = [
  { time: '08:42', source: 'Endpoint 64', type: 'Malware Detection', severity: 'critical', status: 'Contained' },
  { time: '08:14', source: 'VPN Gateway', type: 'Failed Login Burst', severity: 'high', status: 'Monitoring' },
  { time: '07:56', source: 'Web Filter', type: 'Suspicious URL', severity: 'medium', status: 'Blocked' },
  { time: '07:30', source: 'Identity', type: 'MFA Fatigue', severity: 'high', status: 'Investigating' },
]

function App() {
  const maxValue = 40

  const pathFor = (data, key) => {
    const values = data.map((point) => point[key])
    const max = Math.max(...values)
    return data
      .map((point, index) => {
        const x = 42 + index * 100
        const y = 220 - (point[key] / maxValue) * 160
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }

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
            <button className="ghost-btn">Export report</button>
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
              <svg viewBox="0 0 700 250" className="chart-svg" aria-label="Attack trend chart">
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
                  <span>89</span>
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
                <tr key={`${item.time}-${item.source}`}>
                  <td>{item.time}</td>
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
