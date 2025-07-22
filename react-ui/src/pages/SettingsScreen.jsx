// Auto-generated imports
import React from 'react';
import Text from '../components/Text';
import Icon from '../components/Icon';
import Location_Privacy_and_Management from '../components/Location_Privacy_and_Management';
import Toggle from '../components/Toggle';
import Preferred_Locations_Manager from '../components/Preferred_Locations_Manager';
import Button from '../components/Button';
import List from '../components/List';
import Message from '../components/Message';

export default function SettingsScreen() {
  return (
    <main>
      <Text className="screen-title">Settings</Text>
      <Location_Privacy_and_Management className="section-card">
        <Text className="section-title">Location Services</Text>
        <Toggle label="Enable Location Access" checked={true} />
        <Text className="privacy-text">Allow the app to access your device's location for personalized weather updates. Read our Privacy Policy.</Text>
        <Button label="Open Device Location Settings" onClick="openSystemLocationSettings" className="secondary-button" />
        <Message type="warning" content="Location services are disabled on your device. Please enable them in system settings for automatic location detection." style={{"marginTop": "10px", "backgroundColor": "#fff3cd"}} />
        <Message type="error" content="Could not determine your location automatically. Please try again or search manually." style={{"marginTop": "10px", "backgroundColor": "#f8d7da"}} />
        <Button label="Search Manually" onClick="navigateToManualSearch" />
      </Location_Privacy_and_Management>
      <Preferred_Locations_Manager className="section-card">
        <Text className="section-title">Manage Preferred Locations</Text>
        <Button label="Save Current Location" onClick="saveCurrentLocation" />
        <List title="Your Saved Locations" draggable={true} className="saved-locations-list">
          <Text className="list-item-location-name">New York</Text>
          <Button label="View" onClick="viewLocationDetails" className="list-item-action-button" />
          <Button label="Remove" onClick="removeLocation" className="list-item-remove-button" />
          <Icon name="drag_indicator" className="drag-handle-icon" />
        </List>
      </Preferred_Locations_Manager>
    </main>
  );
}
