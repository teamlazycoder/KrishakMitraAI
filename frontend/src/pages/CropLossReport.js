import React, { useState, useEffect } from 'react';
import { API, useAuth } from '../context/AuthContext';

export default function CropLossReport() {
  const { user } = useAuth();
  const [form, setForm] = useState({ crop_name:'', loss_cause:'', affected_area:'', loss_date:'', description:'' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    API.get('/report/user-reports').then(r => setHistory(r.data.reports)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/report/crop-loss', form);
      setResult(data.report);
      setHistory(h => [data.report, ...h]);
    } catch (err) {
      setError(err.response?.data?.error || 'Report submission failed.');
    } finally { setLoading(false); }
  };

  const statusColor = s => s === 'pending' ? '#F57F17' : s === 'approved' ? '#2E7D32' : '#C62828';

  return (
    <div className="fade-in">
      <div className="page-title">🆘 Emergency Crop Loss Report</div>
      <div className="page-subtitle">Report crop damage for insurance claim support and compensation guidance</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#C62828', marginBottom: 20 }}>📋 Report Crop Loss</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">👤 Farmer Name</label>
              <input className="input" value={user?.full_name || ''} disabled style={{ background: '#F5F5F5' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">🌾 Affected Crop *</label>
                <select className="input" value={form.crop_name} onChange={e => set('crop_name', e.target.value)} required>
                  <option value="">Select Crop</option>
                  {['Wheat','Rice','Maize','Cotton','Tomato','Potato','Onion','Sugarcane','Pulses','Vegetables'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">⚠️ Cause of Loss *</label>
                <select className="input" value={form.loss_cause} onChange={e => set('loss_cause', e.target.value)} required>
                  <option value="">Select Cause</option>
                  {['Flood','Drought','Hailstorm','Pest Attack','Disease','Fire','Frost','Cyclone','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">📐 Affected Area (acres) *</label>
                <input className="input" type="number" step="0.5" placeholder="e.g. 2.5" value={form.affected_area} onChange={e => set('affected_area', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">📅 Date of Loss</label>
                <input className="input" type="date" max={new Date().toISOString().split('T')[0]} value={form.loss_date} onChange={e => set('loss_date', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">📝 Description (optional)</label>
              <textarea className="input" rows={3} placeholder="Describe the damage in detail..." value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-orange w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? '⏳ Submitting Report...' : '🆘 Submit Loss Report'}
            </button>
          </form>
        </div>

        <div>
          {result ? (
            <div className="result-card fade-in" style={{ border: '2px solid #FFCDD2', background: '#FFF8F8' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
                <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>Report Submitted!</div>
                <div style={{ background: '#E8F5E9', display: 'inline-block', padding: '8px 20px', borderRadius: 20, fontWeight: 800, color: '#2E7D32', fontSize: 16 }}>
                  ID: {result.report_id}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#FFF3E0', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>Estimated Loss</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#E65100' }}>{result.loss_percentage}%</div>
                </div>
                <div style={{ background: '#E8F5E9', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>Compensation Est.</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2E7D32' }}>₹{result.compensation_estimate?.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 10 }}>📌 Next Steps:</div>
                {result.next_steps?.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#555', padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span style={{ fontWeight: 800, color: '#E65100', flexShrink: 0 }}>{i + 1}.</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌧️</div>
              <p style={{ color: '#888', fontSize: 15 }}>Submit your crop loss report to get insurance claim guidance and estimated compensation.</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 14 }}>📂 Past Reports</h4>
              {history.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.crop_name} – {r.loss_cause}</div>
                    <div style={{ color: '#888', marginTop: 2 }}>ID: {r.report_id} · {r.affected_area} acres</div>
                  </div>
                  <span style={{ color: statusColor(r.status), fontWeight: 700, fontSize: 12, textTransform: 'capitalize' }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
