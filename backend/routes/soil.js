const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const soilReports = new Map();

function analyzeSoil({ soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon }) {
  let fertility, crops, fertilizer, irrigation, tips;

  const phNum = parseFloat(ph);

  if (phNum >= 6.0 && phNum <= 7.5 && nitrogen === 'High' && phosphorus === 'High' && potassium === 'High') {
    fertility = 'Very High';
    crops = ['Wheat', 'Rice', 'Sugarcane'];
    fertilizer = 'Only organic manure – 2 tonnes/acre. Minimal chemical fertilizer needed.';
    irrigation = 'Moderate irrigation – 4-5 times per season depending on crop.';
    tips = 'Maintain soil health with cover crops. Avoid over-fertilization.';
  } else if (phNum >= 5.5 && phNum <= 7.0 && (nitrogen === 'Medium' || phosphorus === 'Medium')) {
    fertility = 'Medium';
    crops = ['Potato', 'Maize', 'Tomato'];
    fertilizer = 'DAP 50kg/acre + Potash 30kg/acre + Urea 40kg/acre split in 2 doses.';
    irrigation = 'Regular irrigation every 8-10 days. Drip irrigation recommended.';
    tips = 'Add organic compost 1 tonne/acre. Test pH every season.';
  } else if (phNum > 8.0) {
    fertility = 'Poor – High Alkalinity';
    crops = ['Chickpea', 'Cotton', 'Bajra'];
    fertilizer = 'Gypsum 200kg/acre + Compost 3 tonnes/acre + Elemental Sulfur 10kg/acre.';
    irrigation = 'Flush irrigation occasionally to leach salts. Avoid waterlogging.';
    tips = 'Apply acidifying fertilizers. Grow acid-tolerant crops. Green manuring helps.';
  } else if (phNum < 5.0) {
    fertility = 'Poor – High Acidity';
    crops = ['Tea', 'Blueberry', 'Areca Nut'];
    fertilizer = 'Agricultural lime 200-300kg/acre to raise pH. Superphosphate 50kg/acre.';
    irrigation = 'Adequate drainage essential. Avoid waterlogging.';
    tips = 'Lime application 2-3 months before sowing. Avoid ammonium fertilizers.';
  } else if (nitrogen === 'Low' && phosphorus === 'Low') {
    fertility = 'Low';
    crops = ['Groundnut', 'Moong', 'Cowpea'];
    fertilizer = 'NPK 10:26:26 – 50kg/acre + Urea 25kg/acre + Organic manure 2 tonnes.';
    irrigation = 'Conserve moisture. Mulching recommended.';
    tips = 'Grow legumes to fix nitrogen. Add FYM regularly. Soil testing every year.';
  } else {
    fertility = 'Moderate';
    crops = ['Soybean', 'Sunflower', 'Mustard'];
    fertilizer = 'NPK 12:32:16 – 50kg/acre. Top dress with Urea 20kg/acre after 30 days.';
    irrigation = 'Normal irrigation schedule. Monitor crop stress indicators.';
    tips = 'Balanced fertilization. Add micronutrients Zinc 5kg/acre if deficiency shows.';
  }

  return { fertility, crops, fertilizer, irrigation, tips };
}

// POST /api/soil-advisor/recommend
router.post('/recommend', protect, (req, res) => {
  try {
    const { soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon } = req.body;
    if (!soil_type || !ph) {
      return res.status(400).json({ error: 'Soil type and pH are required.' });
    }

    const result = analyzeSoil({ soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon });
    const report = {
      id: uuidv4(),
      user_id: req.user.id,
      inputs: { soil_type, ph, nitrogen, phosphorus, potassium, organic_carbon },
      ...result,
      created_at: new Date().toISOString()
    };

    if (!soilReports.has(req.user.id)) soilReports.set(req.user.id, []);
    soilReports.get(req.user.id).unshift(report);

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: 'Soil analysis failed.' });
  }
});

// GET /api/soil-advisor/history
router.get('/history', protect, (req, res) => {
  const history = soilReports.get(req.user.id) || [];
  res.json({ history: history.slice(0, 5) });
});

module.exports = router;
