const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const calendarStore = new Map();

const cropSchedules = {
  Wheat: {
    duration: 120, unit: 'days',
    weeks: [
      { week: '1-2', title: 'Land Preparation & Sowing', activities: ['Deep plowing 20-25 cm', 'Add FYM 5 tonnes/acre', 'Basal dose: DAP 50kg + Potash 30kg/acre', 'Sow seeds 100kg/acre at 5cm depth'] },
      { week: '3-4', title: 'Germination & First Irrigation', activities: ['First irrigation (Crown Root Initiation)', 'Monitor germination (should be >85%)', 'Gap filling if needed'] },
      { week: '5-6', title: 'Weeding & Top Dress', activities: ['Manual weeding or herbicide Isoproturon 500g/acre', 'First Urea top dress: 40kg/acre', 'Monitor for aphids'] },
      { week: '7-9', title: 'Tillering & Second Irrigation', activities: ['Second irrigation at tillering stage', 'Second Urea: 20kg/acre', 'Spray fungicide for yellow rust if needed'] },
      { week: '10-12', title: 'Booting & Heading', activities: ['Third irrigation at heading stage', 'Monitor for stem rust', 'Spray Tebuconazole if rust visible'] },
      { week: '13-15', title: 'Grain Filling', activities: ['Fourth irrigation (light) at milky stage', 'Avoid irrigation after dough stage', 'Monitor bird damage'] },
      { week: '16-17', title: 'Maturity & Harvest', activities: ['Stop irrigation 2 weeks before harvest', 'Harvest when grain moisture <14%', 'Use combine or manual harvesting'] }
    ]
  },
  Rice: {
    duration: 140, unit: 'days',
    weeks: [
      { week: '1-3', title: 'Nursery Preparation', activities: ['Prepare nursery bed 1/10th of main field', 'Apply Trichoderma 50g/bed', 'Sow pre-germinated seeds 40kg/acre for transplanting'] },
      { week: '4-5', title: 'Land Preparation & Transplanting', activities: ['Puddle main field with tractor', 'Apply basal dose NPK 40:20:20 kg/acre', 'Transplant 25-day old seedlings, 2-3 per hill'] },
      { week: '6-8', title: 'Active Tillering', activities: ['Maintain 5cm water level', 'Weed control with Butachlor 1.5L/acre at 7 days after transplanting', 'Top dress Urea 40kg/acre at tillering'] },
      { week: '9-11', title: 'Panicle Initiation', activities: ['Drain field for 7 days (mid-season drainage)', 'Apply Potash 20kg/acre', 'Monitor for leaf folder and BPH insects'] },
      { week: '12-15', title: 'Flowering & Grain Filling', activities: ['Maintain water during flowering', 'Spray pesticide if pest pressure >ETL', 'Second top dress Urea 20kg/acre'] },
      { week: '16-18', title: 'Maturity & Harvest', activities: ['Drain field 10 days before harvest', 'Harvest when 85% grains golden', 'Threshing and drying to <14% moisture'] }
    ]
  },
  Maize: {
    duration: 100, unit: 'days',
    weeks: [
      { week: '1-2', title: 'Sowing', activities: ['Ridge and furrow method', 'Spacing 60×20cm', 'Seed rate 8kg/acre', 'Basal dose NPK 40:30:20 kg/acre'] },
      { week: '3-4', title: 'Germination & Thinning', activities: ['First irrigation after sowing (if no rain)', 'Thinning – keep 1 plant/hill', 'Monitor for shoot fly'] },
      { week: '5-6', title: 'First Weeding', activities: ['Hand weeding or Atrazine 500g/acre', 'First earthing up', 'Top dress Urea 30kg/acre'] },
      { week: '7-9', title: 'Rapid Growth', activities: ['Second irrigation', 'Second weeding', 'Second Urea 30kg/acre', 'Monitor for FAW (Fall Armyworm)'] },
      { week: '10-12', title: 'Tasseling & Silking', activities: ['Critical irrigation at tasseling', 'Avoid water stress', 'Spray Chlorpyriphos for FAW if needed'] },
      { week: '13-14', title: 'Maturity & Harvest', activities: ['Stop irrigation at dough stage', 'Harvest when husks dry and kernels hard', 'Dry cobs before storage'] }
    ]
  },
  Cotton: {
    duration: 180, unit: 'days',
    weeks: [
      { week: '1-2', title: 'Land Preparation & Sowing', activities: ['Deep summer plowing', 'Spacing 90×60cm for Bt cotton', 'Apply FYM 5t/acre', 'Sow after first rain or with irrigation'] },
      { week: '3-5', title: 'Germination & Early Growth', activities: ['Gap filling within 10 days', 'First hoeing', 'Spray chlorpyriphos for stem weevil'] },
      { week: '6-10', title: 'Vegetative Growth', activities: ['Second hoeing and earthing', 'NPK 40:20:0 top dress', 'Monitor for jassids with yellow sticky traps', 'Spray neem oil 5ml/L preventively'] },
      { week: '11-15', title: 'Flowering', activities: ['Irrigation every 10-12 days', 'Monitor for bollworms', 'Spray Bt or Spinosad for bollworm if needed', 'Potash 20kg/acre'] },
      { week: '16-20', title: 'Boll Development', activities: ['Critical – no water stress', 'Scout for boll weevil weekly', 'Apply defoliant Ethephon if needed for uniform opening'] },
      { week: '21-26', title: 'Picking Season', activities: ['4-5 pickings at 10-day intervals', 'Pick in morning', 'Avoid picking wet bolls', 'Grade cotton for better price'] }
    ]
  },
  Tomato: {
    duration: 90, unit: 'days',
    weeks: [
      { week: '1-2', title: 'Nursery & Transplanting', activities: ['Raise nursery in protrays or seedbeds', 'Transplant 25-day seedlings at 60×45cm', 'Apply FYM 10t/acre + NPK 40:60:40 kg/acre'] },
      { week: '3-4', title: 'Establishment', activities: ['Drip irrigation setup if possible', 'Mulching with plastic film', 'Monitor for damping off in nursery'] },
      { week: '5-6', title: 'Staking & Pruning', activities: ['Install bamboo stakes 1.5m height', 'Remove suckers weekly', 'Top dress Urea 20kg/acre'] },
      { week: '7-9', title: 'Flowering', activities: ['Foliar spray Boron 0.5g/L for fruit set', 'Spray Mancozeb for early blight', 'Monitor for tomato leafminer'] },
      { week: '10-12', title: 'Fruit Development', activities: ['Regular irrigation to avoid cracking', 'Spray Calcium nitrate 2g/L for fruit firmness', 'Harvest when turning pink-red'] },
      { week: '13-14', title: 'Final Harvest', activities: ['Harvest every 3-4 days', 'Sort and grade fruits', 'Pre-cool before transport for distant markets'] }
    ]
  },
  Onion: {
    duration: 110, unit: 'days',
    weeks: [
      { week: '1-3', title: 'Nursery & Transplanting', activities: ['Sow seeds in raised nursery bed', 'Transplant 45-day seedlings at 15×10cm', 'Ridges and furrows method preferred'] },
      { week: '4-6', title: 'Establishment', activities: ['Light irrigation frequently', 'Weed control - hand weeding', 'Apply Urea 20kg/acre'] },
      { week: '7-9', title: 'Bulb Initiation', activities: ['Reduce irrigation frequency', 'Earthing up around bulbs', 'Monitor for purple blotch disease'] },
      { week: '10-12', title: 'Bulb Development', activities: ['Controlled irrigation for good bulb size', 'Stop Nitrogen application', 'Potash 20kg/acre for quality'] },
      { week: '13-15', title: 'Maturity & Harvest', activities: ['Stop irrigation 15 days before harvest', 'Harvest when 50% tops fall', 'Cure in field 7-10 days before storage'] }
    ]
  },
  Potato: {
    duration: 100, unit: 'days',
    weeks: [
      { week: '1-2', title: 'Planting', activities: ['Cut seed tubers 40-50g pieces', 'Treat with Mancozeb + Carbendazim', 'Ridge planting at 60×20cm spacing', 'Basal dose NPK 80:60:80 kg/acre'] },
      { week: '3-4', title: 'Sprouting', activities: ['First irrigation', 'Earthing up when shoots 10cm tall', 'Monitor for early blight'] },
      { week: '5-7', title: 'Vegetative Growth', activities: ['Second earthing up', 'Top dress Urea 30kg/acre', 'Spray Mancozeb for blight'] },
      { week: '8-10', title: 'Tuber Formation', activities: ['Most critical irrigation period', 'Maintain uniform soil moisture', 'Monitor for late blight – spray Cymoxanil+Mancozeb'] },
      { week: '11-13', title: 'Bulking & Maturity', activities: ['Reduce irrigation last 2 weeks', 'Haulm killing for skin setting', 'Harvest 2 weeks after vine death'] }
    ]
  }
};

// POST /api/crop-calendar/generate
router.post('/generate', protect, (req, res) => {
  try {
    const { crop_name, location, sowing_date, land_area } = req.body;
    if (!crop_name || !sowing_date) {
      return res.status(400).json({ error: 'Crop name and sowing date required.' });
    }

    const schedule = cropSchedules[crop_name];
    if (!schedule) {
      return res.status(400).json({ error: 'Crop not found in database.' });
    }

    const sowDate = new Date(sowing_date);
    const harvestDate = new Date(sowDate);
    harvestDate.setDate(harvestDate.getDate() + schedule.duration);

    const calendar = {
      id: uuidv4(),
      user_id: req.user.id,
      crop_name, location, land_area,
      sowing_date,
      harvest_date: harvestDate.toISOString().split('T')[0],
      duration_days: schedule.duration,
      weeks: schedule.weeks,
      created_at: new Date().toISOString()
    };

    if (!calendarStore.has(req.user.id)) calendarStore.set(req.user.id, []);
    calendarStore.get(req.user.id).unshift(calendar);

    res.json({ success: true, calendar });
  } catch (err) {
    res.status(500).json({ error: 'Calendar generation failed.' });
  }
});

// GET /api/crop-calendar/list
router.get('/list', protect, (req, res) => {
  const calendars = calendarStore.get(req.user.id) || [];
  res.json({ calendars });
});

// GET supported crops
router.get('/crops', (req, res) => {
  res.json({ crops: Object.keys(cropSchedules) });
});

module.exports = router;
