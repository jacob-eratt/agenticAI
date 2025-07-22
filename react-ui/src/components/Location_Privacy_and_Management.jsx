
import React, { useState, useEffect } from 'react';

export default function Location_Privacy_and_Management() {
  // State for location service enablement, persisted in localStorage
  const [isLocationEnabled, setIsLocationEnabled] = useState(() => {
    const storedValue = localStorage.getItem('isLocationEnabled');
    // Parse stored value or default to true if not found
    return storedValue ? JSON.parse(storedValue) : true;
  });

  // State for messages related to location history management
  const [locationHistoryMessage, setLocationHistoryMessage] = useState('');
  // State for messages related to clearing location data
  const [clearDataMessage, setClearDataMessage] = useState('');

  // Effect to persist the isLocationEnabled state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isLocationEnabled', JSON.stringify(isLocationEnabled));
  }, [isLocationEnabled]);

  // Handler for the location services toggle
  const handleToggleChange = (event) => {
    setIsLocationEnabled(event.target.checked);
    // Clear any existing messages when the toggle changes
    setLocationHistoryMessage('');
    setClearDataMessage('');
  };

  // Handler for the "Manage Location History" button
  const handleManageLocationHistory = () => {
    // Simulate an action, e.g., redirecting to a settings page or opening a modal
    setLocationHistoryMessage('Redirecting to location history settings...');
    // Simulate a delay for the action to complete and then update message
    setTimeout(() => {
      setLocationHistoryMessage('Location history management interface opened.');
    }, 1500);
  };

  // Handler for the "Clear All Location Data" button
  const handleClearLocationData = () => {
    // Simulate a data clearing process
    setClearDataMessage('Clearing all stored location data...');
    // Simulate a delay for the action to complete and then update message
    setTimeout(() => {
      setClearDataMessage('All location data has been successfully cleared.');
    }, 2000);
  };

  return (
    <div class="section-card">
      <h2>Location Privacy and Management</h2>

      {/* Text component */}
      <p>
        Control how your location data is used and managed by this application.
        You can enable or disable location services and manage your historical data.
      </p>

      {/* Toggle component */}
      <label>
        <input
          type="checkbox"
          checked={isLocationEnabled}
          onChange={handleToggleChange}
        />
        Enable Location Services
      </label>

      {/* Text component (conditional based on toggle state) */}
      <p>
        {isLocationEnabled
          ? "Location services are currently enabled. This allows the application to provide features like personalized content based on your location."
          : "Location services are currently disabled. Some location-based features may not be available or may have limited functionality."}
      </p>

      {/* Button component */}
      <button onClick={handleManageLocationHistory}>
        Manage Location History
      </button>
      {/* Message component (conditionally rendered) */}
      {locationHistoryMessage && (
        <p style={{ marginTop: '10px', color: 'blue' }}>
          {locationHistoryMessage}
        </p>
      )}

      {/* Button component */}
      <button onClick={handleClearLocationData}>
        Clear All Location Data
      </button>
      {/* Message component (conditionally rendered) */}
      {clearDataMessage && (
        <p style={{ marginTop: '10px', color: 'green' }}>
          {clearDataMessage}
        </p>
      )}
    </div>
  );
}
