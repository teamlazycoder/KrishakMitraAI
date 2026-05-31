import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const states = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];
const crops = ['Wheat','Rice','Maize','Cotton','Sugarcane','Tomato','Potato','Onion','Soybean','Groundnut','Mustard','Chickpea','Mango','Banana'];
const languages = [{ val: 'hindi', label: 'हिंदी (Hindi)' },{ val: 'english', label: 'English' },{ val: 'marathi', label: 'मराठी (Marathi)' },{ val: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },{ val: 'telugu', label: 'తెలుగు (Telugu)' }];

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', mobile: '', password: '', confirm_password: '',
    village: '', district: '', state: '', land_size: '',
    primary_crops: [], language_pref: 'hindi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCrop = (crop) => {
    set('primary_crops', form.primary_crops.includes(crop)
      ? form.primary_crops.filter(c => c !== crop)
      : [...form.primary_crops, crop]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) return setError('Passwords do not match.');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Mobile must be 10 digits.');
    setLoading(true);
    try {
      const { confirm_password, ...data } = form;
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)',
      padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontWeight: 800, color: '#1B5E20', fontSize: 26 }}>Create Your Account</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Join Krishak Mitra AI – It's free!</p>
        </div>

        <div className="card" style={{ borderRadius: 20 }}>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">👤 Full Name *</label>
                <input className="input" placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">📱 Mobile Number *</label>
                <input className="input" type="tel" placeholder="10-digit number" maxLength={10} value={form.mobile} onChange={e => set('mobile', e.target.value)} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">🔒 Password *</label>
                <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">🔒 Confirm Password *</label>
                <input className="input" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">🏘️ Village/Town</label>
                <input className="input" placeholder="Your village or town" value={form.village} onChange={e => set('village', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">🗺️ District</label>
                <input className="input" placeholder="Your district" value={form.district} onChange={e => set('district', e.target.value)} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">📍 State</label>
                <select className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">🌾 Land Size (acres)</label>
                <input className="input" type="number" step="0.5" placeholder="e.g. 2.5" value={form.land_size} onChange={e => set('land_size', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">🌿 Primary Crops (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {crops.map(crop => (
                  <button type="button" key={crop}
                    onClick={() => toggleCrop(crop)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                      border: '2px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      background: form.primary_crops.includes(crop) ? 'var(--green-primary)' : 'transparent',
                      color: form.primary_crops.includes(crop) ? 'white' : 'var(--green-primary)',
                      borderColor: 'var(--green-primary)'
                    }}>
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">🗣️ Preferred Language</label>
              <select className="input" value={form.language_pref} onChange={e => set('language_pref', e.target.value)}>
                {languages.map(l => <option key={l.val} value={l.val}>{l.label}</option>)}
              </select>
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading}
              style={{ justifyContent: 'center', padding: '14px', fontSize: 16, marginTop: 8 }}>
              {loading ? '⏳ Creating Account...' : '🚀 Create Free Account'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
