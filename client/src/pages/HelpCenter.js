import React, { useState, useEffect } from 'react';
import { MdAdd, MdCheck, MdHelp, MdVolunteerActivism, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const avatarBg = ['#E1F5EE','#E6F1FB','#FAEEDA','#FCE8F8'];
const avatarFg = ['#0F6E56','#185FA5','#BA7517','#8B21A5'];
const colorFor = (id) => [avatarBg[id % 4], avatarFg[id % 4]];

function RequestModal({ onSave, onClose, loading }) {
  const [form, setForm] = useState({ title: '', description: '' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Request Help</div>
          <button className="modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <div className="form-group">
          <label className="form-label">What do you need? *</label>
          <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Can someone collect water for my house?" />
        </div>
        <div className="form-group">
          <label className="form-label">Details</label>
          <textarea className="form-input" rows={3} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Any extra details neighbors should know…"
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenter() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [rData, vData] = await Promise.all([
        API.get('/help'),
        API.get('/help/volunteers'),
      ]);
      setRequests(rData.data.requests);
      setVolunteers(vData.data.volunteers);
      setIsVolunteer(vData.data.volunteers.some(v => v.user_id === user?.id));
    } catch {
      toast.error('Failed to load help center.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (form) => {
    if (!form.title) return toast.error('Please describe what you need.');
    setSaving(true);
    try {
      await API.post('/help', form);
      toast.success('Help request sent to neighbors!');
      setShowModal(false);
      fetchAll();
    } catch {
      toast.error('Failed to create request.');
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await API.put(`/help/${id}/accept`);
      toast.success('You accepted this request! Thank you 🙏');
      fetchAll();
    } catch {
      toast.error('Failed to accept.');
    }
  };

  const handleVolunteer = async () => {
    try {
      await API.post('/help/volunteer', { description: 'Available to help neighbors' });
      toast.success('You are now registered as a volunteer!');
      setIsVolunteer(true);
      fetchAll();
    } catch {
      toast.error('Failed to register.');
    }
  };

  const open = requests.filter(r => r.status === 'open');
  const accepted = requests.filter(r => r.status === 'accepted');

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Help Center</div>
          <div className="page-subtitle">Request help and support neighbors</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isVolunteer && (
            <button className="btn btn-outline" onClick={handleVolunteer}><MdVolunteerActivism /> Volunteer</button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> Request help</button>
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <>
          {/* Open requests */}
          <div className="section-header">
            <div className="section-title">Open requests · {open.length}</div>
          </div>
          {open.length === 0 ? (
            <div className="card card-sm" style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1rem' }}>No open requests right now.</div>
          ) : open.map(r => {
            const [bg, fg] = colorFor(r.requester_id);
            return (
              <div key={r.id} style={{
                display: 'flex', gap: 12, padding: '1rem',
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 10, marginBottom: 8
              }}>
                <div className="avatar avatar-md" style={{ background: bg, color: fg }}>
                  {r.requester_name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{r.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {r.requester_name} · House {r.requester_house} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {r.requester_id !== user?.id && (
                    <button className="btn btn-primary" style={{ marginTop: 8, padding: '4px 14px', fontSize: 12 }} onClick={() => handleAccept(r.id)}>
                      <MdCheck /> Accept
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Accepted */}
          {accepted.length > 0 && (
            <>
              <div className="section-header" style={{ marginTop: '1.25rem' }}>
                <div className="section-title">Accepted · {accepted.length}</div>
              </div>
              {accepted.map(r => {
                const [bg, fg] = colorFor(r.requester_id);
                return (
                  <div key={r.id} style={{
                    display: 'flex', gap: 12, padding: '1rem',
                    background: 'var(--teal-50)', border: '1px solid #b8e8d4',
                    borderRadius: 10, marginBottom: 8
                  }}>
                    <div className="avatar avatar-md" style={{ background: bg, color: fg }}>{r.requester_name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{r.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--teal-600)', marginTop: 4 }}>
                        ✅ Accepted by {r.accepted_by_name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Volunteers */}
          <div className="section-header" style={{ marginTop: '1.5rem' }}>
            <div className="section-title">Volunteers · {volunteers.length}</div>
          </div>
          {volunteers.length === 0 ? (
            <div className="card card-sm" style={{ color: 'var(--text-muted)', fontSize: 13 }}>No volunteers registered yet.</div>
          ) : volunteers.map((v, i) => {
            const [bg, fg] = colorFor(v.user_id);
            return (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '0.75rem 1rem', background: '#fff',
                border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8
              }}>
                <div className="avatar avatar-md" style={{ background: bg, color: fg }}>{v.name?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>House {v.house_number} · {v.description}</div>
                </div>
                <span className="tag tag-event" style={{ textTransform: 'none', fontSize: 11 }}>Volunteer</span>
              </div>
            );
          })}
        </>
      )}

      {showModal && <RequestModal onSave={handleCreate} onClose={() => setShowModal(false)} loading={saving} />}
    </div>
  );
}
