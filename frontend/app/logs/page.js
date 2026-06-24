'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSavedUser, clearAuth } from '../../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Level Badge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const styles = {
    SUCCESS: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
    INFO:    { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
    WARNING: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
    ERROR:   { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  };
  const s = styles[level] || styles.INFO;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem',
      fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap',
    }}>
      {level}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(79,70,229,0.07)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e' }}>{value}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [logs,    setLogs]    = useState([]);
  const [stats,   setStats]   = useState({});
  const [logFile, setLogFile] = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Filters
  const [search,    setSearch]    = useState('');
  const [levelFilter, setLevel]   = useState('');
  const [autoRefresh, setAuto]    = useState(false);

  // ── Fetch logs from backend ────────────────────────────────────────────────
  const fetchLogs = useCallback(async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    if (!silent) setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ limit: 500 });
      if (levelFilter) params.set('level', levelFilter);
      if (search)      params.set('search', search);

      const res  = await fetch(`${API}/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        clearAuth(); router.push('/login'); return;
      }
      const data = await res.json();
      setLogs(data.logs   || []);
      setStats(data.stats || {});
      setLogFile(data.file || '');
    } catch (e) {
      setError('Could not reach backend. Is the server running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, [levelFilter, search, router]);

  // ── Auth check on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const saved = getSavedUser();
    if (!saved) { router.push('/login'); return; }
    setUser(saved);
    fetchLogs();
  }, []);

  // ── Re-fetch when filters change ───────────────────────────────────────────
  useEffect(() => { fetchLogs(); }, [levelFilter]);

  // ── Auto-refresh every 5 seconds ──────────────────────────────────────────
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchLogs(true), 5000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchLogs]);

  // ── Clear logs ────────────────────────────────────────────────────────────
  async function clearLogs() {
    if (!confirm('Clear ALL logs? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/logs`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLogs();
  }

  // ── Format timestamp ──────────────────────────────────────────────────────
  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleString('en-US', {
        month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch { return ts; }
  }

  // ── Build extra details string ────────────────────────────────────────────
  function getDetails(log) {
    const skip = ['timestamp', 'level', 'action', 'ip'];
    return Object.entries(log)
      .filter(([k]) => !skip.includes(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join('  ·  ');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span className="nav-brand">✦ AuthApp</span>
          <Link href="/dashboard" style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
        </div>
        <div className="nav-user">
          <span>👤 {user?.name}</span>
          <button onClick={() => { clearAuth(); router.push('/login'); }}
            className="btn btn-outline"
            style={{ width: 'auto', padding: '6px 16px', marginTop: 0 }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Activity Logs</h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              📄 File: <code style={{ background: '#e5e7eb', padding: '1px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{logFile || 'backend/logs/activity.log'}</code>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => fetchLogs()} className="btn btn-outline"
              style={{ width: 'auto', padding: '8px 16px', marginTop: 0, fontSize: '0.85rem' }}>
              🔄 Refresh
            </button>
            <button
              onClick={() => setAuto(a => !a)}
              className="btn btn-outline"
              style={{ width: 'auto', padding: '8px 16px', marginTop: 0, fontSize: '0.85rem',
                borderColor: autoRefresh ? '#16a34a' : '#4f46e5',
                color: autoRefresh ? '#16a34a' : '#4f46e5' }}>
              {autoRefresh ? '⏸ Auto ON' : '▶ Auto OFF'}
            </button>
            <button onClick={clearLogs} className="btn btn-outline"
              style={{ width: 'auto', padding: '8px 16px', marginTop: 0, fontSize: '0.85rem',
                borderColor: '#dc2626', color: '#dc2626' }}>
              🗑 Clear Logs
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <StatCard label="Total"   value={stats.total   || 0} color="#6b7280" />
          <StatCard label="Success" value={stats.SUCCESS || 0} color="#16a34a" />
          <StatCard label="Info"    value={stats.INFO    || 0} color="#2563eb" />
          <StatCard label="Warning" value={stats.WARNING || 0} color="#d97706" />
          <StatCard label="Error"   value={stats.ERROR   || 0} color="#dc2626" />
        </div>

        {/* ── Filters ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(79,70,229,0.07)', marginBottom: '16px',
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

          <input
            type="text"
            placeholder="🔍 Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLogs()}
            style={{ flex: 1, minWidth: '200px', padding: '8px 12px',
              border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
          />

          <select
            value={levelFilter}
            onChange={e => setLevel(e.target.value)}
            style={{ padding: '8px 12px', border: '2px solid #e5e7eb',
              borderRadius: '8px', fontSize: '0.9rem', background: '#fff', cursor: 'pointer' }}>
            <option value="">All Levels</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>

          <button onClick={() => fetchLogs()} className="btn btn-primary"
            style={{ width: 'auto', padding: '8px 20px', fontSize: '0.9rem' }}>
            Search
          </button>
          <button onClick={() => { setSearch(''); setLevel(''); setTimeout(() => fetchLogs(), 0); }}
            className="btn btn-outline"
            style={{ width: 'auto', padding: '8px 16px', marginTop: 0, fontSize: '0.9rem' }}>
            Reset
          </button>
        </div>

        {/* ── Log Table ── */}
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ background: '#fff', borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(79,70,229,0.07)', overflow: 'hidden' }}>

          {/* Table Header */}
          <div style={{ display: 'grid',
            gridTemplateColumns: '170px 90px 180px 1fr',
            gap: '0', padding: '10px 16px',
            background: '#f8f9fe', borderBottom: '2px solid #e5e7eb',
            fontSize: '0.75rem', fontWeight: 700, color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Timestamp</span>
            <span>Level</span>
            <span>Action</span>
            <span>Details</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              No logs found. {levelFilter || search ? 'Try clearing filters.' : 'Activity will appear here once users interact with the app.'}
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '170px 90px 180px 1fr',
                gap: '0',
                padding: '10px 16px',
                borderBottom: i < logs.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: '0.82rem',
                background: i % 2 === 0 ? '#fff' : '#fafbff',
                alignItems: 'start',
              }}>
                <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {formatTime(log.timestamp)}
                </span>
                <span><LevelBadge level={log.level} /></span>
                <span style={{ fontWeight: 600, color: '#374151', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {log.action}
                </span>
                <span style={{ color: '#6b7280', wordBreak: 'break-all' }}>
                  {getDetails(log) || '—'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Count */}
        {!loading && logs.length > 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '12px' }}>
            Showing {logs.length} {levelFilter || search ? 'filtered' : 'most recent'} entries
          </p>
        )}
      </div>
    </div>
  );
}
