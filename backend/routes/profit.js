const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const profitStore = new Map();

const cropYields = {
  Wheat: { min: 2500, max: 3000, avg: 2700 },
  Rice: { min: 2000, max: 2500, avg: 2200 },
  Maize: { min: 2000, max: 3000, avg: 2400 },
  Tomato: { min: 15000, max: 20000, avg: 17000 },
  Potato: { min: 12000, max: 15000, avg: 13500 },
  Onion: { min: 10000, max: 12000, avg: 11000 },
  Cotton: { min: 500, max: 600, avg: 550 },
  Sugarcane: { min: 25000, max: 35000, avg: 30000 },
  Soybean: { min: 1000, max: 1500, avg: 1200 },
  Groundnut: { min: 1500, max: 2000, avg: 1700 },
  Mustard: { min: 800, max: 1200, avg: 1000 },
  Sunflower: { min: 600, max: 900, avg: 750 }
};

// POST /api/profit/calculate
router.post('/calculate', protect, (req, res) => {
  try {
    const {
      land_size, crop_name, seed_cost, fertilizer_cost,
      pesticide_cost, labour_cost, irrigation_cost, transport_cost, selling_price
    } = req.body;

    if (!land_size || !crop_name || !selling_price) {
      return res.status(400).json({ error: 'Land size, crop, and selling price are required.' });
    }

    const yieldData = cropYields[crop_name] || { avg: 2000 };
    const totalCost = (parseFloat(seed_cost) || 0) + (parseFloat(fertilizer_cost) || 0) +
      (parseFloat(pesticide_cost) || 0) + (parseFloat(labour_cost) || 0) +
      (parseFloat(irrigation_cost) || 0) + (parseFloat(transport_cost) || 0);

    const expectedYield = yieldData.avg * parseFloat(land_size);
    const totalRevenue = expectedYield * parseFloat(selling_price);
    const netProfit = totalRevenue - totalCost;
    const profitPerAcre = netProfit / parseFloat(land_size);
    const breakEvenPrice = totalCost / expectedYield;
    const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;

    const result = {
      id: uuidv4(),
      user_id: req.user.id,
      land_size: parseFloat(land_size),
      crop_name,
      total_cost: totalCost,
      expected_yield: expectedYield,
      total_revenue: totalRevenue,
      net_profit: netProfit,
      profit_per_acre: profitPerAcre,
      break_even_price: breakEvenPrice,
      roi_percent: roi,
      yield_per_acre: yieldData.avg,
      created_at: new Date().toISOString()
    };

    if (!profitStore.has(req.user.id)) profitStore.set(req.user.id, []);
    profitStore.get(req.user.id).unshift(result);

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: 'Calculation failed.' });
  }
});

// GET history
router.get('/history', protect, (req, res) => {
  res.json({ history: profitStore.get(req.user.id) || [] });
});

// GET crop yields reference
router.get('/crop-yields', (req, res) => {
  res.json({ cropYields });
});

module.exports = router;
