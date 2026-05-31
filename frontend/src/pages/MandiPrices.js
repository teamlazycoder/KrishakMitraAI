import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';

const CROPS = ['Tomato','Potato','Onion','Wheat','Rice','Maize','Cotton','Sugarcane'];
const STATES = ['Delhi','Maharashtra','Karnataka','Punjab','Uttar Pradesh','Madhya Pradesh','Haryana','Gujarat','West Bengal','Andhra Pradesh','Telangana','Rajasthan'];

export default function MandiPrices() {
  const [allPrices, setAllPrices] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    API.get('/mandi/all-prices').then(r => { setAllPrices(r.data.prices); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const search = async () => {
    if (!selectedCrop) return;
    setDetailLoading(true);
    try {
      const url = selectedState ? `/mandi/price/${selectedCrop}?state=${encodeURIComponent(selectedState)}` : `/mandi/price/${selectedCrop}`;
      const { data } = await API.get(url);
      setDetail(data);
    } catch { setDetail(null); }
    setDetailLoading(false);
  };

  const trendIcon = t => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️';
  const trendClass = t => t === 'up' ? 'trend-up' : t === 'down' ? 'trend-down' : 'trend-stable';

  return (
    <div className="fade-in">
      <div className="page-title">💰 Mandi Price Predictor</div>
      <div className="page-subtitle">Current prices + AI-powered 30-day predictions for major crops across Indian states</div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>🔍 Search Prices</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">🌾 Crop</label>
            <select className="input" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
              <option value="">Select Crop</option>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label">📍 State (optional)</label>
            <select className="input" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
              <option value="">All States</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={search} disabled={detailLoading || !selectedCrop} style={{ height: 46 }}>
            {detailLoading ? '⏳' : '🔍 Get Price'}
          </button>
        </div>
      </div>

      {/* Detail result */}
      {detail && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #81C784' }}>
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>{detail.crop} – Price Analysis</h3>
          {detail.data ? (
            // Single state
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[
                { label: 'Current Price', val: `₹${detail.data.current}/${detail.data.unit}`, color: '#1B5E20' },
                { label: '7-Day Prediction', val: `₹${detail.data.p7}/${detail.data.unit}`, color: detail.data.trend === 'up' ? '#2E7D32' : '#C62828' },
                { label: '15-Day Prediction', val: `₹${detail.data.p15}/${detail.data.unit}`, color: '#1565C0' },
                { label: '30-Day Prediction', val: `₹${detail.data.p30}/${detail.data.unit}`, color: '#6A1B9A' },
              ].map(item => (
                <div key={item.label} style={{ background: '#F8FFF8', borderRadius: 12, padding: '16px', textAlign: 'center', border: '1px solid #E8F5E9' }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.val}</div>
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 24 }}>{trendIcon(detail.data.trend)}</span>
                <span className={trendClass(detail.data.trend)} style={{ fontWeight: 700 }}>
                  Price is {detail.data.trend === 'up' ? 'Rising 📈' : detail.data.trend === 'down' ? 'Falling 📉' : 'Stable ➡️'}
                </span>
                <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '6px 14px', borderRadius: 20, fontWeight: 600, fontSize: 14 }}>
                  💡 {detail.data.rec}
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>Confidence: {detail.data.confidence}%</span>
              </div>
            </div>
          ) : (
            // All states
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {Object.entries(detail.allStates || {}).map(([state, d]) => (
                <div key={state} style={{ background: '#F9FBE7', borderRadius: 12, padding: '16px', border: '1px solid #E8F5E9' }}>
                  <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>📍 {state}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>₹{d.current}<span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>/{d.unit}</span></div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>7d: ₹{d.p7}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20 }}>{trendIcon(d.trend)}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{d.confidence}% conf.</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, background: '#E8F5E9', borderRadius: 8, padding: '6px 10px', color: '#2E7D32' }}>
                    💡 {d.rec}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All crops summary */}
      {!loading && (
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>📊 Market Overview – All Crops</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#E8F5E9' }}>
                  {['Crop', 'Avg Price', 'Unit', 'Trend', 'States Available'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1B5E20', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPrices.map((p, i) => (
                  <tr key={p.crop} style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA', cursor: 'pointer' }}
                    onClick={() => { setSelectedCrop(p.crop); setSelectedState(''); }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F8E9'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#FAFAFA'}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{p.crop}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1B5E20', fontSize: 16 }}>₹{p.avg_price}</td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>per {p.unit}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={trendClass(p.trend)} style={{ fontWeight: 600 }}>
                        {trendIcon(p.trend)} {p.trend}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{p.states} states</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
