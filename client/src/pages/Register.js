import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdWaterDrop } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', mobile: '',
    house_number: '', family_name: '', members_count: 1, address: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    const result = await register(form);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="card">
          <div className="auth-header">
            <div className="auth-icon"><MdWaterDrop /></div>
            <div className="auth-title">Join your neighborhood</div>
            <div className="auth-sub">Register for Water Alert — Sriram Nagar</div>
          </div>

          {error && (
            <div style={{
              background: 'var(--red-50)', color: 'var(--red-600)',
              border: '1px solid #f5c6c6', borderRadius: 8,
              padding: '0.65rem 0.875rem', fontSize: 13, marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ gap: '0 1rem' }}>
              <div className="form-group">
                <label className="form-label">Full name *</label>
                <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Sriram R" required />
              </div>
              <div className="form-group">
                <label className="form-label">House number *</label>
                <input name="house_number" value={form.house_number} onChange={handleChange} className="form-input" placeholder="24" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min. 6 characters" required />
            </div>

            <div className="grid-2" style={{ gap: '0 1rem' }}>
              <div className="form-group">
                <label className="form-label">Mobile number</label>
                <input name="mobile" value={form.mobile} onChange={handleChange} className="form-input" placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Family members</label>
                <input type="number" name="members_count" value={form.members_count} onChange={handleChange} className="form-input" min="1" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Family name</label>
              <input name="family_name" value={form.family_name} onChange={handleChange} className="form-input" placeholder="Sriram Family" />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="form-input" placeholder="House 24, Sriram Nagar" />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--teal-600)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
