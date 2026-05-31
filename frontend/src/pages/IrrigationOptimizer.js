import React, { useState } from 'react';
import { API } from '../context/AuthContext';

export default function IrrigationOptimizer() {
  const [form, setForm] = useState({ crop_name:'', growth_stage:'', soil_moisture:50, soil_type:'', temperature:28, humidity:60, rain_forecast:false });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/irrigation/advise', form);
      setResult(data.advice);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally { setLoading(false); }
  };

  const moistureColor = m => m > 70 ? '#2E7D32' : m > 50 ? '#F57F17' : m > 30 ? '#E65100' : '#C62828';
  const moistureLabel = m => m > 70 ? '💧 Good moisture' : m > 50 ? '⚠️ Moderate' : m > 30 ? '🔶 Low' : '🔴 Critically Dry';

  return (
    <div className="fade-in">
      <div className="page-title">💧 Irrigation Optimizer</div>
      <div className="page-subtitle">Smart water scheduling based on crop stage, soil moisture, and weather</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>📋 Crop & Soil Details</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">🌾 Crop *</label>
                <select className="input" value={form.crop_name} onChange={e => set('crop_name', e.target.value)} required>
                  <option value="">Select Crop</option>
                  {['Rice','Wheat','Maize','Cotton','Tomato','Potato','Sugarcane','Onion'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">🌱 Growth Stage *</label>
                <select className="input" value={form.growth_stage} onChange={e => set('growth_stage', e.target.value)} required>
                  <option value="">Select Stage</option>
                  {['Germination','Vegetative','Flowering','Maturity'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">💧 Soil Moisture: <strong style={{ color: moistureColor(form.soil_moisture) }}>{form.soil_moisture}%</strong>
                <span style={{ fontSize: 12, marginLeft: 8, color: moistureColor(form.soil_moisture) }}>{moistureLabel(form.soil_moisture)}</span>
              </label>
              <input type="range" className="slider-input" min="0" max="100" step="5" value={form.soil_moisture} onChange={e => set('soil_moisture', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 4 }}>
                <span>0% (Bone Dry)</span><span>50% (Moderate)</span><span>100% (Saturated)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="label">🪨 Soil Type</label>
              <select className="input" value={form.soil_type} onChange={e => set('soil_type', e.target.value)}>
                <option value="">Select Soil Type</option>
                {['Sandy','Loamy','Clay','Black','Red Laterite','Alluvial'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">🌡️ Temperature (°C)</label>
                <input className="input" type="number" min="5" max="50" value={form.temperature} onChange={e => set('temperature', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">💨 Humidity (%)</label>
                <input className="input" type="number" min="0" max="100" value={form.humidity} onChange={e => set('humidity', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: 18, height: 18, accentColor: 'var(--green-primary)' }} checked={form.rain_forecast} onChange={e => set('rain_forecast', e.target.checked)} />
                <span className="label" style={{ marginBottom: 0 }}>🌧️ Rain forecast in next 2 days?</span>
              </label>
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? '⏳ Optimizing...' : '💧 Get Irrigation Plan'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="result-card fade-in">
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, background: '#E3F2FD', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>💧 Water Required</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#1565C0' }}>{result.water_requirement}<span style={{ fontSize: 16, fontWeight: 400 }}>L/acre</span></div>
                </div>
                <div style={{ flex: 1, background: '#E8F5E9', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>📅 Next Irrigation</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#2E7D32' }}>{result.next_irrigation_days}<span style={{ fontSize: 16, fontWeight: 400 }}>days</span></div>
                </div>
              </div>

              {result.over_irrigation_risk && (
                <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                  ⚠️ Over-irrigation risk! Soil moisture is high. Delay irrigation to prevent root rot.
                </div>
              )}

              <div style={{ background: '#F1F8E9', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>🕐 Best Time to Irrigate</div>
                <div style={{ fontSize: 14, color: '#33691E' }}>{result.best_time}</div>
              </div>

              <div style={{ background: '#E3F2FD', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#1565C0', marginBottom: 8 }}>📊 Advice</div>
                <div style={{ fontSize: 14, color: '#1565C0', lineHeight: 1.6 }}>{result.advice_text}</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 10 }}>💡 Water Saving Tips</div>
                {result.water_saving_tips?.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#555', padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ color: 'var(--green-primary)' }}>✓</span>{tip}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💧</div>
              <p style={{ color: '#888', fontSize: 15 }}>Enter crop details and soil conditions to get a smart irrigation plan that saves water and boosts yield.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
