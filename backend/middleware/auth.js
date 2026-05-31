const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect middleware - verifies JWT token and attaches user to request
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // Check for token in cookies (optional - for web apps)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Not authorized. No token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_dev_only');
    
    // Check if user still exists in database
    const result = await db.query(
      'SELECT id, full_name, mobile, email, role FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Not authorized. User no longer exists.' 
      });
    }
    
    // Attach user to request
    req.user = {
      id: result.rows[0].id,
      full_name: result.rows[0].full_name,
      mobile: result.rows[0].mobile,
      email: result.rows[0].email,
      role: result.rows[0].role
    };
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Not authorized. Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Not authorized. Token expired.' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// Admin only middleware - requires protect to be used first
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

// Optional: Farmer only middleware
const farmerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  
  if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Farmer privileges required.' });
  }
  
  next();
};

// Optional: Role-based middleware factory
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};

module.exports = { 
  protect, 
  adminOnly, 
  farmerOnly, 
  requireRole 
};