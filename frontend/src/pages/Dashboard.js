import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';

const quickActions = [
  { path: '/crop-doctor', icon: '🔬', label: 'Crop Doctor', color: '#E8F5E9', border: '#81C784' },
  { path: '/mandi-prices', icon: '💰', label: 'Mandi Prices', color: '#FFF3E0', border: '#FFB74D' },
  { path: '/weather-alerts', icon: '⛅', label: 'Weather', color: '#E3F2FD', border: '#90CAF9' },
  { path: '/govt-schemes', icon: '🏛️', label: 'Govt Schemes', color: '#F3E5F5', border: '#CE93D8' },
];

const allFeatures = [
  { path: '/crop-doctor', icon: '🔬', label: 'Crop Doctor' },
  { path: '/soil-advisor', icon: '🌱', label: 'Soil Advisor' },
  { path: '/crop-calendar', icon: '📅', label: 'Crop Calendar' },
  { path: '/weather-alerts', icon: '⛅', label: 'Weather' },
  { path: '/mandi-prices', icon: '💰', label: 'Mandi Prices' },
  { path: '/profit-calculator', icon: '🧮', label: 'Profit Calc' },
  { path: '/irrigation-optimizer', icon: '💧', label: 'Irrigation' },
  { path: '/voice-assistant', icon: '🎙️', label: 'Voice AI' },
  { path: '/image-to-text', icon: '📸', label: 'Image→Text' },
  { path: '/farmer-hub', icon: '👥', label: 'Farmer Hub' },
  { path: '/govt-schemes', icon: '🏛️', label: 'Govt Schemes' },
  { path: '/crop-loss-report', icon: '🆘', label: 'Loss Report' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        API.get(`/weather/current?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then(r => setWeather(r.data.weather)).catch(() => {});
      }, () => {
        API.get('/weather/current').then(r => setWeather(r.data.weather)).catch(() => {});
      });
    } else {
      API.get('/weather/current').then(r => setWeather(r.data.weather)).catch(() => {});
    }
  }, []);

  const weatherCode = weather?.current_weather?.weathercode;
  const weatherIcon = weatherCode === 0 ? '☀️' : weatherCode <= 3 ? '⛅' : weatherCode <= 67 ? '🌧️' : weatherCode <= 77 ? '❄️' : '⛈️';

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'सुप्रभात! Good Morning';
    if (h < 17) return 'नमस्ते! Good Afternoon';
    return 'शुभ संध्या! Good Evening';
  };

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2E7D32, #388E3C)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.08 }}>🌾</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>{greetingTime()}</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          {user?.full_name?.split(' ')[0]} जी! 👋
        </h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>
          {user?.village && user?.district ? `${user.village}, ${user.district}` : 'Welcome to Krishak Mitra AI'}
          {user?.land_size ? ` · ${user.land_size} acres` : ''}
        </p>
        {stats?.ai_tip && (
          <div style={{
            marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 10,
            padding: '10px 16px', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8
          }}>
            <span>💡</span>
            <span><strong>AI Tip:</strong> {stats.ai_tip}</span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {stats?.alerts?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {stats.alerts.map((alert, i) => (
            <div key={i} className={`alert alert-${alert.type === 'weather' ? 'warning' : 'info'}`} style={{ marginBottom: 10 }}>
              {alert.type === 'weather' ? '⛈️' : '📢'} {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '🔬', label: 'Diagnoses', val: stats?.stats?.diagnoses_count ?? '-', bg: '#E8F5E9', color: '#2E7D32' },
          { icon: '🌱', label: 'Soil Reports', val: stats?.stats?.soil_reports_count ?? '-', bg: '#FFF3E0', color: '#E65100' },
          { icon: '📅', label: 'Calendars', val: stats?.stats?.calendars_count ?? '-', bg: '#E3F2FD', color: '#1565C0' },
          { icon: '🆘', label: 'Loss Reports', val: stats?.stats?.reports_count ?? '-', bg: '#FFEBEE', color: '#C62828' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span>{s.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24 }}>
        {/* All Features Grid */}
        <div>
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16, fontSize: 17 }}>
            🚀 Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
            {quickActions.map(f => (
              <button key={f.path} onClick={() => navigate(f.path)}
                style={{
                  background: f.color, border: `2px solid ${f.border}`,
                  borderRadius: 14, padding: '20px 12px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{f.label}</div>
              </button>
            ))}
          </div>

          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16, fontSize: 17 }}>
            🌾 All Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
            {allFeatures.map(f => (
              <button key={f.path} onClick={() => navigate(f.path)}
                style={{
                  background: 'white', border: '1px solid #E8F5E9',
                  borderRadius: 12, padding: '14px 8px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#81C784'; e.currentTarget.style.background = '#F9FBE7'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8F5E9'; e.currentTarget.style.background = 'white'; }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#444' }}>{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div>
          {/* Weather Widget */}
          {weather && (
            <div className="weather-card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>📍 Current Weather</div>
                  <div style={{ fontSize: 42, fontWeight: 800 }}>
                    {Math.round(weather.current_weather?.temperature)}°C
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
                    💨 Wind: {Math.round(weather.current_weather?.windspeed)} km/h
                  </div>
                </div>
                <div style={{ fontSize: 56 }}>{weatherIcon}</div>
              </div>
              {weather.daily && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {weather.daily.time.slice(0, 5).map((day, i) => (
                    <div key={day} style={{
                      flex: '0 0 auto', textAlign: 'center', background: 'rgba(255,255,255,0.15)',
                      borderRadius: 10, padding: '8px 10px', minWidth: 50
                    }}>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>
                        {i === 0 ? 'Today' : new Date(day).toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: 18, margin: '4px 0' }}>
                        {weather.daily.weathercode[i] <= 3 ? '⛅' : '🌧️'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {Math.round(weather.daily.temperature_2m_max[i])}°
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => navigate('/weather-alerts')}
                style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', width: '100%' }}>
                View Full Forecast →
              </button>
            </div>
          )}

          {/* Farmer Profile Summary */}
          <div className="card">
            <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16, fontSize: 15 }}>
              👤 Your Profile
            </h4>
            {[
              { label: 'Name', val: user?.full_name },
              { label: 'Mobile', val: user?.mobile },
              { label: 'Location', val: user?.district || 'Not set' },
              { label: 'Land', val: user?.land_size ? `${user.land_size} acres` : 'Not set' },
              { label: 'Language', val: user?.language_pref || 'hindi' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                <span style={{ color: '#888' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: '#333' }}>{row.val}</span>
              </div>
            ))}
            <button onClick={() => navigate('/profile')} className="btn btn-secondary w-full" style={{ marginTop: 16, justifyContent: 'center', fontSize: 13 }}>
              Edit Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
