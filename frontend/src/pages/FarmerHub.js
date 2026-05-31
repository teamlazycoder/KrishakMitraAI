import React, { useState, useEffect, useCallback } from 'react';
import { API, useAuth } from '../context/AuthContext';

const CROPS = ['All', 'Wheat', 'Rice', 'Maize', 'Cotton', 'Tomato', 'Potato', 'Onion', 'Sugarcane', 'General'];
const CATS = ['All', 'Pest Control', 'Disease Control', 'Fertilizer', 'Water Management', 'Soil Management', 'Post-Harvest'];

export default function FarmerHub() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ crop: 'All', category: 'All', search: '', sort: 'upvotes' });
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ advice_text: '', crop_tag: 'General', category: 'General', is_anonymous: false });
  const [posting, setPosting] = useState(false);

  const fetchPosts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.crop !== 'All') params.set('crop', f.crop);
      if (f.category !== 'All') params.set('category', f.category);
      if (f.search) params.set('search', f.search);
      params.set('sort', f.sort);
      const { data } = await API.get(`/hub/posts?${params}`);
      setPosts(data.posts);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(filter); }, [filter, fetchPosts]);

  const upvote = async (id) => {
    try {
      const { data } = await API.put(`/hub/posts/${id}/upvote`);
      setPosts(ps => ps.map(p => p.id === id ? { ...p, upvotes: data.upvotes, user_upvoted: data.user_upvoted } : p));
    } catch { }
  };

  const submit = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await API.post('/hub/posts', { ...newPost, farmer_name: user?.full_name });
      setShowForm(false);
      setNewPost({ advice_text: '', crop_tag: 'General', category: 'General', is_anonymous: false });
      fetchPosts(filter);
    } catch { }
    setPosting(false);
  };

  const timeAgo = (t) => {
    const s = Math.floor((Date.now() - new Date(t)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ marginBottom: 4 }}>👥 Farmer Hub</div>
          <div className="page-subtitle" style={{ marginBottom: 0 }}>Community wisdom – tips shared by farmers, for farmers</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '✏️ Share My Tip'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #81C784' }}>
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 16 }}>✏️ Share Your Farming Tip</h3>
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">💬 Your Advice *</label>
              <textarea className="input" rows={3} placeholder="Share a tip that helped you... (min 20 characters)"
                value={newPost.advice_text}
                onChange={e => setNewPost(n => ({ ...n, advice_text: e.target.value }))}
                required style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">🌾 Crop Tag</label>
                <select className="input" value={newPost.crop_tag} onChange={e => setNewPost(n => ({ ...n, crop_tag: e.target.value }))}>
                  {CROPS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">📁 Category</label>
                <select className="input" value={newPost.category} onChange={e => setNewPost(n => ({ ...n, category: e.target.value }))}>
                  {CATS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--green-primary)' }}
                checked={newPost.is_anonymous}
                onChange={e => setNewPost(n => ({ ...n, is_anonymous: e.target.checked }))} />
              <span style={{ fontSize: 14, color: '#666' }}>Post anonymously</span>
            </label>
            <button className="btn btn-primary" type="submit" disabled={posting} style={{ justifyContent: 'center' }}>
              {posting ? '⏳ Posting...' : '📤 Post Tip'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" placeholder="🔍 Search tips..." style={{ flex: '1 1 200px' }}
            value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
          <select className="input" style={{ flex: '0 0 140px' }} value={filter.crop}
            onChange={e => setFilter(f => ({ ...f, crop: e.target.value }))}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input" style={{ flex: '0 0 160px' }} value={filter.category}
            onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input" style={{ flex: '0 0 130px' }} value={filter.sort}
            onChange={e => setFilter(f => ({ ...f, sort: e.target.value }))}>
            <option value="upvotes">Top Rated</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              <p style={{ color: '#888' }}>No posts found. Be the first to share a tip!</p>
            </div>
          )}
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#1B5E20', fontSize: 14 }}>🧑‍🌾 {post.farmer_name}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>• {timeAgo(post.created_at)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                  <span className="badge badge-green" style={{ fontSize: 12 }}>{post.crop_tag}</span>
                  {post.is_ai_verified && (
                    <span className="badge" style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 11 }}>✅ Verified</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 14.5, color: '#333', lineHeight: 1.7, marginBottom: 14 }}>{post.advice_text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-blue" style={{ fontSize: 12 }}>{post.category}</span>
                <button onClick={() => upvote(post.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: post.user_upvoted ? '#E8F5E9' : '#F5F5F5',
                  border: `1px solid ${post.user_upvoted ? '#81C784' : '#E0E0E0'}`,
                  borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
                  color: post.user_upvoted ? '#2E7D32' : '#666', transition: 'all 0.15s'
                }}>
                  👍 {post.upvotes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
