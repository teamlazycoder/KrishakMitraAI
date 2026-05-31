const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const mockOCR = [
  { type: 'seed_packet', text: 'RICCO HYBRID PADDY SEEDS\nNet Wt: 5kg\nSow in June-July\nHarvest in October\nMRP ₹450\nKharif Season Variety\nGermination: 85%+' },
  { type: 'pesticide', text: 'BEST KILLER EC\nActive Ingredient: Cypermethrin 10% EC\nFor Cotton & Vegetables\nDilution: 2ml per litre water\nWaiting Period: 7 days before harvest\nCaution: Keep away from children' },
  { type: 'fertilizer', text: 'UREA 46% N\nTotal Nitrogen (N): 46%\nFor All Crops\nApplication: 40-50 kg per acre\nTop Dress in 2 splits\nStore in cool dry place\nNet Weight: 50 kg' },
  { type: 'fungicide', text: 'MANCOZEB 75% WP\nManganese Zinc Carbonate\nFor Blights, Mildews, Rust\nDose: 2-2.5g per litre\nSafety interval: 5 days\nDo not mix with alkaline products' }
];

// POST /api/image-to-text/extract
router.post('/extract', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'File upload failed.' });
    next();
  });
}, (req, res) => {
  const mockResult = mockOCR[Math.floor(Math.random() * mockOCR.length)];
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  res.json({
    success: true,
    image_url: imageUrl,
    extracted_text: mockResult.text,
    type: mockResult.type,
    summary: `This appears to be a ${mockResult.type.replace('_', ' ')} label. Key information has been extracted above.`,
    created_at: new Date().toISOString()
  });
});

module.exports = router;
