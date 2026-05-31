const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const db = require('../config/db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Valid Indian agricultural crops (whitelist)
const validCrops = [
  'cotton', 'rice', 'wheat', 'maize', 'sugarcane', 'tomato', 'potato',
  'onion', 'garlic', 'brinjal', 'chilli', 'cauliflower', 'cabbage',
  'spinach', 'okra', 'peas', 'beans', 'carrot', 'cucumber', 'pumpkin',
  'watermelon', 'mango', 'banana', 'grapes', 'pomegranate', 'guava',
  'papaya', 'orange', 'lemon', 'coconut', 'groundnut', 'soybean',
  'sunflower', 'mustard', 'tea', 'coffee', 'turmeric', 'ginger', 'jowar', 'bajra'
];

// Scientific name to common crop mapping
const cropMapping = {
  'oryza sativa': 'rice',
  'triticum aestivum': 'wheat',
  'zea mays': 'maize',
  'gossypium': 'cotton',
  'saccharum officinarum': 'sugarcane',
  'solanum lycopersicum': 'tomato',
  'solanum tuberosum': 'potato',
  'allium cepa': 'onion',
  'allium sativum': 'garlic',
  'capsicum annuum': 'chilli',
  'mangifera indica': 'mango',
  'musa paradisiaca': 'banana',
  'vitis vinifera': 'grapes',
  'punica granatum': 'pomegranate',
  'carica papaya': 'papaya',
  'cocos nucifera': 'coconut',
  'arachis hypogaea': 'groundnut',
  'glycine max': 'soybean',
  'helianthus annuus': 'sunflower',
  'brassica juncea': 'mustard',
  'camellia sinensis': 'tea',
  'coffea arabica': 'coffee'
};

// Non-crop indicators (reject these)
const nonCropIndicators = [
  'morchella', 'centaurea', 'lichen', 'fungus', 'weed', 'grass', 'ornamental',
  'flower', 'tree', 'shrub', 'mushroom', 'fern', 'moss', 'algae', 'venteurea',
  'verbascum', 'plantago', 'rumex', 'aster', 'dandelion', 'clover', 'thistle'
];

// Disease remedies database
const diseaseRemedies = {
  'cotton': {
    'leaf curl virus': {
      organic: '🌿 Control whiteflies using yellow sticky traps. Spray neem oil (5ml/L) weekly. Remove infected plants.',
      chemical: '🧪 Imidacloprid (0.5ml/L) or Acetamiprid. Apply systemic insecticide at 15-day intervals.'
    },
    'boll rot': {
      organic: '🌿 Remove and destroy infected bolls. Maintain field hygiene. Spray garlic extract (10ml/L).',
      chemical: '🧪 Carbendazim (1g/L) + Mancozeb (2g/L). Apply at boll formation and 15 days later.'
    },
    'alternaria leaf spot': {
      organic: '🌿 Neem oil (5ml/L) + baking soda (5g/L) spray weekly. Remove infected leaves.',
      chemical: '🧪 Chlorothalonil (2g/L) or Copper oxychloride (3g/L). Apply at 10-day intervals.'
    }
  },
  'rice': {
    'leaf blast': {
      organic: '🌿 Spray Trichoderma viride (5g/L). Use neem cake in soil. Avoid excess nitrogen.',
      chemical: '🧪 Tricyclazole (0.6g/L) or Carbendazim (1g/L). Apply at tillering stage.'
    },
    'brown spot': {
      organic: '🌿 Apply Pseudomonas fluorescens. Use compost tea. Maintain balanced nutrition.',
      chemical: '🧪 Mancozeb (2g/L) or Iprodione. Apply at booting stage.'
    },
    'healthy': {
      organic: '✅ Your rice crop appears healthy! Continue good agricultural practices.',
      chemical: '✅ No treatment needed. Regular monitoring recommended.'
    }
  },
  'wheat': {
    'stem rust': {
      organic: '🌿 Cow urine solution (1:10 dilution). Spray neem oil weekly. Use resistant varieties.',
      chemical: '🧪 Tebuconazole (1ml/L) or Propiconazole. Apply at first sign of infection.'
    },
    'yellow rust': {
      organic: '🌿 Apply horsetail extract. Use compost tea. Maintain field hygiene.',
      chemical: '🧪 Azoxystrobin (0.5ml/L) or Tebuconazole. Apply preventively.'
    }
  },
  'tomato': {
    'late blight': {
      organic: '🌿 Neem oil spray (5ml/L) + garlic extract. Remove infected leaves. Apply copper fungicide.',
      chemical: '🧪 Mancozeb (2g/L) or Metalaxyl + Mancozeb. Apply early morning.'
    },
    'early blight': {
      organic: '🌿 Baking soda solution (5g/L) + neem oil. Spray weekly. Mulch around plants.',
      chemical: '🧪 Chlorothalonil (2g/L) or Copper oxychloride. Rotate fungicides.'
    },
    'powdery mildew': {
      organic: '🌿 Potassium bicarbonate (5g/L) or milk spray (1:10 ratio). Apply in cool morning.',
      chemical: '🧪 Hexaconazole (1ml/L) or Tebuconazole. Avoid applying in hot sun.'
    }
  },
  'potato': {
    'late blight': {
      organic: '🌿 Copper spray (organic). Remove infected plants. Use resistant varieties. Hill properly.',
      chemical: '🧪 Mancozeb (2g/L) + Cymoxanil. Apply before rain. Rotate chemicals.'
    },
    'early blight': {
      organic: '🌿 Neem oil + baking soda spray. Remove lower leaves. Maintain field hygiene.',
      chemical: '🧪 Chlorothalonil (2g/L) or Azoxystrobin. Apply at 10-day intervals.'
    }
  },
  'general': {
    'healthy': {
      organic: '✅ Your crop appears healthy! Continue good agricultural practices.',
      chemical: '✅ No treatment needed. Regular monitoring recommended.'
    },
    'default': {
      organic: '🌿 Consult your local agriculture extension officer for accurate diagnosis. Practice crop rotation and maintain field hygiene.',
      chemical: '🧪 Take a sample to the nearest plant pathology lab for proper testing.'
    }
  }
};

// Function to check if plant is a valid crop
function isValidCrop(plantName) {
  if (!plantName) return false;
  
  const lowerName = plantName.toLowerCase();
  
  // Check if it's a non-crop
  for (const indicator of nonCropIndicators) {
    if (lowerName.includes(indicator)) {
      return false;
    }
  }
  
  // Check direct crop match
  for (const crop of validCrops) {
    if (lowerName.includes(crop)) {
      return true;
    }
  }
  
  // Check scientific name mapping
  for (const [scientific, common] of Object.entries(cropMapping)) {
    if (lowerName.includes(scientific)) {
      return true;
    }
  }
  
  return false;
}

// Extract crop name from API result
function extractCropName(plantName) {
  if (!plantName) return null;
  
  const lowerName = plantName.toLowerCase();
  
  // Check scientific name mapping first
  for (const [scientific, common] of Object.entries(cropMapping)) {
    if (lowerName.includes(scientific)) {
      return common.charAt(0).toUpperCase() + common.slice(1);
    }
  }
  
  // Check direct crop match
  for (const crop of validCrops) {
    if (lowerName.includes(crop)) {
      return crop.charAt(0).toUpperCase() + crop.slice(1);
    }
  }
  
  return null;
}

// Get disease remedies based on crop and disease
function getDiseaseInfo(cropName, diseaseName, isHealthy) {
  const cropLower = cropName.toLowerCase();
  
  // If healthy
  if (isHealthy) {
    return {
      disease: 'Healthy',
      confidence: 85,
      remedy_organic: diseaseRemedies['general']['healthy'].organic,
      remedy_chemical: diseaseRemedies['general']['healthy'].chemical
    };
  }
  
  // Check for crop-specific diseases
  if (diseaseRemedies[cropLower]) {
    const diseaseLower = (diseaseName || '').toLowerCase();
    for (const [disease, remedy] of Object.entries(diseaseRemedies[cropLower])) {
      if (diseaseLower.includes(disease) || disease.includes(diseaseLower)) {
        return {
          disease: disease.charAt(0).toUpperCase() + disease.slice(1),
          confidence: 85,
          remedy_organic: remedy.organic,
          remedy_chemical: remedy.chemical
        };
      }
    }
  }
  
  // Default remedy for unknown disease
  return {
    disease: diseaseName || 'General Disease',
    confidence: 70,
    remedy_organic: `🌿 For ${cropName}, apply neem oil spray (5ml/L water) weekly. Remove affected plant parts. Maintain good field hygiene.`,
    remedy_chemical: `🧪 Consult local agriculture officer for specific treatment for ${cropName}. Consider broad-spectrum fungicide like Mancozeb (2g/L).`
  };
}

// Save diagnosis to database
async function saveDiagnosisToDB(diagnosis) {
  try {
    const result = await db.query(
      `INSERT INTO crop_diagnoses 
       (id, user_id, image_url, crop_name, disease_name, confidence, 
        remedy_organic, remedy_chemical, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        diagnosis.id, 
        diagnosis.user_id, 
        diagnosis.image_url, 
        diagnosis.crop_name, 
        diagnosis.disease_name, 
        diagnosis.confidence,
        diagnosis.remedy_organic, 
        diagnosis.remedy_chemical, 
        diagnosis.created_at
      ]
    );
    
    console.log('✅ Diagnosis saved to database:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error saving diagnosis:', error.message);
    throw error;
  }
}

// POST /api/crop-doctor/analyze
router.post('/analyze', protect, async (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        error: err.message || 'File upload failed. Max size 10MB, images only.' 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image of the crop.' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const PLANT_ID_API_KEY = process.env.PLANT_ID_API_KEY;
    
    if (!PLANT_ID_API_KEY) {
      // Clean up file
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(500).json({ error: 'API configuration error. Please contact support.' });
    }
    
    let cropName = null;
    let diseaseName = 'Unknown';
    let confidence = 70;
    let isHealthy = false;
    let apiPlantName = '';
    
    try {
      const formData = new FormData();
      formData.append('images', fs.createReadStream(imagePath));
      formData.append('organs', JSON.stringify(['leaf']));
      
      console.log('🌿 Analyzing image with Plant.id API...');
      const response = await axios.post('https://api.plant.id/v2/identify', formData, {
        headers: {
          ...formData.getHeaders(),
          'Api-Key': PLANT_ID_API_KEY
        },
        timeout: 30000
      });
      
      const suggestions = response.data.suggestions;
      if (suggestions && suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        apiPlantName = topSuggestion.plant_name || '';
        
        console.log(`🌿 API Detected: ${apiPlantName}`);
        
        // Check if this is a valid crop
        if (isValidCrop(apiPlantName)) {
          cropName = extractCropName(apiPlantName);
          
          // Check health status
          if (topSuggestion.health) {
            isHealthy = topSuggestion.health.is_healthy === true;
            if (topSuggestion.health.disease_name) {
              diseaseName = topSuggestion.health.disease_name;
            }
            if (topSuggestion.health.probability) {
              confidence = Math.round(topSuggestion.health.probability * 100);
            }
          }
          
          // If disease info from disease field
          if (topSuggestion.disease && topSuggestion.disease.name) {
            diseaseName = topSuggestion.disease.name;
            if (topSuggestion.disease.probability) {
              confidence = Math.round(topSuggestion.disease.probability * 100);
            }
          }
        }
      }
      
    } catch (apiError) {
      console.error('Plant.id API error:', apiError.response?.data || apiError.message);
    }
    
    // Clean up uploaded file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Validate crop detection
    if (!cropName) {
      let errorMessage = '❌ Could not identify a valid crop in this image.\n\n';
      errorMessage += `Detected: "${apiPlantName || 'Unknown plant'}"\n`;
      errorMessage += 'Please upload a clear image of these crops:\n';
      errorMessage += '🌾 Cotton, Rice, Wheat, Maize, Sugarcane\n';
      errorMessage += '🍅 Tomato, Potato, Onion, Chilli, Brinjal\n';
      errorMessage += '🥭 Mango, Banana, Grapes, Pomegranate\n';
      errorMessage += '🥜 Groundnut, Soybean, Sunflower, Mustard';
      
      return res.status(400).json({ 
        error: errorMessage,
        detected_plant: apiPlantName
      });
    }
    
    // Get disease remedies
    const diseaseInfo = getDiseaseInfo(cropName, diseaseName, isHealthy);
    
    // Create diagnosis object
    const diagnosis = {
      id: uuidv4(),
      user_id: req.user.id,
      image_url: imageUrl,
      crop_name: cropName,
      disease_name: diseaseInfo.disease,
      confidence: diseaseInfo.confidence,
      remedy_organic: diseaseInfo.remedy_organic,
      remedy_chemical: diseaseInfo.remedy_chemical,
      created_at: new Date()
    };
    
    // Save to database
    const savedDiagnosis = await saveDiagnosisToDB(diagnosis);
    
    console.log(`✅ Diagnosis complete: ${cropName} - ${diseaseInfo.disease} (${diseaseInfo.confidence}% confidence)`);
    
    res.json({ 
      success: true, 
      diagnosis: savedDiagnosis
    });
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Analysis failed. Please try again with a clear crop leaf image.'
    });
  }
});

// GET /api/crop-doctor/history
router.get('/history', protect, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, image_url, crop_name, disease_name, confidence, 
              remedy_organic, remedy_chemical, created_at
       FROM crop_diagnoses 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [req.user.id]
    );
    
    res.json({ 
      success: true, 
      history: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/crop-doctor/diagnosis/:id
router.get('/diagnosis/:id', protect, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM crop_diagnoses 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }
    
    res.json({ success: true, diagnosis: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch diagnosis' });
  }
});

module.exports = router;