-- Krishak Mitra AI - Database Schema
-- Run this to initialize the database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  village VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(50),
  land_size DECIMAL(5,2),
  primary_crops TEXT[],
  language_pref VARCHAR(20) DEFAULT 'hindi',
  role VARCHAR(20) DEFAULT 'farmer',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  reset_token VARCHAR(255),
  reset_expires TIMESTAMP,
  otp_code VARCHAR(6),
  otp_expires TIMESTAMP
);

-- Crop diagnoses
CREATE TABLE IF NOT EXISTS crop_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  crop_name VARCHAR(50),
  disease_name VARCHAR(100),
  confidence DECIMAL(5,2),
  remedy_organic TEXT,
  remedy_chemical TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Soil reports
CREATE TABLE IF NOT EXISTS soil_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  soil_type VARCHAR(50),
  soil_ph DECIMAL(3,1),
  nitrogen VARCHAR(10),
  phosphorus VARCHAR(10),
  potassium VARCHAR(10),
  organic_carbon VARCHAR(10),
  fertility_class VARCHAR(50),
  recommended_crops TEXT,
  recommended_fertilizer TEXT,
  irrigation_advice TEXT,
  soil_tips TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crop calendars
CREATE TABLE IF NOT EXISTS crop_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crop_name VARCHAR(50),
  location VARCHAR(100),
  land_area DECIMAL(5,2),
  sowing_date DATE,
  calendar_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mandi prices
CREATE TABLE IF NOT EXISTS mandi_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_name VARCHAR(50),
  state VARCHAR(50),
  mandi_name VARCHAR(100),
  current_price DECIMAL(10,2),
  predicted_7d DECIMAL(10,2),
  predicted_15d DECIMAL(10,2),
  predicted_30d DECIMAL(10,2),
  trend VARCHAR(20),
  recommendation VARCHAR(200),
  confidence DECIMAL(5,2),
  unit VARCHAR(20) DEFAULT 'quintal',
  price_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profit calculations
CREATE TABLE IF NOT EXISTS profit_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  land_size DECIMAL(5,2),
  crop_name VARCHAR(50),
  seed_cost DECIMAL(10,2),
  fertilizer_cost DECIMAL(10,2),
  pesticide_cost DECIMAL(10,2),
  labour_cost DECIMAL(10,2),
  irrigation_cost DECIMAL(10,2),
  transport_cost DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  expected_yield DECIMAL(10,2),
  total_revenue DECIMAL(10,2),
  net_profit DECIMAL(10,2),
  profit_per_acre DECIMAL(10,2),
  break_even_price DECIMAL(10,2),
  roi_percent DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Irrigation advice
CREATE TABLE IF NOT EXISTS irrigation_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crop_name VARCHAR(50),
  growth_stage VARCHAR(50),
  soil_moisture INT,
  soil_type VARCHAR(50),
  temperature DECIMAL(4,1),
  humidity INT,
  rain_forecast BOOLEAN,
  water_requirement INT,
  best_time VARCHAR(50),
  next_irrigation_days INT,
  advice_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Farmer advice hub
CREATE TABLE IF NOT EXISTS farmer_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  farmer_name VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT FALSE,
  advice_text TEXT NOT NULL,
  crop_tag VARCHAR(50),
  category VARCHAR(50),
  upvotes INT DEFAULT 0,
  is_ai_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Upvotes tracking (one per user per post)
CREATE TABLE IF NOT EXISTS advice_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advice_id UUID REFERENCES farmer_advice(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(advice_id, user_id)
);

-- Crop loss reports
CREATE TABLE IF NOT EXISTS crop_loss_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  farmer_name VARCHAR(100),
  crop_name VARCHAR(50),
  loss_cause VARCHAR(50),
  affected_area DECIMAL(5,2),
  loss_date DATE,
  image_url TEXT,
  description TEXT,
  report_summary TEXT,
  loss_percentage DECIMAL(5,2),
  compensation_estimate DECIMAL(10,2),
  report_id VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved predictions
CREATE TABLE IF NOT EXISTS saved_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature_name VARCHAR(50),
  input_data JSONB,
  output_result TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crop_diagnoses_user ON crop_diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_reports_user ON soil_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_calendars_user ON crop_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_profit_calc_user ON profit_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_user ON irrigation_advice(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_advice_crop ON farmer_advice(crop_tag);
CREATE INDEX IF NOT EXISTS idx_farmer_advice_upvotes ON farmer_advice(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_crop_state ON mandi_prices(crop_name, state);
CREATE INDEX IF NOT EXISTS idx_crop_loss_user ON crop_loss_reports(user_id);
