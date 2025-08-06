import React, { useState, useEffect } from 'react';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import IconButton from '../components/IconButton';
import Button from '../components/Button';
import WeatherDisplayCard from '../components/WeatherDisplayCard';
import DailyForecastList from '../components/DailyForecastList';
import ConfirmationDialog from '../components/ConfirmationDialog';

/**
 * @typedef {object} DashboardScreenProps
 */

/**
 * Main dashboard displaying current weather information and quick access to other features.
 * @param {DashboardScreenProps} props - Props for the DashboardScreen component.
 * @returns {JSX.Element} The rendered DashboardScreen component.
 */
export default function DashboardScreen() {
  const [isLocationErrorDialogOpen, setIsLocationErrorDialogOpen] = useState(true);

  const navigateToLocationManagement = () => {
    console.log('Navigate to Location Management');
    // Placeholder for actual navigation logic
  };

  const navigate_to_settings_screen = () => {
    console.log('Navigate to Settings Screen');
    // Placeholder for actual navigation logic
  };

  const navigateToHistoricalDataScreen = () => {
    console.log('Navigate to Historical Data Screen');
    // Placeholder for actual navigation logic
  };

  const navigate_to_weather_alerts_screen = () => {
    console.log('Navigate to Weather Alerts Screen');
    // Placeholder for actual navigation logic
  };

  const navigate_to_hourly_forecast_screen = () => {
    console.log('Navigate to Hourly Forecast Screen');
    // Placeholder for actual navigation logic
  };

  const handleManageLocationsNavigation = () => {
    setIsLocationErrorDialogOpen(false);
    navigateToLocationManagement();
  };

  const handleTryAgain = () => {
    setIsLocationErrorDialogOpen(false);
    console.log('Attempting to re-detect location...');
    // Placeholder for actual location re-detection logic
  };

  return (
    <Flex
      alignItems="center"
      bg="gray.50"
      direction="column"
      gap={6}
      minHeight="100vh"
      p={8}
      width="100vw"
    >
      <Flex
        direction="row"
        justifyContent="flex-end"
        maxWidth="1200px"
        mb={4}
        width="100%"
      >
        <IconButton
          ariaLabel="Manage Locations"
          colorScheme="blue"
          icon="location"
          onClick={navigateToLocationManagement}
          size="lg"
          variant="ghost"
        />
        <IconButton
          ariaLabel="Settings"
          colorScheme="blue"
          icon="settings"
          onClick={navigate_to_settings_screen}
          size="lg"
          variant="ghost"
        />
        <Button
          colorScheme="blue"
          label="View Historical Data"
          onClick={navigateToHistoricalDataScreen}
          size="md"
          variant="outline"
        />
      </Flex>

      <Box
        alignSelf="center"
        bg="blue.50"
        borderRadius="md"
        color="blue.800"
        maxWidth="1200px"
        mb={4}
        p={4}
        textAlign="center"
        width="100%"
      >
        Current Location: New York, NY
      </Box>

      <Box
        alignSelf="center"
        bg="red.100"
        borderRadius="md"
        color="red.800"
        maxWidth="1200px"
        mb={4}
        p={4}
        textAlign="center"
        width="100%"
      >
        Location access denied. Location-based features are unavailable.
      </Box>

      <WeatherDisplayCard
        alignSelf="center"
        boxShadow="lg"
        colorScheme="blue"
        label="Feels Like"
        size="lg"
        value="27"
        unit="°C"
        width={{ base: "100%", lg: "50%", md: "70%" }}
        location="New York, NY"
        temperature="25"
        condition="Partly Cloudy"
        humidity="60"
        windSpeed="10"
        precipitation="0"
      />

      <WeatherDisplayCard
        alignSelf="center"
        boxShadow="md"
        colorScheme="orange"
        description="Non-severe"
        label="Active Alerts"
        onClick={navigate_to_weather_alerts_screen}
        size="md"
        value="5"
        width={{ base: "100%", lg: "50%", md: "70%" }}
      />

      <Grid
        gap={4}
        maxWidth="1200px"
        templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)", md: "repeat(2, 1fr)" }}
        width="100%"
      >
        <WeatherDisplayCard
          colorScheme="teal"
          label="Humidity"
          value="75"
          unit="%"
          size="md"
          width="100%"
          location="Los Angeles, CA"
          temperature="22"
          condition="Sunny"
          humidity="75"
          windSpeed="5"
          precipitation="0"
        />
        <WeatherDisplayCard
          colorScheme="purple"
          description="NW"
          label="Wind"
          size="md"
          unit="km/h"
          value="15"
          width="100%"
          location="Chicago, IL"
          temperature="18"
          condition="Windy"
          humidity="50"
          windSpeed="15"
          precipitation="0"
        />
        <WeatherDisplayCard
          colorScheme="blue"
          icon="precipitation_icon"
          label="Precipitation"
          onClick={navigate_to_hourly_forecast_screen}
          value="N/A"
          size="md"
          width="100%"
          location="Seattle, WA"
          temperature="15"
          condition="Rainy"
          humidity="85"
          windSpeed="8"
          precipitation="10"
        />
      </Grid>

      <DailyForecastList
        alignSelf="center"
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        forecastItems={[]}
        maxWidth="1200px"
        p={4}
        width={{ base: "100%", lg: "80%", md: "90%" }}
      />

      <ConfirmationDialog
        isOpen={isLocationErrorDialogOpen}
        message="Unable to detect your current location. Please try again or manage your locations."
        onClose={() => setIsLocationErrorDialogOpen(false)}
        onConfirm={handleTryAgain}
        title="Location Detection Failed"
      />
    </Flex>
  );
}

DashboardScreen.propTypes = {
  // No specific props for the screen itself, but components within it have props.
};