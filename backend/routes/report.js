const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const reports = new Map();

const generateReportId = () => 'KM' + Date.now().toString().slice(-8);

// POST /api/report/crop-loss
router.post('/crop-loss', protect, (req, res) => {
  const { crop_name, loss_cause, affected_area, loss_date, description } = req.body;
  if (!crop_name || !loss_cause || !affected_area) {
    return res.status(400).json({ error: 'Crop name, loss cause, and affected area required.' });
  }

  const lossPercent = Math.round(40 + Math.random() * 50);
  const yieldPerAcre = 2000;
  const pricePerKg = 20;
  const compEst = parseFloat(affected_area) * yieldPerAcre * pricePerKg * (lossPercent / 100) * 0.8;

  const nextSteps = [
    'Contact your local Patwari/Revenue officer to verify the crop loss',
    'Inform your bank if you have KCC or crop loan',
    'File claim through PM Fasal Bima Yojana portal within 72 hours',
    'Take more photographs and videos of damaged crops as evidence',
    'Get a certificate from Agriculture Supervisor (Ks. Paryavekshak)'
  ];

  const report = {
    id: uuidv4(), user_id: req.user.id,
    report_id: generateReportId(), crop_name, loss_cause,
    affected_area: parseFloat(affected_area), loss_date,
    description, loss_percentage: lossPercent,
    compensation_estimate: Math.round(compEst),
    next_steps: nextSteps,
    status: 'pending', created_at: new Date().toISOString()
  };

  if (!reports.has(req.user.id)) reports.set(req.user.id, []);
  reports.get(req.user.id).unshift(report);

  res.status(201).json({ success: true, report });
});

// GET /api/report/user-reports
router.get('/user-reports', protect, (req, res) => {
  res.json({ reports: reports.get(req.user.id) || [] });
});

module.exports = router;
