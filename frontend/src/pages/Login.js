import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobile, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) return setError('Enter valid 10-digit mobile number');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/send-otp', { mobile });
      setOtpSent(true);
      setError('');
      if (data.simulated_otp) alert(`[Demo] Your OTP is: ${data.simulated_otp}`);
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp', { mobile, otp });
      if (data.token) {
        localStorage.setItem('km_token', data.token);
        localStorage.setItem('km_user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError('User not found. Please register first.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontWeight: 800, color: '#1B5E20', fontSize: 28 }}>Krishak Mitra AI</h1>
          <p style={{ color: '#666', fontSize: 14 }}>Login to your farming dashboard</p>
        </div>

        <div className="card" style={{ borderRadius: 20 }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: '#F5F5F5', borderRadius: 10,
            padding: 4, marginBottom: 24
          }}>
            {['Password Login', 'OTP Login'].map((m, i) => (
              <button key={m} onClick={() => { setOtpMode(i === 1); setError(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 8,
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  background: (otpMode ? i === 1 : i === 0) ? 'var(--green-primary)' : 'transparent',
                  color: (otpMode ? i === 1 : i === 0) ? 'white' : '#666',
                  transition: 'all 0.2s'
                }}>{m}</button>
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>⚠️ {error}</div>}

          {!otpMode ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label">📱 Mobile Number</label>
                <input className="input" type="tel" placeholder="10-digit mobile number" maxLength={10}
                  value={mobile} onChange={e => setMobile(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">🔒 Password</label>
                <input className="input" type="password" placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-primary w-full" type="submit" disabled={loading}
                style={{ justifyContent: 'center', marginTop: 8 }}>
                {loading ? '⏳ Logging in...' : '🚀 Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin}>
              <div className="form-group">
                <label className="label">📱 Mobile Number</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="input" type="tel" placeholder="10-digit mobile" maxLength={10}
                    value={mobile} onChange={e => setMobile(e.target.value)} />
                  <button type="button" className="btn btn-secondary" onClick={handleSendOtp}
                    disabled={loading || otpSent} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {otpSent ? '✅ Sent' : '📨 Send OTP'}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div className="form-group">
                  <label className="label">🔢 Enter OTP</label>
                  <input className="input" type="text" placeholder="6-digit OTP" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value)} />
                </div>
              )}
              <button className="btn btn-primary w-full" type="submit"
                disabled={loading || !otpSent} style={{ justifyContent: 'center', marginTop: 8 }}>
                {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
              </button>
            </form>
          )}

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>Register Free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
