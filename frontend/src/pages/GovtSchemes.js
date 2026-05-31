import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';

export default function GovtSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [eligible, setEligible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ land_size: '', category: '', state: '' });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/schemes').then(r => { setSchemes(r.data.schemes); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const checkEligibility = async () => {
    try {
      const { data } = await API.post('/schemes/check-eligibility', form);
      setEligible(data);
    } catch { }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const displaySchemes = eligible ? eligible.eligible_schemes : schemes;

  return (
    <div className="fade-in">
      <div className="page-title">🏛️ Government Schemes</div>
      <div className="page-subtitle">Discover government schemes you qualify for and learn how to apply</div>

      {/* Eligibility Checker */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)', border: '2px solid #81C784' }}>
        <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>✅ Eligibility Checker</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label className="label">Land Size (acres)</label>
            <input className="input" type="number" step="0.5" placeholder="Your land size" value={form.land_size} onChange={e => setForm(f => ({ ...f, land_size: e.target.value }))} />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select</option>
              {['General', 'OBC', 'SC', 'ST', 'Minority'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label className="label">State</label>
            <select className="input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
              <option value="">Select</option>
              {['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat', 'Haryana', 'West Bengal', 'Karnataka', 'Rajasthan', 'Bihar'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={checkEligibility} style={{ height: 46 }}>
            🔍 Check Eligibility
          </button>
          {eligible && <button className="btn btn-secondary" onClick={() => setEligible(null)} style={{ height: 46 }}>Show All</button>}
        </div>
        {eligible && (
          <div className="alert alert-success" style={{ marginTop: 16 }}>
            🎉 You are eligible for <strong>{eligible.total}</strong> out of {schemes.length} schemes!
          </div>
        )}
      </div>

      {/* Schemes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displaySchemes.map(scheme => (
          <div key={scheme.id} className="scheme-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className="badge badge-green" style={{ fontWeight: 800 }}>{scheme.name}</span>
                  <span className="badge" style={{ background: '#E3F2FD', color: '#1565C0', fontSize: 11 }}>{scheme.status}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#1B5E20', fontSize: 16 }}>{scheme.full_name}</h3>
                <div style={{ marginTop: 6, fontSize: 14, color: '#388E3C', fontWeight: 600 }}>💰 {scheme.benefit}</div>
              </div>
              <div style={{ fontSize: 20, color: '#888', flexShrink: 0, marginLeft: 12 }}>
                {expanded === scheme.id ? '▲' : '▼'}
              </div>
            </div>

            {expanded === scheme.id && (
              <div className="fade-in" style={{ marginTop: 20, borderTop: '1px solid #E8F5E9', paddingTop: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>📋 Required Documents</div>
                    {scheme.documents.map((d, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#555', padding: '4px 0', display: 'flex', gap: 8 }}>
                        <span style={{ color: '#2E7D32' }}>✓</span>{d}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>📅 Application Deadline</div>
                    <div style={{ fontSize: 13, color: '#E65100', fontWeight: 600, marginBottom: 12 }}>{scheme.deadline}</div>
                    <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>📞 Helpline</div>
                    <div style={{ fontSize: 13, color: '#1565C0', fontWeight: 600 }}>{scheme.helpline}</div>
                  </div>
                </div>
                <div style={{ background: '#E8F5E9', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>📝 How to Apply</div>
                  <div style={{ fontSize: 14, color: '#33691E' }}>{scheme.how_to_apply}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
