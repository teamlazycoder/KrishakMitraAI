import React, { useState, useRef } from 'react';
import { API } from '../context/AuthContext';

export default function CropDoctor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return setError('Please upload an image file.');
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!image) return setError('Please upload a crop image first.');
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', image);
      const { data } = await API.post('/crop-doctor/analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.diagnosis);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const share = () => {
    if (!result) return;
    const msg = `Krishak Mitra AI Analysis:\nDisease: ${result.disease_name}\nCrop: ${result.crop_name}\nOrganic Remedy: ${result.remedy_organic}\nChemical Remedy: ${result.remedy_chemical}`;
    if (navigator.share) navigator.share({ title: 'Crop Diagnosis', text: msg });
    else { navigator.clipboard.writeText(msg); alert('Result copied to clipboard!'); }
  };

  return (
    <div className="fade-in">
      <div className="page-title">🔬 AI Crop Doctor</div>
      <div className="page-subtitle">Upload a photo of your diseased crop leaf for instant AI diagnosis</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Upload */}
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>📤 Upload Crop Photo</h3>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

          <div
            className={`upload-area ${dragging ? 'dragging' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <div>
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 10, objectFit: 'cover' }} />
                <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}>Click to change image</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📷</div>
                <p style={{ fontWeight: 600, color: '#444', marginBottom: 8 }}>Drag & drop or click to upload</p>
                <p style={{ fontSize: 13, color: '#888' }}>Supports JPG, PNG, WEBP (max 5MB)</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />

          <button className="btn btn-primary w-full" style={{ marginTop: 16, justifyContent: 'center', padding: 14, fontSize: 16 }}
            onClick={analyze} disabled={loading || !image}>
            {loading ? <><span className="spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white' }}></span> Analyzing...</> : '🔍 Analyze Crop'}
          </button>

          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 10 }}>💡 Works best with:</p>
            {['Clear close-up of affected leaves', 'Good natural lighting', 'Single leaf in frame', 'Fresh sample (not dried)'].map(t => (
              <div key={t} style={{ fontSize: 13, color: '#666', padding: '4px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--green-primary)' }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
              <p style={{ color: '#888', fontSize: 15 }}>Upload a crop image and click Analyze to get instant disease diagnosis with remedies.</p>
            </div>
          )}
          {loading && (
            <div className="card loading">
              <div className="spinner"></div>
              <p>AI is analyzing your crop...</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>This takes 2-3 seconds</p>
            </div>
          )}
          {result && (
            <div className="result-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <span className="badge badge-blue" style={{ marginBottom: 8 }}>🌱 {result.crop_name}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1B5E20' }}>{result.disease_name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Confidence</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: result.confidence > 85 ? '#2E7D32' : '#F57C00' }}>
                    {result.confidence}%
                  </div>
                </div>
              </div>

              <div className="confidence-bar" style={{ marginBottom: 24 }}>
                <div className="confidence-fill" style={{ width: `${result.confidence}%` }}></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ background: '#E8F5E9', borderRadius: 8, padding: '6px 10px', fontSize: 16 }}>🌿</span>
                  <h4 style={{ fontWeight: 700, color: '#2E7D32', fontSize: 15 }}>Organic Remedy</h4>
                </div>
                <div style={{ background: '#F1F8E9', borderRadius: 10, padding: '14px 16px', fontSize: 14, color: '#33691E', lineHeight: 1.6 }}>
                  {result.remedy_organic}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ background: '#FFF3E0', borderRadius: 8, padding: '6px 10px', fontSize: 16 }}>⚗️</span>
                  <h4 style={{ fontWeight: 700, color: '#E65100', fontSize: 15 }}>Chemical Remedy</h4>
                </div>
                <div style={{ background: '#FFF8E1', borderRadius: 10, padding: '14px 16px', fontSize: 14, color: '#E65100', lineHeight: 1.6 }}>
                  {result.remedy_chemical}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={share} style={{ flex: 1, justifyContent: 'center' }}>
                  📤 Share Result
                </button>
                <button className="btn btn-outline" onClick={() => { setResult(null); setPreview(null); setImage(null); }} style={{ flex: 1, justifyContent: 'center' }}>
                  🔄 New Analysis
                </button>
              </div>

              <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFF9C4', borderRadius: 10, fontSize: 12, color: '#5D4037' }}>
                ⚠️ <strong>Note:</strong> AI diagnosis is indicative. Consult your local agriculture extension officer for severe infestations.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
