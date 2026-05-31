# 🌾 Krishak Mitra AI – Smart Farming Assistant

A full-stack AI-powered farming assistant for Indian farmers with 13 features including crop disease detection, soil analysis, mandi price prediction, weather alerts, and more.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- (Optional) PostgreSQL for production DB

---

## 📁 Project Structure

```
krishak-mitra/
├── frontend/          # React.js frontend
│   ├── src/
│   │   ├── pages/     # 13 feature pages + auth pages
│   │   ├── components/ # Layout, Sidebar
│   │   ├── context/   # Auth context + Axios API
│   │   └── index.css  # Global styles
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── routes/        # All API routes
│   ├── middleware/    # Auth JWT middleware
│   ├── config/        # DB config + SQL schema
│   └── server.js
└── README.md
```

---

## ⚙️ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev

# Or production
npm start
```

Backend runs on: `http://localhost:5000`

### Environment Variables (backend/.env)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:3000
```

> **Note:** The MVP uses in-memory storage (Maps). For production, connect PostgreSQL using `DATABASE_URL` and run `config/schema.sql`.

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🏗️ Running Both Together

Open two terminals:

**Terminal 1 – Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd frontend && npm start
```

Then open `http://localhost:3000` in your browser.

---

## 🌟 Features (13 Total)

| # | Feature | Route |
|---|---------|-------|
| 1 | 🔬 AI Crop Doctor | `/crop-doctor` |
| 2 | 🌱 Soil Health Advisor | `/soil-advisor` |
| 3 | 📅 Crop Calendar | `/crop-calendar` |
| 4 | ⛅ Weather Intelligence | `/weather-alerts` |
| 5 | 💰 Mandi Price Predictor | `/mandi-prices` |
| 6 | 🧮 Profit Calculator | `/profit-calculator` |
| 7 | 💧 Irrigation Optimizer | `/irrigation-optimizer` |
| 8 | 🎙️ Voice AI Assistant | `/voice-assistant` |
| 9 | 📸 Image to Text (OCR) | `/image-to-text` |
| 10 | 👥 Farmer Hub | `/farmer-hub` |
| 11 | 🏛️ Government Schemes | `/govt-schemes` |
| 12 | 🆘 Crop Loss Report | `/crop-loss-report` |
| 13 | 👤 User Profile | `/profile` |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
GET    /api/auth/me
PUT    /api/auth/profile
GET    /api/auth/logout
```

### Features
```
POST   /api/crop-doctor/analyze
POST   /api/soil-advisor/recommend
POST   /api/crop-calendar/generate
GET    /api/weather/current?lat=&lon=
GET    /api/mandi/price/:crop?state=
GET    /api/mandi/all-prices
POST   /api/profit/calculate
POST   /api/irrigation/advise
POST   /api/voice/process
POST   /api/image-to-text/extract
GET    /api/hub/posts
POST   /api/hub/posts
PUT    /api/hub/posts/:id/upvote
GET    /api/schemes
POST   /api/schemes/check-eligibility
POST   /api/report/crop-loss
GET    /api/report/user-reports
GET    /api/dashboard/stats
```

---

## 🗄️ Database (PostgreSQL – Production)

Run `backend/config/schema.sql` to create all tables:

```bash
psql -U postgres -d krishak_mitra -f backend/config/schema.sql
```

Tables: `users`, `crop_diagnoses`, `soil_reports`, `crop_calendars`, `mandi_prices`, `profit_calculations`, `irrigation_advice`, `farmer_advice`, `advice_upvotes`, `crop_loss_reports`, `saved_predictions`

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the /build folder
```

Set environment variable: `REACT_APP_API_URL=https://your-backend.render.com/api`

### Backend (Render/Railway/Heroku)
1. Push to GitHub
2. Connect to Render/Railway
3. Set environment variables from `.env.example`
4. Deploy as Node.js web service
5. Entry point: `server.js`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS (no framework deps) |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Auth | JWT + bcryptjs |
| Database | PostgreSQL (prod) / in-memory (dev) |
| File Upload | Multer |
| Weather API | Open-Meteo (free, no key needed) |
| ML/AI | Mock responses (replace with TensorFlow.js or Python microservice) |

---

## 📱 Languages Supported
- हिंदी (Hindi)
- English
- मराठी (Marathi)
- ਪੰਜਾਬੀ (Punjabi)
- తెలుగు (Telugu)

---

## 👥 Built By
**LazyCoder's Team** – Hackathon Project
- Kartik (Lead)
- Atharva Deotare
- Akshay Kamble
- Darshan Bijewar
- Prajwal Fupare

---

## 📝 License
MIT License – Free for educational and non-commercial use.
