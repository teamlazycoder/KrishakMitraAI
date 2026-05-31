const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const mandiData = {
  Tomato: {
    Delhi: { current: 35, p7: 42, p15: 38, p30: 45, trend: 'up', rec: 'Wait 7 days for better price', confidence: 78, unit: 'kg' },
    Maharashtra: { current: 28, p7: 25, p15: 22, p30: 30, trend: 'down', rec: 'Sell now before price falls further', confidence: 82, unit: 'kg' },
    Karnataka: { current: 32, p7: 35, p15: 36, p30: 38, trend: 'up', rec: 'Wait 2 weeks for peak price', confidence: 71, unit: 'kg' },
    'Uttar Pradesh': { current: 30, p7: 31, p15: 32, p30: 28, trend: 'stable', rec: 'Sell in next 15 days at good price', confidence: 75, unit: 'kg' },
    Punjab: { current: 38, p7: 40, p15: 37, p30: 42, trend: 'up', rec: 'Hold for 7 days', confidence: 73, unit: 'kg' }
  },
  Potato: {
    'Uttar Pradesh': { current: 18, p7: 20, p15: 22, p30: 19, trend: 'up', rec: 'Wait 15 days for better returns', confidence: 79, unit: 'kg' },
    'West Bengal': { current: 22, p7: 21, p15: 21, p30: 23, trend: 'stable', rec: 'Price stable, sell when convenient', confidence: 80, unit: 'kg' },
    Punjab: { current: 20, p7: 18, p15: 17, p30: 21, trend: 'down', rec: 'Sell now – price declining', confidence: 77, unit: 'kg' },
    Maharashtra: { current: 25, p7: 27, p15: 28, p30: 24, trend: 'up', rec: 'Wait 15 days for peak', confidence: 72, unit: 'kg' }
  },
  Onion: {
    Maharashtra: { current: 22, p7: 28, p15: 35, p30: 32, trend: 'up', rec: 'Hold for 15 days – strong demand ahead', confidence: 85, unit: 'kg' },
    Karnataka: { current: 18, p7: 22, p15: 25, p30: 20, trend: 'up', rec: 'Wait 15 days', confidence: 76, unit: 'kg' },
    Rajasthan: { current: 15, p7: 14, p15: 16, p30: 18, trend: 'down', rec: 'Sell now or wait 30 days', confidence: 68, unit: 'kg' }
  },
  Wheat: {
    Punjab: { current: 2250, p7: 2280, p15: 2300, p30: 2320, trend: 'up', rec: 'Hold – MSP likely to rise', confidence: 88, unit: 'quintal' },
    'Madhya Pradesh': { current: 2200, p7: 2220, p15: 2230, p30: 2250, trend: 'up', rec: 'Gradual price rise expected', confidence: 84, unit: 'quintal' },
    Haryana: { current: 2240, p7: 2260, p15: 2270, p30: 2290, trend: 'up', rec: 'MSP support keeping prices firm', confidence: 90, unit: 'quintal' }
  },
  Rice: {
    'Andhra Pradesh': { current: 3200, p7: 3100, p15: 3000, p30: 3300, trend: 'down', rec: 'Sell now or wait 30 days', confidence: 73, unit: 'quintal' },
    Punjab: { current: 3100, p7: 3150, p15: 3200, p30: 3100, trend: 'up', rec: 'Wait 15 days for better price', confidence: 78, unit: 'quintal' },
    'West Bengal': { current: 2900, p7: 2950, p15: 3000, p30: 3050, trend: 'up', rec: 'Steady rise – hold if possible', confidence: 75, unit: 'quintal' }
  },
  Maize: {
    Karnataka: { current: 2100, p7: 2050, p15: 2000, p30: 2150, trend: 'down', rec: 'Sell now or wait 30 days for recovery', confidence: 71, unit: 'quintal' },
    'Madhya Pradesh': { current: 1950, p7: 2000, p15: 2050, p30: 2100, trend: 'up', rec: 'Wait 15-30 days for peak', confidence: 76, unit: 'quintal' }
  },
  Cotton: {
    Maharashtra: { current: 7200, p7: 7400, p15: 7600, p30: 7800, trend: 'up', rec: 'Hold for 30 days – strong export demand', confidence: 82, unit: 'quintal' },
    Gujarat: { current: 7500, p7: 7600, p15: 7800, p30: 8000, trend: 'up', rec: 'Gradual price rise expected', confidence: 79, unit: 'quintal' },
    Telangana: { current: 6900, p7: 7100, p15: 7300, p30: 7500, trend: 'up', rec: 'Good time to hold cotton', confidence: 77, unit: 'quintal' }
  },
  Sugarcane: {
    Maharashtra: { current: 3150, p7: 3150, p15: 3200, p30: 3250, trend: 'stable', rec: 'SAP rates fixed, sell on schedule', confidence: 95, unit: 'tonne' },
    'Uttar Pradesh': { current: 3200, p7: 3200, p15: 3250, p30: 3250, trend: 'stable', rec: 'FRP fixed by government', confidence: 97, unit: 'tonne' }
  }
};

// GET /api/mandi/price/:crop
router.get('/price/:crop', protect, (req, res) => {
  const { crop } = req.params;
  const { state } = req.query;
  const cropData = mandiData[crop];
  if (!cropData) return res.status(404).json({ error: 'Crop data not available.' });

  if (state && cropData[state]) {
    return res.json({ success: true, crop, state, data: cropData[state] });
  }
  res.json({ success: true, crop, allStates: cropData });
});

// GET /api/mandi/all-prices
router.get('/all-prices', protect, (req, res) => {
  const summary = Object.entries(mandiData).map(([crop, states]) => {
    const stateList = Object.entries(states);
    const avgCurrent = stateList.reduce((s, [, d]) => s + d.current, 0) / stateList.length;
    const topState = stateList[0];
    return {
      crop,
      avg_price: Math.round(avgCurrent),
      unit: topState[1].unit,
      trend: topState[1].trend,
      states: stateList.length
    };
  });
  res.json({ success: true, prices: summary, crops: Object.keys(mandiData), states: ['Delhi', 'Maharashtra', 'Karnataka', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 'Haryana', 'Gujarat', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Rajasthan'] });
});

module.exports = router;
