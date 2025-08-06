import React from 'react';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {
  WeatherDisplayCard,
  DailyForecastList,
  TextDisplay,
  IconButton,
  Button,
  ConfirmationDialog
} from '../components';

/**
 * @typedef {object} DashboardScreenProps
 */

/**
 * Main dashboard displaying current weather information and quick access to other features.
 * @param {DashboardScreenProps} props - The props for the DashboardScreen component.
 * @returns {React.Element} The rendered DashboardScreen component.
 */
export default function DashboardScreen() {
  // Placeholder functions for navigation and dialog actions
  const navigateToLocationManagement = () => {
    console.log('Navigate to Location Management');
  };

  const navigate_to_settings_screen = () => {
    console.log('Navigate to Settings Screen');
  };

  const navigate_to_hourly_forecast_screen = () => {
    console.log('Navigate to Hourly Forecast Screen');
  };

  const navigate_to_weather_alerts_screen = () => {
    console.log('Navigate to Weather Alerts Screen');
  };

  const navigateToHistoricalDataScreen = () => {
    console.log('Navigate to Historical Data Screen');
  };

  const navigate_to_radar_map_screen = () => {
    console.log('Navigate to Radar Map Screen');
  };

  const handleManageLocationsNavigation = () => {
    console.log('Handle Manage Locations Navigation from dialog');
  };

  const handleTryAgain = () => {
    console.log('Handle Try Again from dialog');
  };

  // Placeholder for timestamp
  const lastUpdatedTimestamp = new Date().toLocaleString();

  return (
    <Flex bg="gray.50" direction="column" gap={6} minH="100vh" p={6}>
      {/* Header Section */}
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <TextDisplay
          text="Current Location: New York, NY"
          fontSize="xl"
          fontWeight="bold"
        />
        <Flex gap={2}>
          <IconButton
            ariaLabel="Manage Locations"
            icon="location"
            onClick={navigateToLocationManagement}
            colorScheme="gray"
            variant="ghost"
          />
          <IconButton
            ariaLabel="Settings"
            icon="settings"
            onClick={navigate_to_settings_screen}
            colorScheme="gray"
            variant="ghost"
          />
        </Flex>
      </Flex>

      {/* Weather Display Cards Grid */}
      <Grid gap={4} mb={6} templateColumns="repeat(auto-fit, minmax(150px, 1fr))">
        <WeatherDisplayCard
          condition="Feels Like"
          temperature="27°C"
        />
        <WeatherDisplayCard
          condition="Humidity"
          humidity="75%"
        />
        <WeatherDisplayCard
          condition="Wind"
          windSpeed="15 km/h NW"
        />
        <WeatherDisplayCard
          condition="Precipitation"
          icon="precipitation_icon"
          onClick={navigate_to_hourly_forecast_screen}
          precipitation="N/A"
        />
        <WeatherDisplayCard
          locationName="Active Alerts"
          temperature="5"
          condition="Non-severe"
          onClick={navigate_to_weather_alerts_screen}
        />
      </Grid>

      {/* Daily Forecast List */}
      <DailyForecastList
        forecastItems={[]}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        p={4}
      />

      {/* Footer Section */}
      <Flex alignItems="center" justifyContent="space-between" mt={6}>
        <Button
          label="View Historical Data"
          onClick={navigateToHistoricalDataScreen}
          colorScheme="blue"
          variant="outline"
        />
        <IconButton
          ariaLabel="View Radar Map"
          icon="map_icon"
          onClick={navigate_to_radar_map_screen}
          colorScheme="blue"
          variant="solid"
        />
      </Flex>

      {/* Last Updated Timestamp */}
      <TextDisplay
        text={`Last updated: ${lastUpdatedTimestamp}`}
        color="gray.500"
        fontSize="sm"
        mt={4}
        textAlign="right"
      />

      {/* Conditional Components (example, not directly in layout but in screen JSON) */}
      {/* <TextDisplay
        text="Location access denied. Location-based features are unavailable."
      /> */}
      <ConfirmationDialog
        isOpen={false} // Set to true to test, or manage with state
        message="Unable to detect your current location. Please try again or manage your locations."
        onClose={handleManageLocationsNavigation}
        onConfirm={handleTryAgain}
        title="Location Detection Failed"
      />
    </Flex>
  );
}

DashboardScreen.propTypes = {
  // No props defined for the screen itself based on the provided JSONs
};