import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdNotifications, MdChat, MdPeople,
  MdCampaign, MdHistory, MdHelp, MdPerson,
  MdSettings, MdAdminPanelSettings, MdWaterDrop,
  MdMenu, MdClose, MdLogout
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotificationContext';

const navItems = [
  { to: '/', icon: <MdDashboard />, label: 'Dashboard', exact: true },
  { to: '/alerts', icon: <MdNotifications />, label: 'Alerts', badge: true },
  { to: '/chat', icon: <MdChat />, label: 'Community Chat' },
  { to: '/neighbors', icon: <MdPeople />, label: 'Neighbors' },
];

const communityItems = [
  { to: '/announcements', icon: <MdCampaign />, label: 'Announcements' },
  { to: '/history', icon: <MdHistory />, label: 'Water History' },
  { to: '/help', icon: <MdHelp />, label: 'Help Center' },
];

const accountItems = [
  { to: '/profile', icon: <MdPerson />, label: 'Profile' },
  { to: '/settings', icon: <MdSettings />, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotif();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="brand">
        <div className="brand-icon"><MdWaterDrop /></div>
        <div className="brand-name">Water Alert</div>
        <div className="brand-sub">Sriram Nagar</div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Main</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">Community</div>
        {communityItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">Account</div>
        {accountItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon"><MdAdminPanelSettings /></span>
            Admin Panel
          </NavLink>
        )}
      </div>

      <div style={{ marginTop: 'auto', padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
          <div
            className="avatar avatar-sm"
            style={{ background: 'var(--teal-50)', color: 'var(--teal-600)', width: 32, height: 32 }}
          >
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>House {user?.house_number}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
        >
          <MdLogout style={{ fontSize: 16 }} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none', position: 'fixed', top: 12, left: 12,
          zIndex: 200, background: '#fff', border: '1px solid var(--border)',
          borderRadius: 9, width: 38, height: 38,
          alignItems: 'center', justifyContent: 'center', fontSize: 20
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <MdClose /> : <MdMenu />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 99, display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <SidebarContent />
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
