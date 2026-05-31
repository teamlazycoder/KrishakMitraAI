const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const schemes = [
  {
    id: 1, name: 'PM-KISAN', full_name: 'Pradhan Mantri Kisan Samman Nidhi',
    benefit: '₹6,000 per year in 3 installments of ₹2,000',
    eligibility: { land_size_max: 2, categories: ['All'], income_limit: null },
    deadline: 'Rolling – Apply anytime',
    documents: ['Aadhaar Card', 'Bank Account', 'Land Records (Khasra/Khatauni)'],
    how_to_apply: 'Visit PM-KISAN portal (pmkisan.gov.in) or nearest CSC center',
    helpline: '155261 / 011-23381092',
    status: 'Active'
  },
  {
    id: 2, name: 'PMFBY', full_name: 'Pradhan Mantri Fasal Bima Yojana',
    benefit: 'Crop insurance covering losses from natural calamities. Kharif premium 2%, Rabi premium 1.5%',
    eligibility: { land_size_max: 999, categories: ['All'], income_limit: null },
    deadline: 'Kharif: July 31 | Rabi: December 31',
    documents: ['Aadhaar', 'Bank Account', 'Land/Lease Records', 'Sowing Certificate'],
    how_to_apply: 'Through bank branch, CSC, or crop insurance portal',
    helpline: '1800-200-7710',
    status: 'Active'
  },
  {
    id: 3, name: 'Soil Health Card', full_name: 'Soil Health Card Scheme',
    benefit: 'Free soil testing and health card every 2 years with fertilizer recommendations',
    eligibility: { land_size_max: 999, categories: ['All'], income_limit: null },
    deadline: 'Available year-round',
    documents: ['Land details', 'Aadhaar'],
    how_to_apply: 'Contact local agriculture department or Krishi Vigyan Kendra (KVK)',
    helpline: '1800-180-1551',
    status: 'Active'
  },
  {
    id: 4, name: 'KCC', full_name: 'Kisan Credit Card',
    benefit: 'Short-term credit up to ₹3 lakhs at 4% interest for crop expenses',
    eligibility: { land_size_max: 999, categories: ['All'], income_limit: null },
    deadline: 'Apply anytime at bank',
    documents: ['Aadhaar', 'PAN', 'Land Records', 'Passport Photo'],
    how_to_apply: 'Visit nearest bank branch (SBI, PNB, Cooperative Bank)',
    helpline: 'Contact nearest bank branch',
    status: 'Active'
  },
  {
    id: 5, name: 'PM-KUSUM', full_name: 'Pradhan Mantri Kisan Urja Suraksha evam Utthan Mahabhiyan',
    benefit: 'Subsidy on solar water pumps – 60-90% subsidy on installation',
    eligibility: { land_size_max: 999, categories: ['All'], income_limit: null },
    deadline: 'State-specific – check state agriculture department',
    documents: ['Aadhaar', 'Land Records', 'Bank Account', 'Electricity Bill'],
    how_to_apply: 'Apply through state DISCOM or agriculture department',
    helpline: 'State agriculture department',
    status: 'Active'
  },
  {
    id: 6, name: 'MIDH', full_name: 'Mission for Integrated Development of Horticulture',
    benefit: 'Subsidy on drip/sprinkler irrigation, greenhouse, cold storage, and post-harvest infrastructure',
    eligibility: { land_size_max: 999, categories: ['All'], income_limit: null },
    deadline: 'Application through state horticulture department',
    documents: ['Aadhaar', 'Land Records', 'Project Proposal'],
    how_to_apply: 'Contact state horticulture mission office',
    helpline: '1800-180-2117',
    status: 'Active'
  }
];

// GET /api/schemes
router.get('/', protect, (req, res) => {
  res.json({ success: true, schemes });
});

// POST /api/schemes/check-eligibility
router.post('/check-eligibility', protect, (req, res) => {
  const { land_size, category, state } = req.body;
  const eligible = schemes.filter(s => {
    if (land_size && s.eligibility.land_size_max !== 999 && parseFloat(land_size) > s.eligibility.land_size_max) return false;
    return true;
  });
  res.json({ success: true, eligible_schemes: eligible, total: eligible.length });
});

module.exports = router;
