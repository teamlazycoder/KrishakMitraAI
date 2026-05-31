import React, { useState, useEffect, useRef } from 'react';
import { API } from '../context/AuthContext';

const LANGUAGES = [{ val: 'en-IN', label: 'English' }, { val: 'hi-IN', label: 'हिंदी' }, { val: 'mr-IN', label: 'मराठी' }, { val: 'pa-IN', label: 'ਪੰਜਾਬੀ' }, { val: 'te-IN', label: 'తెలుగు' }];
const SUGGESTIONS = ['What fertilizer for wheat?', 'When to sow tomato?', 'Mausam kaisa rahega?', 'How to control pest in cotton?', 'Government schemes for farmers', 'Organic pest control tips', 'Best irrigation time for rice?', 'How to improve soil pH?'];

export default function VoiceAssistant() {
  const [lang, setLang] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = lang;
    recog.continuous = false;
    recog.interimResults = true;
    recog.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };
    recog.onend = () => { setRecording(false); };
    recog.onerror = () => setRecording(false);
    recogRef.current = recog;
    recog.start();
    setRecording(true);
    setTranscript('');
  };

  const stopRecording = () => {
    recogRef.current?.stop();
    setRecording(false);
  };

  const askQuery = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.post('/voice/process', { text: query, language: lang });
      setResponse(data.response);
      setHistory(h => [{ query, response: data.response, time: new Date().toLocaleTimeString() }, ...h.slice(0, 9)]);
      // TTS
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(data.response);
        utt.lang = lang;
        window.speechSynthesis.speak(utt);
      }
    } catch { setResponse('Sorry, could not process your query. Please try again.'); }
    setLoading(false);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-title">🎙️ Voice AI Assistant</div>
      <div className="page-subtitle">Ask farming questions by voice or text in your preferred language</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            {/* Language */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {LANGUAGES.map(l => (
                <button key={l.val} onClick={() => setLang(l.val)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    border: '2px solid', fontFamily: 'inherit', transition: 'all 0.15s',
                    background: lang === l.val ? 'var(--green-primary)' : 'transparent',
                    color: lang === l.val ? 'white' : 'var(--green-primary)',
                    borderColor: 'var(--green-primary)'
                  }}>{l.label}</button>
              ))}
            </div>

            {/* Mic */}
            {!supported && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                🌐 Voice input not supported in this browser. Use Chrome for voice recognition. Type your question below.
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button className={`mic-btn ${recording ? 'recording' : ''}`} onClick={recording ? stopRecording : startRecording} disabled={!supported}>
                {recording ? '⏹️' : '🎙️'}
              </button>
              <div style={{ marginTop: 12, fontSize: 14, color: recording ? '#C62828' : '#666', fontWeight: 600 }}>
                {recording ? '🔴 Listening... Click to stop' : supported ? 'Click microphone to speak' : 'Voice not supported'}
              </div>
            </div>

            {/* Transcript */}
            {transcript && (
              <div style={{ background: '#E3F2FD', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#1565C0', fontWeight: 600, marginBottom: 6 }}>📝 Transcript:</div>
                <div style={{ fontSize: 15, color: '#1B5E20' }}>{transcript}</div>
                <button className="btn btn-primary" style={{ marginTop: 10, fontSize: 13 }} onClick={() => askQuery(transcript)}>
                  🚀 Get Answer
                </button>
              </div>
            )}

            {/* Manual input */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" placeholder="Or type your farming question here..." value={transcript}
                onChange={e => setTranscript(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && askQuery(transcript)} />
              <button className="btn btn-primary" onClick={() => askQuery(transcript)} disabled={loading || !transcript.trim()}
                style={{ flexShrink: 0 }}>
                {loading ? '⏳' : '→'}
              </button>
            </div>

            {/* Response */}
            {response && (
              <div style={{ marginTop: 16, background: '#E8F5E9', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 13, color: '#2E7D32', fontWeight: 700 }}>🤖 AI Response:</div>
                  <button onClick={() => speak(response)} style={{ background: 'none', border: '1px solid #81C784', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#2E7D32', fontFamily: 'inherit' }}>
                    🔊 Read Aloud
                  </button>
                </div>
                <div style={{ fontSize: 15, color: '#1B5E20', lineHeight: 1.7 }}>{response}</div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="card">
            <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 14 }}>💡 Common Questions</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setTranscript(s); askQuery(s); }}
                  style={{ background: '#F1F8E9', border: '1px solid #C8E6C9', borderRadius: 20, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit', color: '#2E7D32', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-pale)'; e.currentTarget.style.borderColor = '#81C784'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F1F8E9'; e.currentTarget.style.borderColor = '#C8E6C9'; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card">
          <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>📋 Conversation History</h4>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#888', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              No conversations yet. Ask a question!
            </div>
          ) : history.map((h, i) => (
            <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ fontWeight: 600, color: '#1B5E20', fontSize: 13, marginBottom: 4 }}>🧑‍🌾 {h.query}</div>
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>🤖 {h.response.slice(0, 120)}{h.response.length > 120 ? '...' : ''}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>🕐 {h.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
