import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '🌾', label: 'Dashboard' },
  { section: 'AI Features' },
  { path: '/crop-doctor', icon: '🔬', label: 'Crop Doctor' },
  { path: '/soil-advisor', icon: '🌱', label: 'Soil Advisor' },
  { path: '/crop-calendar', icon: '📅', label: 'Crop Calendar' },
  { path: '/weather-alerts', icon: '⛅', label: 'Weather Alerts' },
  { section: 'Market' },
  { path: '/mandi-prices', icon: '💰', label: 'Mandi Prices' },
  { path: '/profit-calculator', icon: '🧮', label: 'Profit Calculator' },
  { section: 'Tools' },
  { path: '/irrigation-optimizer', icon: '💧', label: 'Irrigation Optimizer' },
  { path: '/voice-assistant', icon: '🎙️', label: 'Voice Assistant' },
  { path: '/image-to-text', icon: '📸', label: 'Image to Text' },
  { section: 'Community' },
  { path: '/farmer-hub', icon: '👥', label: 'Farmer Hub' },
  { path: '/govt-schemes', icon: '🏛️', label: 'Govt Schemes' },
  { path: '/crop-loss-report', icon: '🆘', label: 'Crop Loss Report' },
  { section: 'Account' },
  { path: '/profile', icon: '👤', label: 'My Profile' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>🌾 Krishak Mitra AI</h1>
          <p>Smart Farming Assistant</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section-label">{item.section}</div>;
            }
            return (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 8 }}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <span style={{ fontSize: 14, color: '#666' }}>
              {navItems.find(n => n.path === location.pathname)?.icon}{' '}
              {navItems.find(n => n.path === location.pathname)?.label || 'Krishak Mitra AI'}
            </span>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 13, color: '#666' }}>
              🌿 <strong style={{ color: 'var(--green-primary)' }}>{user?.full_name?.split(' ')[0]}</strong>
            </span>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--green-pale)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: 'var(--green-primary)',
              border: '2px solid var(--green-light)'
            }}>
              {user?.full_name?.[0]?.toUpperCase() || 'F'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
