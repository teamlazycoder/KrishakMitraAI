const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const irrigationStore = new Map();

const cropNeeds = {
  Rice: { Germination: 500, Vegetative: 800, Flowering: 600, Maturity: 300 },
  Wheat: { Germination: 300, Vegetative: 400, Flowering: 350, Maturity: 200 },
  Maize: { Germination: 250, Vegetative: 350, Flowering: 300, Maturity: 180 },
  Cotton: { Germination: 200, Vegetative: 400, Flowering: 450, Maturity: 250 },
  Tomato: { Germination: 150, Vegetative: 300, Flowering: 350, Maturity: 200 },
  Potato: { Germination: 200, Vegetative: 350, Flowering: 400, Maturity: 250 },
  Sugarcane: { Germination: 600, Vegetative: 900, Flowering: 700, Maturity: 400 },
  Onion: { Germination: 150, Vegetative: 250, Flowering: 200, Maturity: 100 }
};

// POST /api/irrigation/advise
router.post('/advise', protect, (req, res) => {
  try {
    const { crop_name, growth_stage, soil_moisture, soil_type, temperature, humidity, rain_forecast } = req.body;
    if (!crop_name || !growth_stage) {
      return res.status(400).json({ error: 'Crop name and growth stage are required.' });
    }

    const needs = cropNeeds[crop_name] || cropNeeds.Wheat;
    let baseReq = needs[growth_stage] || 300;
    let moisture = parseInt(soil_moisture) || 50;
    let temp = parseFloat(temperature) || 28;
    let humid = parseInt(humidity) || 60;
    const rainForecast = rain_forecast === true || rain_forecast === 'true';

    let multiplier = 1.0;
    if (moisture > 70) multiplier = 0.2;
    else if (moisture > 50) multiplier = 0.6;
    else if (moisture > 30) multiplier = 1.0;
    else multiplier = 1.5;

    if (temp > 38) multiplier *= 1.3;
    if (humid < 40) multiplier *= 1.2;
    if (rainForecast) multiplier *= 0.3;

    const waterReq = Math.round(baseReq * multiplier);
    let nextDays = moisture > 70 ? 5 : moisture > 50 ? 3 : moisture > 30 ? 1 : 0;
    if (rainForecast) nextDays += 2;

    const bestTime = temp > 35 ? 'Early morning (5-8 AM) or evening (6-8 PM)' : 'Morning (6-9 AM)';
    let adviceText = '';
    if (moisture > 70) adviceText = `Soil moisture is adequate. Next irrigation in ${nextDays} days.`;
    else if (moisture < 30) adviceText = `Soil is very dry! Irrigate immediately. Apply ${waterReq} L/acre.`;
    else adviceText = `Moderate moisture. Apply ${waterReq} L/acre. Next irrigation in ${nextDays} days.`;

    if (rainForecast) adviceText += ' Rain forecast – reduce irrigation by 70%.';
    if (temp > 38) adviceText += ' High temperature – irrigate in morning/evening to reduce evaporation.';

    const tips = [
      'Drip irrigation saves 40-60% water compared to flood irrigation',
      'Irrigate in early morning to minimize evaporation losses',
      'Mulching around plants reduces soil water loss by 30%',
      'Check crop leaves for wilting as an early indicator of water stress'
    ];

    const advice = {
      id: uuidv4(), user_id: req.user.id, crop_name, growth_stage,
      soil_moisture: moisture, water_requirement: waterReq, best_time: bestTime,
      next_irrigation_days: nextDays, advice_text: adviceText, water_saving_tips: tips,
      over_irrigation_risk: moisture > 75,
      created_at: new Date().toISOString()
    };

    if (!irrigationStore.has(req.user.id)) irrigationStore.set(req.user.id, []);
    irrigationStore.get(req.user.id).unshift(advice);

    res.json({ success: true, advice });
  } catch (err) {
    res.status(500).json({ error: 'Irrigation analysis failed.' });
  }
});

router.get('/history', protect, (req, res) => {
  res.json({ history: irrigationStore.get(req.user.id) || [] });
});

module.exports = router;
