import React, { useState, useEffect } from 'react';
import { MdSearch, MdHistory } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function WaterHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async (s = '') => {
    setLoading(true);
    try {
      const { data } = await API.get('/water/history', { params: s ? { search: s } : {} });
      setHistory(data.history);
    } catch {
      toast.error('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchHistory(e.target.value);
  };

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const formatDuration = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Water History</div>
        <div className="page-subtitle">Daily water availability logs</div>
      </div>

      <div className="search-box">
        <MdSearch className="search-icon" />
        <input placeholder="Search by date or person…" value={search} onChange={handleSearch} />
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <MdHistory style={{ fontSize: 40, opacity: 0.3, marginBottom: 8 }} />
          <div>No history records found.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Start time</th>
                <th>Stop time</th>
                <th>Duration</th>
                <th>Started by</th>
                <th>Stopped by</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const duration = formatDuration(h.duration_minutes);
                const ongoing = h.start_time && !h.stop_time;
                return (
                  <tr key={h.id}>
                    <td>{formatDate(h.date)}</td>
                    <td style={{ color: 'var(--teal-600)', fontWeight: 500 }}>{formatTime(h.start_time)}</td>
                    <td style={{ color: h.stop_time ? 'var(--red-400)' : 'var(--text-muted)' }}>
                      {formatTime(h.stop_time)}
                    </td>
                    <td>
                      {ongoing ? (
                        <span className="dur-badge dur-ongoing">Ongoing</span>
                      ) : duration ? (
                        <span className="dur-badge dur-ok">{duration}</span>
                      ) : '—'}
                    </td>
                    <td>{h.started_by_name ? `${h.started_by_name} · House ${h.started_by_house}` : '—'}</td>
                    <td>{h.stopped_by_name ? `${h.stopped_by_name} · House ${h.stopped_by_house}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
