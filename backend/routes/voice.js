const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const responses = {
  'fertilizer wheat': 'For wheat, apply DAP 50kg/acre at sowing + Urea 40kg/acre at 30 days + Urea 20kg/acre at 60 days for best yield.',
  'fertilizer rice': 'For rice, apply NPK 40:20:20 kg/acre as basal. Top dress Urea 40kg/acre at tillering and 20kg/acre at panicle initiation.',
  'fertilizer tomato': 'Tomato needs NPK 40:60:40 kg/acre basal. Foliar Boron 0.5g/L at flowering. Calcium nitrate 2g/L for fruit firmness.',
  'sow tomato': 'Tomato is best sown in October-November in North India. In South India, July-August is ideal. Transplant 25-day old seedlings.',
  'sow wheat': 'Sow wheat in October-November (Rabi season). Best window: 15 Oct - 15 Nov for maximum yield.',
  'sow rice': 'Rice is a Kharif crop. Sow nursery in June and transplant in July. Direct seeding can be done in late June.',
  'pest cotton bollworm': 'For bollworm in cotton, use Neem oil 5ml/L or Bt spray as organic option. Chemical: Chlorpyriphos 2ml/L or Cypermethrin 1ml/L.',
  'pest tomato': 'For tomato pests: leafminer – Imidacloprid 0.5ml/L; whitefly – Yellow sticky traps + neem oil; fruit borer – Spinosad 0.5ml/L.',
  'disease wheat rust': 'For wheat rust (yellow/brown/stem), apply Tebuconazole 1ml/L or Propiconazole 1ml/L at first sign. Spray in morning.',
  'disease rice blast': 'For rice blast, apply Tricyclazole 0.6g/L or Carbendazim 1g/L. Remove infected stubble after harvest.',
  'mausam weather': 'मैं आपका स्थान नहीं जानता। कृपया वेदर पेज पर जाएं। I will check your local weather – please visit the Weather page.',
  'irrigation when': 'Irrigation timing depends on crop stage and soil moisture. For most crops, irrigate when soil feels dry at 5cm depth. Early morning is best.',
  'price tomato': 'Tomato prices vary by state. Current average is ₹28-40/kg. Visit the Mandi Prices page for state-specific predictions.',
  'profit crop': 'Use the Profit Calculator to estimate your crop profit. Enter all input costs and expected selling price for accurate results.',
  'scheme government': 'Key schemes: PM-KISAN (₹6000/year), PMFBY crop insurance, Soil Health Card, Kisan Credit Card. Visit Government Schemes page for eligibility.',
  'organic pest control': 'Organic pest control: Neem oil 5ml/L for general pests, Bt spray for caterpillars, Trichoderma for soil fungi, Yellow traps for flying insects.',
  'soil ph improve': 'For acidic soil (pH<6): apply agricultural lime 200kg/acre. For alkaline soil (pH>8): apply gypsum 200kg/acre + sulfur 10kg/acre.',
  'water save irrigation': 'Save water: use drip irrigation (saves 40%), mulching (saves 30%), irrigate in morning, check tensiometer, grow drought-tolerant varieties.',
  'default': 'मैं आपकी मदद करने की कोशिश करूंगा। I can help with fertilizers, crop timing, pest control, weather, mandi prices, and government schemes. Please ask a specific question about farming.'
};

function getResponse(query) {
  const q = query.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (key !== 'default' && key.split(' ').some(word => q.includes(word))) {
      return response;
    }
  }
  return responses.default;
}

// POST /api/voice/process
router.post('/process', protect, (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: 'Text input required.' });

  const response = getResponse(text);
  res.json({ success: true, query: text, response, language: language || 'en' });
});

// GET suggestions
router.get('/suggestions', (req, res) => {
  res.json({
    suggestions: [
      'What fertilizer for wheat?',
      'When to sow tomato?',
      'Mausam kaisa rahega?',
      'How to control pest in cotton?',
      'Best irrigation time for rice?',
      'Government schemes for farmers',
      'Organic pest control tips',
      'How to improve soil pH?'
    ]
  });
});

module.exports = router;
