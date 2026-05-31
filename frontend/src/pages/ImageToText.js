import React, { useState, useRef } from 'react';
import { API } from '../context/AuthContext';

export default function ImageToText() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const extract = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      const { data } = await API.post('/image-to-text/extract', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
    } catch { setResult(null); }
    setLoading(false);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'hi-IN';
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-title">📸 Image to Text</div>
      <div className="page-subtitle">Scan fertilizer bags, seed packets, and pesticide labels – get simplified summaries</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>📷 Upload Label/Packet</h3>
          <div style={{ border: '2px dashed #81C784', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#FAFFF9' }} onClick={() => fileRef.current?.click()}>
            {preview ? <img src={preview} alt="Preview" style={{ maxHeight: 200, borderRadius: 10, maxWidth: '100%', objectFit: 'cover' }} /> :
              <><div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div><p style={{ color: '#666' }}>Click to upload label photo</p><p style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>Seed Packet, Fertilizer Bag, Pesticide Label</p></>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
          <button className="btn btn-primary w-full" style={{ marginTop: 16, justifyContent: 'center', padding: 13 }} onClick={extract} disabled={loading || !image}>
            {loading ? '⏳ Extracting Text...' : '🔍 Extract Text'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="result-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>🏷️ {result.type?.replace('_', ' ')}</span>
                <button onClick={() => speak(result.extracted_text)} style={{ background: '#E8F5E9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2E7D32', fontFamily: 'inherit' }}>
                  🔊 Read Aloud
                </button>
              </div>
              <div style={{ background: '#F9FBE7', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 8 }}>📝 EXTRACTED TEXT:</div>
                <pre style={{ fontFamily: 'inherit', fontSize: 13, color: '#333', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{result.extracted_text}</pre>
              </div>
              <div style={{ background: '#E3F2FD', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#1565C0', fontWeight: 700, marginBottom: 6 }}>💡 SUMMARY:</div>
                <div style={{ fontSize: 14, color: '#1565C0', lineHeight: 1.6 }}>{result.summary}</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📖</div>
              <p style={{ color: '#888', fontSize: 15 }}>Upload an image of any agricultural label to extract and understand its contents.</p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['🌱 Seed packets', '🌿 Fertilizer bags', '⚗️ Pesticide labels', '🔬 Soil amendment bags'].map(t => (
                  <div key={t} style={{ fontSize: 14, color: '#666', padding: '8px 16px', background: '#F5F5F5', borderRadius: 8 }}>{t}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
