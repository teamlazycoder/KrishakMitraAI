import React, { useState } from 'react';
import { API } from '../context/AuthContext';

export default function SoilAdvisor() {
  const [form, setForm] = useState({ soil_type: '', ph: 6.5, nitrogen: '', phosphorus: '', potassium: '', organic_carbon: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/soil-advisor/recommend', form);
      setResult(data.report);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally { setLoading(false); }
  };

  const fertilityColor = { 'Very High': '#2E7D32', 'High': '#388E3C', 'Medium': '#F57F17', 'Moderate': '#F57F17', 'Low': '#E65100', 'Poor – High Alkalinity': '#C62828', 'Poor – High Acidity': '#C62828' };

  return (
    <div className="fade-in">
      <div className="page-title">🌱 Soil Health Advisor</div>
      <div className="page-subtitle">Enter your soil parameters for crop recommendations and fertilizer guidance</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>📋 Soil Parameters</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">🪨 Soil Type *</label>
              <select className="input" value={form.soil_type} onChange={e => set('soil_type', e.target.value)} required>
                <option value="">Select Soil Type</option>
                {['Loamy', 'Clay', 'Sandy', 'Black (Regur)', 'Red Laterite', 'Alluvial', 'Saline/Alkaline'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">🧪 Soil pH: <strong style={{ color: 'var(--green-primary)' }}>{form.ph}</strong>
                <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                  ({form.ph < 5.5 ? '🔴 Acidic' : form.ph > 7.5 ? '🔵 Alkaline' : '🟢 Neutral'})
                </span>
              </label>
              <input type="range" className="slider-input" min="4.0" max="9.0" step="0.1"
                value={form.ph} onChange={e => set('ph', parseFloat(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 4 }}>
                <span>4.0 (Very Acidic)</span><span>6.5 (Ideal)</span><span>9.0 (Very Alkaline)</span>
              </div>
            </div>

            {[['nitrogen', '🌿 Nitrogen (N)', 'N'], ['phosphorus', '🟤 Phosphorus (P)', 'P'], ['potassium', '🟡 Potassium (K)', 'K'], ['organic_carbon', '🔬 Organic Carbon', 'OC']].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="label">{label}</label>
                <select className="input" value={form[key]} onChange={e => set(key, e.target.value)}>
                  <option value="">Select Level</option>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
            ))}

            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 14, fontSize: 15, marginTop: 8 }}>
              {loading ? '⏳ Analyzing Soil...' : '🔍 Analyze Soil'}
            </button>
          </form>
        </div>

        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
              <p style={{ color: '#888', fontSize: 15 }}>Fill in your soil details and click Analyze to get personalized recommendations.</p>
            </div>
          )}
          {loading && <div className="card loading"><div className="spinner"></div><p>Analyzing soil health...</p></div>}
          {result && (
            <div className="result-card fade-in">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span className="badge" style={{
                  fontSize: 14, padding: '8px 20px',
                  background: `${fertilityColor[result.fertility]}22`,
                  color: fertilityColor[result.fertility] || '#333'
                }}>
                  🌱 Soil Fertility: {result.fertility}
                </span>
              </div>

              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 10, fontSize: 15 }}>🌾 Recommended Crops</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {result.crops?.map(crop => (
                    <span key={crop} className="badge badge-green" style={{ fontSize: 13 }}>✓ {crop}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontWeight: 700, color: '#E65100', marginBottom: 10, fontSize: 15 }}>🌿 Fertilizer Recommendation</h4>
                <div style={{ background: '#FFF3E0', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7 }}>
                  {result.fertilizer}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontWeight: 700, color: '#1565C0', marginBottom: 10, fontSize: 15 }}>💧 Irrigation Advice</h4>
                <div style={{ background: '#E3F2FD', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7 }}>
                  {result.irrigation}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, color: '#558B2F', marginBottom: 10, fontSize: 15 }}>💡 Soil Improvement Tips</h4>
                <div style={{ background: '#F1F8E9', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7 }}>
                  {result.tips}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
