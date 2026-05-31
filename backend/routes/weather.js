const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/weather/current
router.get('/current', protect, async (req, res) => {
  const { lat = 19.0760, lon = 72.8777 } = req.query;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto&forecast_days=7`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API failed');
    const data = await response.json();
    res.json({ success: true, weather: data });
  } catch (err) {
    // Fallback mock data
    res.json({
      success: true,
      weather: {
        current_weather: { temperature: 28, windspeed: 12, weathercode: 2 },
        daily: {
          time: Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() + i);
            return d.toISOString().split('T')[0];
          }),
          temperature_2m_max: [32, 30, 29, 33, 31, 28, 30],
          temperature_2m_min: [22, 21, 20, 23, 21, 19, 22],
          precipitation_sum: [0, 2.5, 8, 0, 0, 12, 3],
          windspeed_10m_max: [15, 18, 22, 14, 11, 25, 16],
          weathercode: [2, 61, 63, 1, 0, 65, 61]
        },
        mock: true
      }
    });
  }
});

module.exports = router;
