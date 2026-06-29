import React, { useState } from 'react';
import { MdEdit, MdLock, MdSave, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function PasswordModal({ onClose }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (form.new_password !== form.confirm) return toast.error('Passwords do not match.');
    if (form.new_password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await API.put('/auth/change-password', { current_password: form.current_password, new_password: form.new_password });
      toast.success('Password changed successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Change Password</div>
          <button className="modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Current password</label>
          <input type="password" className="form-input" value={form.current_password}
            onChange={e => setForm({ ...form, current_password: e.target.value })} placeholder="Current password" />
        </div>
        <div className="form-group">
          <label className="form-label">New password</label>
          <input type="password" className="form-input" value={form.new_password}
            onChange={e => setForm({ ...form, new_password: e.target.value })} placeholder="Min. 6 characters" />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm new password</label>
          <input type="password" className="form-input" value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat new password" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Saving…' : 'Change password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    family_name: user?.family_name || '',
    members_count: user?.members_count || 1,
    address: user?.address || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.put('/auth/profile', form);
      const { data } = await API.get('/auth/profile');
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Profile</div>
        <div className="page-subtitle">Your account details</div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="avatar avatar-lg" style={{ background: 'var(--teal-50)', color: 'var(--teal-600)', border: '1px solid var(--teal-400)' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>House {user?.house_number} · {user?.email}</div>
            <span className="tag tag-event" style={{ marginTop: 6, display: 'inline-block', textTransform: 'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="divider" />

        {!editing ? (
          <>
            <div className="grid-2" style={{ gap: '0.5rem 1.5rem', marginTop: '1rem' }}>
              {[
                ['House number', user?.house_number],
                ['Family name', user?.family_name || '—'],
                ['Mobile', user?.mobile || '—'],
                ['Members', user?.members_count],
                ['Email', user?.email],
                ['Address', user?.address || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setEditing(true)}><MdEdit /> Edit profile</button>
              <button className="btn btn-outline" onClick={() => setShowPwd(true)}><MdLock /> Change password</button>
            </div>
          </>
        ) : (
          <>
            <div className="grid-2" style={{ gap: '0 1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile</label>
                <input className="form-input" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Family name</label>
                <input className="form-input" value={form.family_name} onChange={e => setForm({ ...form, family_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Members</label>
                <input type="number" className="form-input" value={form.members_count} min="1" onChange={e => setForm({ ...form, members_count: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}><MdClose /> Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}><MdSave /> {loading ? 'Saving…' : 'Save changes'}</button>
            </div>
          </>
        )}
      </div>

      {showPwd && <PasswordModal onClose={() => setShowPwd(false)} />}
    </div>
  );
}
