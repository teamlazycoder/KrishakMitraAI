import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];
const CROPS = ['Wheat','Rice','Maize','Cotton','Sugarcane','Tomato','Potato','Onion','Soybean','Groundnut','Mustard','Chickpea'];
const LANGS = [{ val: 'hindi', label: 'हिंदी (Hindi)' },{ val: 'english', label: 'English' },{ val: 'marathi', label: 'मराठी (Marathi)' },{ val: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },{ val: 'telugu', label: 'తెలుగు (Telugu)' }];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    land_size: user?.land_size || '',
    primary_crops: user?.primary_crops || [],
    language_pref: user?.language_pref || 'hindi',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCrop = (crop) => {
    set('primary_crops', form.primary_crops.includes(crop)
      ? form.primary_crops.filter(c => c !== crop)
      : [...form.primary_crops, crop]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await updateProfile(form);
      setMsg('Profile updated successfully!');
    } catch { setMsg('Update failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="page-title">👤 My Profile</div>
      <div className="page-subtitle">Update your farming profile and preferences</div>

      <div style={{ maxWidth: 700 }}>
        <div className="card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #F0F0F0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'var(--green-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: 'white', fontWeight: 800
            }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#1B5E20' }}>{user?.full_name}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 2 }}>📱 {user?.mobile}</div>
              <div style={{ marginTop: 6 }}>
                <span className="badge badge-green">{user?.role === 'admin' ? '🔑 Admin' : '🧑‍🌾 Farmer'}</span>
              </div>
            </div>
          </div>

          {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 20 }}>
            {msg.includes('success') ? '✅' : '⚠️'} {msg}
          </div>}

          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">👤 Full Name</label>
                <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">📧 Email (optional)</label>
                <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">🏘️ Village/Town</label>
                <input className="input" value={form.village} onChange={e => set('village', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">🗺️ District</label>
                <input className="input" value={form.district} onChange={e => set('district', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">📍 State</label>
                <select className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">🌾 Land Size (acres)</label>
                <input className="input" type="number" step="0.5" value={form.land_size} onChange={e => set('land_size', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">🌿 Primary Crops</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {CROPS.map(crop => (
                  <button type="button" key={crop} onClick={() => toggleCrop(crop)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '2px solid', cursor: 'pointer', fontFamily: 'inherit',
                    background: form.primary_crops.includes(crop) ? 'var(--green-primary)' : 'transparent',
                    color: form.primary_crops.includes(crop) ? 'white' : 'var(--green-primary)',
                    borderColor: 'var(--green-primary)'
                  }}>{crop}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">🗣️ Language Preference</label>
              <select className="input" value={form.language_pref} onChange={e => set('language_pref', e.target.value)}>
                {LANGS.map(l => <option key={l.val} value={l.val}>{l.label}</option>)}
              </select>
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: 14, fontSize: 15 }}>
              {loading ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 14 }}>ℹ️ Account Information</h4>
          {[
            { label: 'Mobile', val: user?.mobile },
            { label: 'Member Since', val: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
            { label: 'Last Login', val: user?.last_login ? new Date(user.last_login).toLocaleString('en-IN') : 'Current session' },
            { label: 'Account Type', val: user?.role === 'admin' ? '🔑 Administrator' : '🧑‍🌾 Farmer Account' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F5F5', fontSize: 14 }}>
              <span style={{ color: '#888' }}>{row.label}</span>
              <span style={{ fontWeight: 600 }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
