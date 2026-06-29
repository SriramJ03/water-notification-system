import React, { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdCampaign, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const tagConfig = {
  water: { label: 'Water', cls: 'tag-water' },
  alert: { label: 'Alert', cls: 'tag-alert' },
  event: { label: 'Event', cls: 'tag-event' },
  maintenance: { label: 'Maintenance', cls: 'tag-maintenance' },
  general: { label: 'General', cls: 'tag-general' },
};

function PostModal({ onSave, onClose, loading }) {
  const [form, setForm] = useState({ title: '', body: '', tag: 'general' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Post Announcement</div>
          <button className="modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Water timing changed" />
        </div>
        <div className="form-group">
          <label className="form-label">Message *</label>
          <textarea
            className="form-input" rows={4}
            value={form.body}
            onChange={e => setForm({ ...form, body: e.target.value })}
            placeholder="Enter announcement details…"
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>
            {Object.entries(tagConfig).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Posting…' : 'Post announcement'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get('/announcements');
      setAnnouncements(data.announcements);
    } catch {
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (form) => {
    if (!form.title || !form.body) return toast.error('Title and message are required.');
    setSaving(true);
    try {
      await API.post('/announcements', form);
      toast.success('Announcement posted!');
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await API.delete(`/announcements/${id}`);
      toast.success('Deleted.');
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Announcements</div>
          <div className="page-subtitle">Community updates and notices</div>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> Post</button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <MdCampaign style={{ fontSize: 40, opacity: 0.3, marginBottom: 8 }} />
          <div>No announcements yet.</div>
        </div>
      ) : announcements.map(a => {
        const { label, cls } = tagConfig[a.tag] || tagConfig.general;
        return (
          <div key={a.id} style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 10, padding: '1rem', marginBottom: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{a.title}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <span className={`tag ${cls}`}>{label}</span>
                {user?.role === 'admin' && (
                  <button className="btn-icon-sm" onClick={() => handleDelete(a.id)} style={{ color: 'var(--red-400)' }}>
                    <MdDelete />
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0', lineHeight: 1.6 }}>{a.body}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Posted by {a.posted_by_name || 'Admin'} · {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        );
      })}

      {showModal && <PostModal onSave={handlePost} onClose={() => setShowModal(false)} loading={saving} />}
    </div>
  );
}
