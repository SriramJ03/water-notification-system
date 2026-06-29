import React, { useState, useEffect } from 'react';
import { MdPeople, MdHome, MdNotifications, MdWarning, MdBlock, MdCheckCircle, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sData, uData] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
      ]);
      setStats(sData.data.stats);
      setUsers(uData.data.users);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, is_active) => {
    try {
      await API.put(`/admin/users/${id}/toggle`, { is_active: !is_active });
      toast.success(`User ${!is_active ? 'enabled' : 'disabled'}.`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !is_active } : u));
    } catch { toast.error('Failed.'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted.');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { toast.error('Failed to delete.'); }
  };

  const statCards = stats ? [
    { label: 'Active users', value: stats.users, icon: <MdPeople />, color: 'var(--teal-400)' },
    { label: 'Registered houses', value: stats.houses, icon: <MdHome />, color: 'var(--blue-400)' },
    { label: "Alerts today", value: stats.alerts_today, icon: <MdNotifications />, color: 'var(--amber-400)' },
    { label: 'Active emergencies', value: stats.emergencies, icon: <MdWarning />, color: 'var(--red-400)' },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'history', label: 'Water history' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Admin Panel</div>
        <div className="page-subtitle">Manage the neighborhood system</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="btn"
            style={{
              background: tab === t.id ? 'var(--teal-400)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              padding: '0.4rem 0.875rem', fontSize: 13
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <>
          {tab === 'overview' && (
            <>
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                {statCards.map(s => (
                  <div key={s.label} className="card card-sm">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: s.color + '22', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {s.icon}
                      </div>
                    </div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label" style={{ marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {stats?.recent_history?.length > 0 && (
                <>
                  <div className="section-header"><div className="section-title">Recent water history</div></div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                      <thead><tr><th>Date</th><th>Start</th><th>Stop</th><th>Duration</th><th>By</th></tr></thead>
                      <tbody>
                        {stats.recent_history.map((h, i) => (
                          <tr key={i}>
                            <td>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                            <td>{h.start_time ? new Date(h.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td>{h.stop_time ? new Date(h.stop_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            <td>
                              {h.duration_minutes
                                ? <span className="dur-badge dur-ok">{Math.floor(h.duration_minutes/60)}h {h.duration_minutes%60}m</span>
                                : <span className="dur-badge dur-ongoing">Ongoing</span>}
                            </td>
                            <td>{h.started_by || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'users' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>House</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.house_number}</td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{u.email}</td>
                      <td><span className={`tag ${u.role === 'admin' ? 'tag-alert' : 'tag-event'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                      <td>
                        <span className={`tag ${u.is_active ? 'tag-event' : 'tag-alert'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn-icon-sm"
                              onClick={() => handleToggle(u.id, u.is_active)}
                              title={u.is_active ? 'Disable' : 'Enable'}
                              style={{ color: u.is_active ? 'var(--amber-400)' : 'var(--teal-400)' }}
                            >
                              {u.is_active ? <MdBlock /> : <MdCheckCircle />}
                            </button>
                            <button className="btn-icon-sm" onClick={() => handleDelete(u.id, u.name)} style={{ color: 'var(--red-400)' }}>
                              <MdDelete />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'history' && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '2rem', textAlign: 'center' }}>
              View full history in the <strong>Water History</strong> page.
            </div>
          )}
        </>
      )}
    </div>
  );
}
