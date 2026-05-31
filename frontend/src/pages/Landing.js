import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🔬', title: 'AI Crop Doctor', desc: 'Upload a photo of your crop to instantly detect diseases and get organic & chemical remedies.' },
  { icon: '🌱', title: 'Soil Health Advisor', desc: 'Enter soil parameters to get crop recommendations and fertilizer dosage tailored to your soil.' },
  { icon: '📅', title: 'Crop Calendar', desc: 'Get a week-by-week personalized farming schedule from sowing to harvest.' },
  { icon: '⛅', title: 'Weather Intelligence', desc: 'Real-time weather + 7-day forecast with farming-specific alerts for your location.' },
  { icon: '💰', title: 'Mandi Price Predictor', desc: 'Know current and predicted prices for your crop in 15+ Indian states. Sell at the right time.' },
  { icon: '🧮', title: 'Profit Calculator', desc: 'Calculate exact profit, break-even price, and ROI before committing to a crop.' },
  { icon: '💧', title: 'Irrigation Optimizer', desc: 'Smart water management based on crop stage, soil moisture, and weather forecast.' },
  { icon: '🎙️', title: 'Voice Assistant', desc: 'Ask farming questions in Hindi, Marathi, Punjabi, Telugu, or English. Get instant answers.' },
  { icon: '📸', title: 'Image to Text', desc: 'Scan fertilizer bags, pesticide labels, and seed packets. Get simplified summaries in local language.' },
  { icon: '👥', title: 'Farmer Hub', desc: 'Community platform to share and discover farming tips from experienced farmers.' },
  { icon: '🏛️', title: 'Government Schemes', desc: 'Eligibility checker for PM-KISAN, PMFBY, KCC, and 10+ other schemes with application steps.' },
  { icon: '🆘', title: 'Crop Loss Report', desc: 'Emergency reporting for crop damage with insurance claim guidance and report ID generation.' },
];

const stats = [
  { num: '13', label: 'AI-Powered Features' },
  { num: '5', label: 'Regional Languages' },
  { num: '8+', label: 'Major Crops Supported' },
  { num: 'Free', label: 'For All Farmers' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", overflowX: 'hidden' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '40px 20px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-150px', left: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)'
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', zIndex: 1 }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', borderRadius: 30,
                padding: '8px 16px', marginBottom: 24, backdropFilter: 'blur(10px)'
              }}>
                <span>🌾</span>
                <span style={{ color: '#A5D6A7', fontSize: 13, fontWeight: 600 }}>Smart Farming for Bharat</span>
              </div>
              <h1 style={{ color: 'white', fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
                Krishak Mitra AI
                <span style={{ display: 'block', color: '#A5D6A7', fontSize: 28, fontWeight: 500, marginTop: 8 }}>
                  आपका स्मार्ट खेती सहायक
                </span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                AI-powered farming assistant for Indian farmers. Get crop disease diagnosis, 
                soil advice, weather alerts, mandi prices, and government scheme guidance — 
                all in one place, in your language.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/register')}
                  style={{
                    background: '#FF9800', color: 'white', border: 'none', padding: '16px 36px',
                    borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(255,152,0,0.5)',
                    transition: 'all 0.2s'
                  }}>
                  🚀 शुरू करें – Start Free
                </button>
                <button onClick={() => navigate('/login')}
                  style={{
                    background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)',
                    padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit', backdropFilter: 'blur(10px)'
                  }}>
                  Login →
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['🌿 Disease Detection', '🌦️ Live Weather', '📊 Market Prices', '💡 AI Advice'].map(item => (
                <div key={item} style={{
                  background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '24px 20px',
                  color: 'white', fontWeight: 600, fontSize: 15, backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center'
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#FF9800', padding: '32px 20px' }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {stats.map(s => (
            <div key={s.num} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 20px', background: '#FAFDF7' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#1B5E20', marginBottom: 12 }}>
              13 Powerful Features
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              Everything an Indian farmer needs in one mobile-friendly app
            </p>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: 'white', borderRadius: 16, padding: '28px 24px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E8F5E9',
                transition: 'all 0.2s', cursor: 'default'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(46,125,50,0.15)';
                  e.currentTarget.style.borderColor = '#81C784';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#E8F5E9';
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1B5E20', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#666', fontSize: 13.5, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
        padding: '80px 20px', textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: 38, fontWeight: 800, marginBottom: 16 }}>
          Join Thousands of Smart Farmers
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
          Register free. No subscription. AI-powered farming guidance in your own language.
        </p>
        <button onClick={() => navigate('/register')} style={{
          background: '#FF9800', color: 'white', border: 'none',
          padding: '18px 48px', borderRadius: 14, fontSize: 18,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 6px 24px rgba(255,152,0,0.5)'
        }}>
          Register Now – Free 🌾
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1B5E20', padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
        <p>🌾 Krishak Mitra AI – Smart Farming Assistant for Indian Farmers</p>
        <p style={{ marginTop: 8 }}>Built with ❤️ for Bharat's farmers | LazyCoder's Team</p>
      </footer>
    </div>
  );
}
