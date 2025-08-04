import React, { useState } from 'react';
import { Box, Flex, IconButton, Text, Grid, Button, useDisclosure } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCog, FaCloudRain, FaExclamationTriangle, FaMap } from 'react-icons/fa';
import PropTypes from 'prop-types';

// Assuming these are custom components located in react-ui/src/components
import WeatherDisplayCard from '../../components/weather_display_card';
import DailyForecastList from '../../components/daily_forecast_list';
import ConfirmationDialog from '../../components/confirmation_dialog';

const DashboardScreen = ({
  currentLocation = "New York, NY",
  locationAccessDenied = false,
  locationDetectionFailed = false,
  lastUpdated = "N/A",
  onNavigateToLocationManagement,
  onNavigateToSettingsScreen,
  onNavigateToHourlyForecastScreen,
  onNavigateToWeatherAlertsScreen,
  onNavigateToRadarMapScreen,
  onNavigateToHistoricalDataScreen,
  onTryAgainLocationDetection,
  onManageLocationsNavigation,
}) => {
  const { isOpen: isLocationDetectionFailedDialogOpen, onClose: onCloseLocationDetectionFailedDialog } = useDisclosure({
    isOpen: locationDetectionFailed,
  });

  const handleTryAgain = () => {
    onTryAgainLocationDetection();
    onCloseLocationDetectionFailedDialog();
  };

  const handleManageLocationsNavigation = () => {
    onManageLocationsNavigation();
    onCloseLocationDetectionFailedDialog();
  };

  return (
    <Flex direction="column" gap={6} minH="100vh" p={4} bg="gray.50">
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <IconButton
          aria-label="Manage Locations"
          icon={<FaMapMarkerAlt />}
          onClick={onNavigateToLocationManagement}
          size="lg"
          colorScheme="blue"
          variant="ghost"
        />
        <Text fontSize="lg" fontWeight="bold" color="gray.800">Current Location: {currentLocation}</Text>
        <IconButton
          aria-label="Settings"
          icon={<FaCog />}
          onClick={onNavigateToSettingsScreen}
          size="lg"
          colorScheme="blue"
          variant="ghost"
        />
      </Flex>

      {/* Location Access Denied Message */}
      {locationAccessDenied && (
        <Text color="red.500" mb={4} textAlign="center" fontSize="md">
          Location access denied. Location-based features are unavailable.
        </Text>
      )}

      {/* Location Detection Failed Dialog */}
      <ConfirmationDialog
        isOpen={isLocationDetectionFailedDialogOpen}
        onClose={onCloseLocationDetectionFailedDialog}
        title="Location Detection Failed"
        message="Unable to detect your current location. Please try again or manage your locations."
        onConfirm={handleTryAgain}
        onCancel={handleManageLocationsNavigation}
        confirmButtonText="Try Again"
        cancelButtonText="Manage Locations"
      />

      {/* Weather Details Grid */}
      <Grid gap={4} mb={6} templateColumns="repeat(auto-fit, minmax(150px, 1fr))">
        <WeatherDisplayCard label="Feels Like" value="27" unit="°C" />
        <WeatherDisplayCard label="Humidity" value="75" unit="%" />
        <WeatherDisplayCard label="Wind" value="15" unit="km/h" description="NW" />
        <WeatherDisplayCard
          label="Precipitation"
          value="N/A"
          description="Current precipitation type and intensity"
          icon={<FaCloudRain />}
          onClick={onNavigateToHourlyForecastScreen}
        />
        <WeatherDisplayCard
          label="Active Alerts"
          value="5"
          description="Non-severe"
          icon={<FaExclamationTriangle />}
          onClick={onNavigateToWeatherAlertsScreen}
        />
      </Grid>

      {/* Daily Forecast List */}
      <DailyForecastList forecastItems={[]} />

      {/* Navigation Buttons */}
      <Flex justifyContent="space-around" mb={4} mt={6}>
        <IconButton
          aria-label="View Radar Map"
          icon={<FaMap />}
          onClick={onNavigateToRadarMapScreen}
          size="lg"
          colorScheme="teal"
          variant="solid"
        />
        <Button
          colorScheme="blue"
          variant="outline"
          onClick={onNavigateToHistoricalDataScreen}
          size="lg"
        >
          View Historical Data
        </Button>
      </Flex>

      {/* Last Updated Timestamp */}
      <Text color="gray.500" fontSize="sm" mt="auto" textAlign="center">
        Last updated: {lastUpdated}
      </Text>
    </Flex>
  );
};

DashboardScreen.propTypes = {
  currentLocation: PropTypes.string,
  locationAccessDenied: PropTypes.bool,
  locationDetectionFailed: PropTypes.bool,
  lastUpdated: PropTypes.string,
  onNavigateToLocationManagement: PropTypes.func,
  onNavigateToSettingsScreen: PropTypes.func,
  onNavigateToHourlyForecastScreen: PropTypes.func,
  onNavigateToWeatherAlertsScreen: PropTypes.func,
  onNavigateToRadarMapScreen: PropTypes.func,
  onNavigateToHistoricalDataScreen: PropTypes.func,
  onTryAgainLocationDetection: PropTypes.func,
  onManageLocationsNavigation: PropTypes.func,
};

export default DashboardScreen;