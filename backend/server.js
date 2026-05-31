require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./config/db'); // Add this line to import database

const authRoutes = require('./routes/auth');
const cropDoctorRoutes = require('./routes/cropDoctor');
const soilRoutes = require('./routes/soil');
const calendarRoutes = require('./routes/calendar');
const weatherRoutes = require('./routes/weather');
const mandiRoutes = require('./routes/mandi');
const profitRoutes = require('./routes/profit');
const irrigationRoutes = require('./routes/irrigation');
const voiceRoutes = require('./routes/voice');
const imageTextRoutes = require('./routes/imageText');
const hubRoutes = require('./routes/hub');
const schemesRoutes = require('./routes/schemes');
const reportRoutes = require('./routes/report');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop-doctor', cropDoctorRoutes);
app.use('/api/soil-advisor', soilRoutes);
app.use('/api/crop-calendar', calendarRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/profit', profitRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/image-to-text', imageTextRoutes);
app.use('/api/hub', hubRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as time');
    res.json({ success: true, message: 'Database connected', time: result.rows[0].time });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;

// Function to test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log('✅ PostgreSQL database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🌾 Krishak Mitra AI Backend running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database test: http://localhost:${PORT}/test-db`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error.message);
    console.error('Please check:');
    console.error('  1. PostgreSQL is installed and running');
    console.error('  2. Database credentials in .env file are correct');
    console.error('  3. Database "krishak_mitra" exists');
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;