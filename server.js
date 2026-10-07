import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'cyberguard-demo-secret';
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'cyberguard.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@cyberguard.local');
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'System Administrator',
      'admin@cyberguard.local',
      passwordHash,
      'admin'
    );
  }

  const incidentCount = db.prepare('SELECT COUNT(*) as count FROM incidents').get().count;
  if (incidentCount === 0) {
    const samples = [
      ['Endpoint 64', 'Malware Detection', 'critical', 'Contained', 'Ransomware behavior detected and endpoint isolated.'],
      ['VPN Gateway', 'Failed Login Burst', 'high', 'Monitoring', 'Multiple failed sign-in attempts from external IP range.'],
      ['Web Filter', 'Suspicious URL', 'medium', 'Blocked', 'Malicious payload linked to phishing campaign.'],
      ['Identity', 'MFA Fatigue', 'high', 'Investigating', 'Repeated MFA push requests observed against employee account.'],
    ];

    const insert = db.prepare(`INSERT INTO incidents (source, type, severity, status, details) VALUES (?, ?, ?, ?, ?)`);
    samples.forEach(([source, type, severity, status, details]) => insert.run(source, type, severity, status, details));
  }
};

createTables();

const app = express();
app.use(cors());
app.use(express.json());

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'CyberGuard API', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, {
    expiresIn: '8h',
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.get('/api/dashboard', authenticate, (req, res) => {
  const summary = [
    { label: 'Critical Incidents', value: '12', trend: '+18.6%', isUp: true },
    { label: 'Blocked Threats', value: '8,462', trend: '+21.4%', isUp: true },
    { label: 'Vulnerabilities', value: '97', trend: '-8.2%', isUp: false },
    { label: 'Patch SLA', value: '94%', trend: 'Within target', isUp: true },
  ];

  const threatMatrix = [
    { name: 'Credential Abuse', value: 62 },
    { name: 'Malware', value: 48 },
    { name: 'Phishing', value: 81 },
    { name: 'DoS', value: 31 },
  ];

  const assets = [
    { name: 'Firewall', state: 'Healthy', type: 'good' },
    { name: 'EDR Cluster', state: 'Watch', type: 'warning' },
    { name: 'Proxy', state: 'Healthy', type: 'good' },
    { name: 'IAM Portal', state: 'Critical', type: 'critical' },
  ];

  const attackTrend = [
    { label: '00h', benign: 18, malicious: 12 },
    { label: '04h', benign: 25, malicious: 17 },
    { label: '08h', benign: 22, malicious: 16 },
    { label: '12h', benign: 28, malicious: 19 },
    { label: '16h', benign: 32, malicious: 27 },
    { label: '20h', benign: 30, malicious: 24 },
    { label: '24h', benign: 34, malicious: 31 },
  ];

  const incidents = db.prepare(`
    SELECT id, source, type, severity, status, details, created_at
    FROM incidents
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

  const cases = [
    { label: 'Ransomware Encryption', meta: 'IP: 10.14.27.11', severity: 'critical', time: '02m ago' },
    { label: 'Suspicious IAM Login', meta: '3 failed MFA attempts', severity: 'high', time: '11m ago' },
    { label: 'Threat IOC Match', meta: 'Malicious URL in tenant', severity: 'medium', time: '28m ago' },
  ];

  res.json({ summary, threatMatrix, assets, attackTrend, incidents, cases, score: 89 });
});

app.get('/api/incidents', authenticate, (req, res) => {
  const incidents = db.prepare(`
    SELECT id, source, type, severity, status, details, created_at
    FROM incidents
    ORDER BY created_at DESC
  `).all();
  res.json(incidents);
});

app.post('/api/incidents', authenticate, (req, res) => {
  const { source, type, severity, status, details } = req.body;

  if (!source || !type || !severity || !status) {
    return res.status(400).json({ message: 'source, type, severity, and status are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO incidents (source, type, severity, status, details)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(source, type, severity, status, details || '');
  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(incident);
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n✓ CyberGuard API running on http://localhost:${PORT}`);
  console.log(`✓ Frontend will be available at http://localhost:3000\n`);
});
