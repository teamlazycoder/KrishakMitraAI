import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';

const WMO = { 0:'☀️ Clear Sky', 1:'🌤️ Mainly Clear', 2:'⛅ Partly Cloudy', 3:'☁️ Overcast', 45:'🌫️ Foggy', 48:'🌫️ Icy Fog', 51:'🌦️ Light Drizzle', 53:'🌦️ Drizzle', 55:'🌧️ Heavy Drizzle', 61:'🌧️ Slight Rain', 63:'🌧️ Moderate Rain', 65:'🌧️ Heavy Rain', 71:'🌨️ Slight Snow', 73:'🌨️ Moderate Snow', 75:'❄️ Heavy Snow', 80:'🌦️ Rain Showers', 81:'🌧️ Moderate Showers', 82:'⛈️ Violent Showers', 95:'⛈️ Thunderstorm', 96:'⛈️ Storm with Hail', 99:'⛈️ Severe Storm' };

const getAlert = (day) => {
  const alerts = [];
  if (day.precipitation_sum > 20) alerts.push({ type: 'warning', msg: '⚠️ Heavy rain expected – delay fertilizer/pesticide application' });
  if (day.temperature_2m_max > 40) alerts.push({ type: 'error', msg: '🌡️ Extreme heat >40°C – irrigate crops today, avoid fieldwork midday' });
  if (day.windspeed_10m_max > 30) alerts.push({ type: 'warning', msg: '💨 Strong winds >30km/h – avoid pesticide spraying' });
  if (day.temperature_2m_min < 5) alerts.push({ type: 'info', msg: '❄️ Frost alert – cover sensitive crops, no irrigation tonight' });
  if (day.precipitation_sum > 5 && day.precipitation_sum <= 20) alerts.push({ type: 'info', msg: '🌧️ Moderate rain – good for irrigation savings' });
  return alerts;
};

export default function WeatherAlerts() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('Your Location');

  useEffect(() => {
    const fetchWeather = (lat = 19.0760, lon = 72.8777) => {
      API.get(`/weather/current?lat=${lat}&lon=${lon}`)
        .then(r => { setWeather(r.data.weather); setLoading(false); })
        .catch(() => { setError('Failed to load weather data.'); setLoading(false); });
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { fetchWeather(pos.coords.latitude, pos.coords.longitude); setLocationName('Your Location'); },
        () => fetchWeather()
      );
    } else fetchWeather();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading weather data...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!weather) return null;

  const cw = weather.current_weather;
  const daily = weather.daily;
  const wIcon = n => WMO[n]?.split(' ')[0] || '🌤️';
  const wLabel = n => WMO[n]?.split(' ').slice(1).join(' ') || 'Cloudy';

  const todayAlerts = daily ? getAlert({
    temperature_2m_max: daily.temperature_2m_max[0],
    temperature_2m_min: daily.temperature_2m_min[0],
    precipitation_sum: daily.precipitation_sum[0],
    windspeed_10m_max: daily.windspeed_10m_max[0]
  }) : [];

  return (
    <div className="fade-in">
      <div className="page-title">⛅ Weather Intelligence</div>
      <div className="page-subtitle">Real-time weather with farming-specific alerts and 7-day forecast</div>

      {/* Current */}
      <div className="weather-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>📍 {locationName} {weather.mock && '(Demo Data)'}</div>
            <div style={{ fontSize: 64, fontWeight: 900 }}>{Math.round(cw?.temperature)}°C</div>
            <div style={{ fontSize: 18, opacity: 0.9, marginTop: 4 }}>{wIcon(cw?.weathercode)} {wLabel(cw?.weathercode)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: '💨', label: 'Wind', val: `${Math.round(cw?.windspeed)} km/h` },
              { icon: '💧', label: 'Rain Today', val: `${daily?.precipitation_sum?.[0] || 0} mm` },
              { icon: '🌡️', label: 'Max Temp', val: `${Math.round(daily?.temperature_2m_max?.[0] || cw?.temperature + 4)}°C` },
              { icon: '🌡️', label: 'Min Temp', val: `${Math.round(daily?.temperature_2m_min?.[0] || cw?.temperature - 6)}°C` },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: 18 }}>{item.icon}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {todayAlerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 12 }}>🚨 Farming Alerts Today</h3>
          {todayAlerts.map((a, i) => (
            <div key={i} className={`alert alert-${a.type}`} style={{ marginBottom: 10 }}>{a.msg}</div>
          ))}
        </div>
      )}

      {/* 7-day forecast */}
      {daily && (
        <div className="card">
          <h3 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>📅 7-Day Forecast</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(80px, 1fr))', gap: 10, overflowX: 'auto' }}>
            {daily.time.map((day, i) => {
              const dayAlerts = getAlert({ temperature_2m_max: daily.temperature_2m_max[i], temperature_2m_min: daily.temperature_2m_min[i], precipitation_sum: daily.precipitation_sum[i], windspeed_10m_max: daily.windspeed_10m_max[i] });
              return (
                <div key={day} style={{
                  textAlign: 'center', background: i === 0 ? '#E8F5E9' : '#F5F5F5',
                  borderRadius: 12, padding: '16px 8px',
                  border: i === 0 ? '2px solid #81C784' : '2px solid transparent'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--green-primary)' : '#666', marginBottom: 6 }}>
                    {i === 0 ? 'TODAY' : new Date(day).toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 28, margin: '8px 0' }}>{wIcon(daily.weathercode[i])}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#333' }}>{Math.round(daily.temperature_2m_max[i])}°</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{Math.round(daily.temperature_2m_min[i])}°</div>
                  {daily.precipitation_sum[i] > 0 && (
                    <div style={{ fontSize: 11, color: '#1565C0', marginTop: 4 }}>💧{daily.precipitation_sum[i]}mm</div>
                  )}
                  {dayAlerts.length > 0 && <div style={{ fontSize: 14, marginTop: 4 }}>⚠️</div>}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
            <h4 style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 12 }}>💡 Week's Farming Tips</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                daily.precipitation_sum?.some(r => r > 10) ? '🌧️ Rain expected this week – hold off on fertilizer till dry day' : '☀️ Dry week ahead – plan irrigation schedule in advance',
                daily.temperature_2m_max?.some(t => t > 35) ? '🌡️ High temperatures expected – morning/evening irrigation only' : '🌱 Moderate temperatures – good week for field activities',
                daily.windspeed_10m_max?.some(w => w > 25) ? '💨 Windy days ahead – avoid pesticide spraying on those days' : '✅ Calm wind conditions – good for pesticide/fungicide application'
              ].map((tip, i) => (
                <div key={i} style={{ background: '#F9FBE7', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#33691E' }}>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
