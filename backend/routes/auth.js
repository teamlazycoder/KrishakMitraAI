const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Import database
const { protect } = require('../middleware/auth');

const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    { id: user.id, mobile: user.mobile, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret_dev_only',
    { expiresIn }
  );
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Store OTPs in PostgreSQL (or keep in memory since they're temporary)
const otpStore = new Map(); // OTPs can stay in memory (temporary)

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      full_name, mobile, password, village, district,
      state, land_size, primary_crops, language_pref, email
    } = req.body;

    // Validation
    if (!full_name || !mobile || !password) {
      return res.status(400).json({ error: 'Name, mobile, and password are required.' });
    }
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile must be 10 digits.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists in PostgreSQL
    const existingUser = await db.query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Mobile number already registered.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Insert user into PostgreSQL
    const result = await db.query(
      `INSERT INTO users (full_name, mobile, password_hash, email, village, district, 
        state, land_size, primary_crops, language_pref, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING id, full_name, mobile, email, village, district, state, 
                 land_size, primary_crops, language_pref, role, created_at`,
      [
        full_name, mobile, password_hash, email || null, village || '', 
        district || '', state || '', land_size || null, 
        primary_crops || [], language_pref || 'hindi', 'farmer'
      ]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, mobile: user.mobile, role: user.role });
    
    res.status(201).json({ 
      message: 'Registration successful!', 
      token, 
      user 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile and password are required.' });
    }

    // Find user in PostgreSQL
    const result = await db.query(
      'SELECT * FROM users WHERE mobile = $1',
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid mobile number or password.' });
    }

    const user = result.rows[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid mobile number or password.' });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const token = generateToken({ id: user.id, mobile: user.mobile, role: user.role });
    
    // Remove password hash from response
    const { password_hash, ...userOut } = user;
    
    res.json({ message: 'Login successful!', token, user: userOut });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ error: 'Valid 10-digit mobile required.' });
  }
  const otp = generateOTP();
  otpStore.set(mobile, { otp, expires: Date.now() + 10 * 60 * 1000 });
  console.log(`[OTP SIMULATION] Mobile: ${mobile} OTP: ${otp}`);
  res.json({ message: `OTP sent to ${mobile} (Simulated: ${otp})`, simulated_otp: otp });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  const stored = otpStore.get(mobile);
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }
  otpStore.delete(mobile);

  // Check if user exists in PostgreSQL
  const result = await db.query(
    'SELECT * FROM users WHERE mobile = $1',
    [mobile]
  );

  if (result.rows.length > 0) {
    const user = result.rows[0];
    const token = generateToken({ id: user.id, mobile: user.mobile, role: user.role });
    const { password_hash, ...userOut } = user;
    return res.json({ message: 'OTP verified!', token, user: userOut });
  }
  
  res.json({ message: 'OTP verified! Proceed to register.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ error: 'Valid 10-digit mobile required.' });
  }
  
  // Check if user exists in PostgreSQL
  const result = await db.query('SELECT id FROM users WHERE mobile = $1', [mobile]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Mobile number not registered.' });
  }
  
  const otp = generateOTP();
  otpStore.set(mobile + '_reset', { otp, expires: Date.now() + 10 * 60 * 1000 });
  console.log(`[RESET OTP SIMULATION] Mobile: ${mobile} OTP: ${otp}`);
  res.json({ message: `Reset OTP sent to ${mobile} (Simulated: ${otp})`, simulated_otp: otp });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { mobile, otp, new_password } = req.body;
  const stored = otpStore.get(mobile + '_reset');
  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }
  
  // Update password in PostgreSQL
  const password_hash = await bcrypt.hash(new_password, 10);
  await db.query(
    'UPDATE users SET password_hash = $1 WHERE mobile = $2',
    [password_hash, mobile]
  );
  
  otpStore.delete(mobile + '_reset');
  res.json({ message: 'Password reset successful!' });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name, mobile, email, village, district, state, land_size, primary_crops, language_pref, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['full_name', 'village', 'district', 'state', 'land_size', 'primary_crops', 'language_pref', 'email'];
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(req.body[field]);
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, full_name, mobile, email, village, district, state, land_size, primary_crops, language_pref, role`;
    
    const result = await db.query(query, values);
    res.json({ message: 'Profile updated!', user: result.rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Update failed.' });
  }
});

// GET /api/auth/logout
router.get('/logout', protect, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;