import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdWaterDrop, MdEmail, MdLock } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="card">
          <div className="auth-header">
            <div className="auth-icon"><MdWaterDrop /></div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">Sign in to Water Alert — Sriram Nagar</div>
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
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <MdEmail style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 17 }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 17 }} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            New resident?{' '}
            <Link to="/register" style={{ color: 'var(--teal-600)', fontWeight: 500 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
