import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecommendationFeedScreen from './pages/RecommendationFeedScreen';
import SettingsScreen from './pages/SettingsScreen';
import Weather_Forecast_Screen from './pages/Weather_Forecast_Screen';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/recommendationfeed" element={<RecommendationFeedScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/weather_forecast_" element={<Weather_Forecast_Screen />} />
      </Routes>
    </Router>
  );
}
