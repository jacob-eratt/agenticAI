import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { DailyDetailsPanel } from '../components';

/**
 * DailyForecastDetailsScreen component displays comprehensive weather details for a selected day.
 * It uses the DailyDetailsPanel to show temperature, precipitation, wind, humidity, and date.
 */
export default function DailyForecastDetailsScreen() {
  return (
    <Box p={8} maxW="xl" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
      <Heading as="h1" size="xl" mb={6} textAlign="center" color="gray.700">Daily Forecast Details</Heading>
      <DailyDetailsPanel
        temperature="25°C"
        precipitation="10%"
        wind="15 km/h NE"
        humidity="60%"
        date="2023-10-27"
      />
    </Box>
  );
}

DailyForecastDetailsScreen.propTypes = {
  // No props for this screen as per the provided JSON, but can be extended if needed.
};
