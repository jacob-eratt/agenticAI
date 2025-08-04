import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DailyForecastDetailsScreen from './pages/DailyForecastDetailsScreen';
import DashboardScreen from './pages/DashboardScreen';
import HistoricalDataScreen from './pages/HistoricalDataScreen';
import LocationManagementScreen from './pages/LocationManagementScreen';
import RadarMapScreen from './pages/RadarMapScreen';
import SettingsScreen from './pages/SettingsScreen';
import WeatherAlertsScreen from './pages/WeatherAlertsScreen';

/**
 * App component for routing and navigation.
 * @returns {JSX.Element} The App component.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/daily-forecast-details" element={<DailyForecastDetailsScreen />} />
        <Route path="/historical-data" element={<HistoricalDataScreen />} />
        <Route path="/location-management" element={<LocationManagementScreen />} />
        <Route path="/radar-map" element={<RadarMapScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/weather-alerts" element={<WeatherAlertsScreen />} />
      </Routes>
    </Router>
  );
}

export default App;