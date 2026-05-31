import React, { useState } from 'react';
import { API } from '../context/AuthContext';

const CROPS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Tomato', 'Onion', 'Potato'];

export default function CropCalendar() {
  const [form, setForm] = useState({ crop_name: '', location: '', sowing_date: '', land_area: '' });
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/crop-calendar/generate', form);
      setCalendar(data.calendar);
    } catch (err) {
      setError(err.response?.data?.error || 'Calendar generation failed.');
    } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fade-in">
      <div className="page-title">📅 Personalized Crop Calendar</div>
      <div className="page-subtitle">Get a week-by-week farming schedule from sowing to harvest</div>

      <div style={{ display: 'grid', gridTemplateColumns: calendar ? '360px 1fr' : '1fr', gap: 24, alignItems: 'start', maxWidth: calendar ? '100%' : 500 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>🌾 Generate Calendar</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">🌱 Select Crop *</label>
              <select className="input" value={form.crop_name} onChange={e => set('crop_name', e.target.value)} required>
                <option value="">Select Crop</option>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">📍 Location</label>
              <input className="input" placeholder="e.g. Nagpur, Maharashtra" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">📆 Sowing Date *</label>
              <input className="input" type="date" min={today} value={form.sowing_date} onChange={e => set('sowing_date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">🌾 Land Area (acres)</label>
              <input className="input" type="number" step="0.5" placeholder="e.g. 2" value={form.land_area} onChange={e => set('land_area', e.target.value)} />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? '⏳ Generating...' : '📅 Generate Calendar'}
            </button>
          </form>
        </div>

        {loading && <div className="card loading"><div className="spinner"></div><p>Building your crop calendar...</p></div>}

        {calendar && (
          <div className="fade-in">
            <div style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)', color: 'white', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800 }}>{calendar.crop_name} Calendar</h3>
                  {calendar.location && <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>📍 {calendar.location}</div>}
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px' }}>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Sowing</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(calendar.sowing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px' }}>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Harvest</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{new Date(calendar.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px' }}>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Duration</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{calendar.duration_days} days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 20, fontSize: 16 }}>📋 Weekly Schedule</h4>
              {calendar.weeks?.map((week, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, paddingBottom: 20, marginBottom: 20,
                  borderBottom: i < calendar.weeks.length - 1 ? '1px solid #F0F0F0' : 'none'
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      background: 'var(--green-pale)', borderRadius: 10, padding: '8px 12px',
                      textAlign: 'center', minWidth: 70
                    }}>
                      <div style={{ fontSize: 11, color: '#888' }}>Week</div>
                      <div style={{ fontWeight: 800, color: 'var(--green-primary)', fontSize: 15 }}>{week.week}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8, fontSize: 15 }}>
                      {['🌱', '💧', '🌿', '🌾', '⚗️', '🔍', '🌻', '🚜'][i % 8]} {week.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {week.activities.map((act, j) => (
                        <div key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#555' }}>
                          <span style={{ color: 'var(--green-secondary)', fontWeight: 700, flexShrink: 0 }}>•</span>
                          {act}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
