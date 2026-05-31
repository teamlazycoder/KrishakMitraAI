const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, (req, res) => {
  res.json({
    success: true,
    stats: {
      diagnoses_count: Math.floor(Math.random() * 10),
      soil_reports_count: Math.floor(Math.random() * 5),
      calendars_count: Math.floor(Math.random() * 3),
      reports_count: Math.floor(Math.random() * 2)
    },
    ai_tip: getTipOfDay(),
    alerts: [
      { type: 'weather', message: 'Heavy rainfall expected this week – delay fertilizer application' },
      { type: 'scheme', message: 'PM-KISAN next installment due – ensure bank details updated' }
    ]
  });
});

function getTipOfDay() {
  const tips = [
    'Apply neem cake at 200kg/acre to control soil-borne pests and improve soil health.',
    'Install yellow sticky traps at 10 per acre to monitor and trap flying insects cost-effectively.',
    'Rotate crops every season to break pest cycles and maintain soil nutrient balance.',
    'Test your soil every 2 years. A ₹200 soil test can save ₹2000 in unnecessary fertilizers.',
    'Drip irrigation can reduce water use by 40-60% while improving crop yield by 20-30%.',
    'Intercropping maize with legumes improves nitrogen availability and diversifies income.',
    'Keep a farm diary – record activities, weather, and yields to make better decisions each season.'
  ];
  return tips[new Date().getDay() % tips.length];
}

module.exports = router;
