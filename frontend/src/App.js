import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropDoctor from './pages/CropDoctor';
import SoilAdvisor from './pages/SoilAdvisor';
import CropCalendar from './pages/CropCalendar';
import WeatherAlerts from './pages/WeatherAlerts';
import MandiPrices from './pages/MandiPrices';
import ProfitCalculator from './pages/ProfitCalculator';
import IrrigationOptimizer from './pages/IrrigationOptimizer';
import VoiceAssistant from './pages/VoiceAssistant';
import ImageToText from './pages/ImageToText';
import FarmerHub from './pages/FarmerHub';
import GovtSchemes from './pages/GovtSchemes';
import CropLossReport from './pages/CropLossReport';
import Profile from './pages/Profile';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/crop-doctor" element={<ProtectedRoute><Layout><CropDoctor /></Layout></ProtectedRoute>} />
          <Route path="/soil-advisor" element={<ProtectedRoute><Layout><SoilAdvisor /></Layout></ProtectedRoute>} />
          <Route path="/crop-calendar" element={<ProtectedRoute><Layout><CropCalendar /></Layout></ProtectedRoute>} />
          <Route path="/weather-alerts" element={<ProtectedRoute><Layout><WeatherAlerts /></Layout></ProtectedRoute>} />
          <Route path="/mandi-prices" element={<ProtectedRoute><Layout><MandiPrices /></Layout></ProtectedRoute>} />
          <Route path="/profit-calculator" element={<ProtectedRoute><Layout><ProfitCalculator /></Layout></ProtectedRoute>} />
          <Route path="/irrigation-optimizer" element={<ProtectedRoute><Layout><IrrigationOptimizer /></Layout></ProtectedRoute>} />
          <Route path="/voice-assistant" element={<ProtectedRoute><Layout><VoiceAssistant /></Layout></ProtectedRoute>} />
          <Route path="/image-to-text" element={<ProtectedRoute><Layout><ImageToText /></Layout></ProtectedRoute>} />
          <Route path="/farmer-hub" element={<ProtectedRoute><Layout><FarmerHub /></Layout></ProtectedRoute>} />
          <Route path="/govt-schemes" element={<ProtectedRoute><Layout><GovtSchemes /></Layout></ProtectedRoute>} />
          <Route path="/crop-loss-report" element={<ProtectedRoute><Layout><CropLossReport /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
