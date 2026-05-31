import React, { useState } from 'react';
import { API } from '../context/AuthContext';

const CROPS = ['Wheat','Rice','Maize','Cotton','Tomato','Potato','Onion','Sugarcane','Soybean','Groundnut','Mustard','Sunflower'];

export default function ProfitCalculator() {
  const [form, setForm] = useState({ land_size:'', crop_name:'', seed_cost:'', fertilizer_cost:'', pesticide_cost:'', labour_cost:'', irrigation_cost:'', transport_cost:'', selling_price:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/profit/calculate', form);
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Calculation failed.');
    } finally { setLoading(false); }
  };

  const fmt = n => n != null ? `₹${Math.round(n).toLocaleString('en-IN')}` : '-';
  const fmtKg = n => n != null ? `${Math.round(n).toLocaleString('en-IN')} kg` : '-';

  return (
    <div className="fade-in">
      <div className="page-title">🧮 Crop Profit Calculator</div>
      <div className="page-subtitle">Calculate expected profit, ROI, and break-even price before you invest</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>📊 Input Costs</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">🌾 Crop *</label>
                <select className="input" value={form.crop_name} onChange={e => set('crop_name', e.target.value)} required>
                  <option value="">Select Crop</option>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">📐 Land Size (acres) *</label>
                <input className="input" type="number" step="0.5" placeholder="e.g. 2" value={form.land_size} onChange={e => set('land_size', e.target.value)} required />
              </div>
            </div>
            {[
              ['seed_cost', '🌱 Seed Cost (₹)'],
              ['fertilizer_cost', '🌿 Fertilizer Cost (₹)'],
              ['pesticide_cost', '⚗️ Pesticide Cost (₹)'],
              ['labour_cost', '👷 Labour Cost (₹)'],
              ['irrigation_cost', '💧 Irrigation Cost (₹)'],
              ['transport_cost', '🚛 Transport Cost (₹)'],
            ].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="label">{label}</label>
                <input className="input" type="number" step="1" placeholder="0" value={form[key]} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
            <div className="form-group">
              <label className="label">💰 Expected Selling Price (₹/kg) *</label>
              <input className="input" type="number" step="0.1" placeholder="e.g. 20" value={form.selling_price} onChange={e => set('selling_price', e.target.value)} required />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? '⏳ Calculating...' : '🧮 Calculate Profit'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <div className="result-card fade-in">
              <div style={{ textAlign: 'center', padding: '16px 0 20px', borderBottom: '2px dashed #C8E6C9', marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>Estimated Net Profit</div>
                <div style={{ fontSize: 40, fontWeight: 900, color: result.net_profit >= 0 ? '#2E7D32' : '#C62828' }}>
                  {fmt(result.net_profit)}
                </div>
                <div className="badge" style={{ marginTop: 8, fontSize: 14, background: result.roi_percent >= 0 ? '#E8F5E9' : '#FFEBEE', color: result.roi_percent >= 0 ? '#2E7D32' : '#C62828' }}>
                  ROI: {result.roi_percent?.toFixed(1)}%
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {[
                  { icon: '💸', label: 'Total Investment', val: fmt(result.total_cost), color: '#C62828', bg: '#FFEBEE' },
                  { icon: '📦', label: 'Expected Yield', val: fmtKg(result.expected_yield), color: '#1565C0', bg: '#E3F2FD' },
                  { icon: '💵', label: 'Total Revenue', val: fmt(result.total_revenue), color: '#2E7D32', bg: '#E8F5E9' },
                  { icon: '⚖️', label: 'Break-even Price', val: `₹${result.break_even_price?.toFixed(2)}/kg`, color: '#E65100', bg: '#FFF3E0' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{item.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: '#F3E5F5', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Profit per Acre</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#6A1B9A' }}>{fmt(result.profit_per_acre)}</div>
                </div>
                <div style={{ background: '#E0F7FA', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Avg Yield/Acre</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#00838F' }}>{result.yield_per_acre?.toLocaleString('en-IN')} kg</div>
                </div>
              </div>

              {result.net_profit < 0 && (
                <div className="alert alert-warning" style={{ marginTop: 16 }}>
                  ⚠️ This crop may result in a loss at ₹{form.selling_price}/kg. Minimum price needed: ₹{result.break_even_price?.toFixed(2)}/kg
                </div>
              )}
            </div>
          )}
          {!result && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>💰</div>
              <p style={{ color: '#888', fontSize: 15 }}>Fill in all your input costs and expected selling price to calculate crop profitability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
