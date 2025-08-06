import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, SimpleGrid } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import IconButton from '../components/IconButton';
import WeatherDisplayCard from '../components/WeatherDisplayCard';
import DailyForecastList from '../components/DailyForecastList';
import ConfirmationDialog from '../components/ConfirmationDialog';

/**
 * DashboardScreen component displays current weather information and provides quick access to other features.
 * It includes navigation buttons, current location display, weather details, daily forecast, and a location error dialog.
 */
const DashboardScreen = () => {
  const navigate = useNavigate();
  const [isLocationErrorDialogOpen, setIsLocationErrorDialogOpen] = useState(true); // Initialized to true based on layout JSON
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState('');

  useEffect(() => {
    setLastUpdatedTimestamp(new Date().toLocaleString());
  }, []);

  /**
   * Navigates to the location management screen.
   */
  const navigateToLocationManagement = () => {
    navigate('/location-management');
  };

  /**
   * Navigates to the settings screen.
   */
  const navigate_to_settings_screen = () => {
    navigate('/settings');
  };

  /**
   * Navigates to the radar map screen.
   */
  const navigate_to_radar_map_screen = () => {
    navigate('/radar-map');
  };

  /**
   * Navigates to the historical data screen.
   */
  const navigateToHistoricalDataScreen = () => {
    navigate('/historical-data');
  };

  /**
   * Navigates to the hourly forecast screen.
   */
  const navigate_to_hourly_forecast_screen = () => {
    navigate('/hourly-forecast');
  };

  /**
   * Handles navigation to the location management screen from the dialog.
   */
  const handleManageLocationsNavigation = () => {
    setIsLocationErrorDialogOpen(false);
    navigateToLocationManagement();
  };

  /**
   * Handles the "Try Again" action from the location error dialog.
   */
  const handleTryAgain = () => {
    setIsLocationErrorDialogOpen(false);
    // Placeholder for actual logic to retry location detection
    console.log('Retrying location detection...');
  };

  /**
   * Navigates to the weather alerts screen.
   */
  const navigate_to_weather_alerts_screen = () => {
    navigate('/weather-alerts');
  };

  return (
    <Flex
      direction="column"
      gap={6}
      minH="100vh"
      px={{ base: 4, lg: 12, md: 8 }}
      py={{ base: 4, md: 8 }}
      width="100%"
      bg="gray.50"
    >
      {/* Top-level navigation buttons */}
      <Flex
        alignItems="center"
        gap={4}
        justifyContent="flex-end"
        py={4}
        width="100%"
      >
        <IconButton
          ariaLabel="Manage Locations"
          colorScheme="blue"
          icon="location"
          onClick={navigateToLocationManagement}
          variant="ghost"
        />
        <IconButton
          ariaLabel="Settings"
          colorScheme="gray"
          icon="settings"
          onClick={navigate_to_settings_screen}
          variant="ghost"
        />
        <IconButton
          ariaLabel="View Radar Map"
          colorScheme="teal"
          icon="map_icon"
          onClick={navigate_to_radar_map_screen}
          variant="ghost"
        />
        <Button
          colorScheme="purple"
          label="View Historical Data"
          onClick={navigateToHistoricalDataScreen}
          variant="outline"
        />
      </Flex>

      {/* Main content area */}
      <Flex
        direction="column"
        flex={1}
        gap={6}
        width="100%"
      >
        <Text
          bg="red.50"
          borderRadius="md"
          color="red.600"
          fontWeight="semibold"
          p={4}
          text="Location access denied. Location-based features are unavailable."
          textAlign="center"
          width="100%"
        >
          Location access denied. Location-based features are unavailable.
        </Text>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          py={2}
          text="Current Location: New York, NY"
          textAlign="center"
          width="100%"
        >
          Current Location: New York, NY
        </Text>

        {/* Container for current weather details and active alerts */}
        <Flex
          alignItems="flex-start"
          direction={{ base: 'column', md: 'row' }}
          gap={6}
          width="100%"
        >
          {/* Container for current weather details */}
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            display="flex"
            flexDirection="column"
            gap={4}
            minW="300px"
            p={6}
            flex={1}
          >
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <WeatherDisplayCard
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                label="Feels Like"
                textAlign="center"
                unit="°C"
                value="27"
              />
              <WeatherDisplayCard
                fontSize={{ base: 'lg', md: 'xl' }}
                label="Humidity"
                textAlign="center"
                unit="%"
                value="75"
              />
              <WeatherDisplayCard
                description="NW"
                fontSize={{ base: 'lg', md: 'xl' }}
                label="Wind"
                textAlign="center"
                unit="km/h"
                value="15"
              />
              <WeatherDisplayCard
                description="Current precipitation type and intensity"
                fontSize={{ base: 'lg', md: 'xl' }}
                icon="precipitation_icon"
                label="Precipitation"
                onClick={navigate_to_hourly_forecast_screen}
                textAlign="center"
                value="N/A"
              />
            </SimpleGrid>
            <Text
              color="gray.500"
              fontSize="sm"
              textAlign="right"
            >
              Last updated: {lastUpdatedTimestamp}
            </Text>
          </Box>

          {/* Summary card displaying active non-severe weather alerts */}
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            display="flex"
            flexDirection="column"
            gap={4}
            minW="300px"
            p={6}
            flex={1}
          >
            <Text fontSize="xl" fontWeight="bold" textAlign="center">
              Active Alerts
            </Text>
            {/* Using WeatherDisplayCard for active alerts as per screen JSON */}
            <WeatherDisplayCard
              description="Non-severe"
              label="Active Alerts"
              onClick={navigate_to_weather_alerts_screen}
              value="5"
            />
            <Text color="gray.500" textAlign="center">
              No active alerts.
            </Text>
          </Box>
        </Flex>

        {/* Container for the daily weather forecast summary */}
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          p={6}
          width="100%"
        >
          <DailyForecastList forecastItems={[]} />
        </Box>
      </Flex>

      {/* Dialog for location detection failure */}
      <ConfirmationDialog
        isOpen={isLocationErrorDialogOpen}
        message="Unable to detect your current location. Please try again or manage your locations."
        onClose={handleManageLocationsNavigation}
        onConfirm={handleTryAgain}
        title="Location Detection Failed"
      />
    </Flex>
  );
};

DashboardScreen.propTypes = {
  // No props for the screen itself, as per the layout and screen JSONs.
};

export default DashboardScreen;