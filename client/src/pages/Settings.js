import React, { useState } from 'react';
import { MdNotifications, MdVolumeUp, MdWarning, MdChat, MdCampaign, MdDarkMode, MdLanguage } from 'react-icons/md';

const settingsList = [
  { key: 'waterAlerts', icon: <MdNotifications />, label: 'Water alerts', sub: 'Get notified when water starts or stops', default: true },
  { key: 'sound', icon: <MdVolumeUp />, label: 'Notification sound', sub: 'Play a sound when an alert arrives', default: true },
  { key: 'emergency', icon: <MdWarning />, label: 'Emergency alerts', sub: 'Cannot be disabled for your safety', default: true, locked: true },
  { key: 'chatMentions', icon: <MdChat />, label: 'Chat mentions', sub: 'Notify when someone mentions you in chat', default: true },
  { key: 'announcements', icon: <MdCampaign />, label: 'Community announcements', sub: 'Admin broadcasts and neighborhood events', default: false },
  { key: 'darkMode', icon: <MdDarkMode />, label: 'Dark mode', sub: 'Follow system theme preference', default: false },
];

export default function Settings() {
  const [settings, setSettings] = useState(() =>
    Object.fromEntries(settingsList.map(s => [s.key, s.default]))
  );

  const toggle = (key, locked) => {
    if (locked) return;
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Manage your notification and app preferences</div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: '0.25rem' }}>Notifications</div>
        {settingsList.map((s, i) => (
          <div key={s.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 0',
            borderTop: i === 0 ? '1px solid var(--border)' : undefined,
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: 'var(--surface-0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--teal-600)', flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.sub}</div>
              </div>
            </div>
            <button
              className={`toggle ${settings[s.key] ? 'on' : 'off'}`}
              onClick={() => toggle(s.key, s.locked)}
              style={{ opacity: s.locked ? 0.5 : 1, cursor: s.locked ? 'not-allowed' : 'pointer' }}
              aria-pressed={settings[s.key]}
              aria-label={s.label}
            />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="section-title" style={{ marginBottom: '1rem' }}>Language & Region</div>
        <div className="form-group">
          <label className="form-label">Language</label>
          <select className="form-input" style={{ maxWidth: 220 }}>
            <option value="en">English</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="hi">Hindi (हिंदी)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Time format</label>
          <select className="form-input" style={{ maxWidth: 220 }}>
            <option value="12">12-hour (7:00 AM)</option>
            <option value="24">24-hour (07:00)</option>
          </select>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save preferences</button>
      </div>
    </div>
  );
}
