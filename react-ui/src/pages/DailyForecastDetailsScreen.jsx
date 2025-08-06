import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import DailyDetailsPanel from '../components/DailyDetailsPanel';
import PropTypes from 'prop-types';

/**
 * DailyForecastDetailsScreen component displays comprehensive weather details and hourly breakdown for a selected day.
 * @param {object} props - The component props.
 * @param {string} props.date - The date for which the forecast details are displayed.
 * @param {string} props.temperature - The temperature for the day.
 * @param {string} props.precipitation - The precipitation for the day.
 * @param {string} props.wind - The wind speed and direction for the day.
 * @param {string} props.humidity - The humidity for the day.
 */
export default function DailyForecastDetailsScreen({ date, temperature, precipitation, wind, humidity }) {
  return (
    <Flex
      width="100%"
      minH="100vh"
      bg="gray.50"
      direction="column"
      px={{ base: 4, md: 8, lg: 12 }}
      py={{ base: 6, md: 10, lg: 14 }}
      gap={{ base: 6, md: 8 }}
    >
      <Box
        width="100%"
        maxW="800px"
        mx="auto"
        bg="white"
        borderRadius="lg"
        boxShadow="lg"
        p={{ base: 4, md: 6 }}
      >
        <DailyDetailsPanel
          date={date}
          temperature={temperature}
          precipitation={precipitation}
          wind={wind}
          humidity={humidity}
          width="100%"
        />
      </Box>
    </Flex>
  );
}

DailyForecastDetailsScreen.propTypes = {
  date: PropTypes.string,
  temperature: PropTypes.string,
  precipitation: PropTypes.string,
  wind: PropTypes.string,
  humidity: PropTypes.string,
};
