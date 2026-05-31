const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

let posts = [
  { id: uuidv4(), farmer_name: 'Rajesh Kumar from Punjab', is_anonymous: false, advice_text: 'Use 10% less water in February for better grain quality in wheat. I have been doing this for 5 years and yields improved by 15%.', crop_tag: 'Wheat', category: 'Water Management', upvotes: 24, is_ai_verified: true, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: uuidv4(), farmer_name: 'Savitri Devi from Maharashtra', is_anonymous: false, advice_text: 'Neem oil + garlic spray works wonders for bollworm in cotton. Mix 5ml neem oil + 10ml garlic extract in 1 litre water. Spray every 10 days.', crop_tag: 'Cotton', category: 'Pest Control', upvotes: 56, is_ai_verified: true, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: uuidv4(), farmer_name: 'Amit Singh from UP', is_anonymous: false, advice_text: "Don't burn paddy stubble. Mix it with soil as compost. Add Trichoderma 1kg per acre to decompose faster. Next crop yield increases by 20%.", crop_tag: 'Rice', category: 'Soil Management', upvotes: 89, is_ai_verified: true, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: uuidv4(), farmer_name: 'Priya from Karnataka', is_anonymous: false, advice_text: 'Spray 00:52:34 (Mono Potassium Phosphate) at 3g/L during tomato flowering. Fruit set improved dramatically and size was bigger.', crop_tag: 'Tomato', category: 'Fertilizer', upvotes: 42, is_ai_verified: true, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: uuidv4(), farmer_name: 'Mohammad Iqbal from Haryana', is_anonymous: false, advice_text: 'For wheat yellow rust, spray immediately at first sign. Delay of even 5 days can reduce yield by 30%. Keep Tebuconazole ready in store.', crop_tag: 'Wheat', category: 'Disease Control', upvotes: 67, is_ai_verified: true, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: uuidv4(), farmer_name: 'Sunita from Gujarat', is_anonymous: false, advice_text: 'Cover onion windrows with dried onion leaves during curing. Prevents greening and improves storage life from 2 months to 4 months.', crop_tag: 'Onion', category: 'Post-Harvest', upvotes: 31, is_ai_verified: false, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const upvoteTracker = new Map();

// GET /api/hub/posts
router.get('/posts', protect, (req, res) => {
  const { crop, category, search, sort = 'upvotes' } = req.query;
  let filtered = [...posts];
  if (crop) filtered = filtered.filter(p => p.crop_tag === crop);
  if (category) filtered = filtered.filter(p => p.category === category);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => p.advice_text.toLowerCase().includes(s) || p.crop_tag.toLowerCase().includes(s));
  }
  if (sort === 'upvotes') filtered.sort((a, b) => b.upvotes - a.upvotes);
  else filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const userUpvotes = upvoteTracker.get(req.user.id) || new Set();
  const postsWithVote = filtered.map(p => ({ ...p, user_upvoted: userUpvotes.has(p.id) }));
  res.json({ success: true, posts: postsWithVote, total: filtered.length });
});

// POST /api/hub/posts
router.post('/posts', protect, (req, res) => {
  const { advice_text, crop_tag, category, is_anonymous } = req.body;
  if (!advice_text || advice_text.length < 20) {
    return res.status(400).json({ error: 'Advice must be at least 20 characters.' });
  }
  const post = {
    id: uuidv4(),
    user_id: req.user.id,
    farmer_name: is_anonymous ? 'Anonymous Farmer' : (req.body.farmer_name || 'Farmer'),
    is_anonymous: !!is_anonymous,
    advice_text, crop_tag: crop_tag || 'General',
    category: category || 'General',
    upvotes: 0, is_ai_verified: false,
    created_at: new Date().toISOString()
  };
  posts.unshift(post);
  res.status(201).json({ success: true, post });
});

// PUT /api/hub/posts/:id/upvote
router.put('/posts/:id/upvote', protect, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (!upvoteTracker.has(req.user.id)) upvoteTracker.set(req.user.id, new Set());
  const userVotes = upvoteTracker.get(req.user.id);

  if (userVotes.has(post.id)) {
    post.upvotes = Math.max(0, post.upvotes - 1);
    userVotes.delete(post.id);
    return res.json({ success: true, upvotes: post.upvotes, user_upvoted: false });
  }
  post.upvotes++;
  userVotes.add(post.id);
  res.json({ success: true, upvotes: post.upvotes, user_upvoted: true });
});

// GET filters
router.get('/filters', (req, res) => {
  res.json({
    crops: ['Wheat', 'Rice', 'Maize', 'Cotton', 'Tomato', 'Potato', 'Onion', 'Sugarcane', 'General'],
    categories: ['Pest Control', 'Disease Control', 'Fertilizer', 'Water Management', 'Soil Management', 'Post-Harvest', 'General']
  });
});

module.exports = router;
