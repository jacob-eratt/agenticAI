import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, VStack, HStack, List, ListItem, Icon } from '@chakra-ui/react';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaBolt, FaSmog, FaQuestionCircle } from 'react-icons/fa';

/**
 * A mapping of common weather condition keywords to React-Icons components.
 * This allows for dynamic display of weather icons based on the 'icon' string provided in forecast data.
 */
const weatherIconMap = {
  sun: FaSun,
  clear: FaSun, // Clear sky
  cloud: FaCloud,
  clouds: FaCloud, // General clouds
  'partly-cloudy': FaCloud,
  rain: FaCloudRain,
  drizzle: FaCloudRain, // Light rain
  snow: FaSnowflake,
  thunderstorm: FaBolt,
  fog: FaSmog,
  mist: FaSmog,
  haze: FaSmog,
  // Default icon for unknown conditions
  unknown: FaQuestionCircle,
};

/**
 * HourlyForecastList component displays a list of hourly weather forecast entries.
 * Each entry includes time, temperature, weather condition, and an associated icon.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.forecastItems - An array of hourly forecast data objects.
 *   Each object should ideally contain:
 *   - time: string (e.g., "10:00 AM") - Required.
 *   - temperature: number (e.g., 25) - Required.
 *   - unit: string (e.g., "°C" or "°F") - Optional, defaults to an empty string if not provided.
 *   - condition: string (e.g., "Partly Cloudy") - Required.
 *   - icon: string (a keyword from `weatherIconMap`, e.g., "sun", "cloud", "rain") - Optional.
 */
export default function HourlyForecastList({ forecastItems = [] }) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      maxW={{ base: "100%", sm: "md", md: "lg" }}
      mx="auto"
      overflowY="auto" // Enable vertical scrolling for long lists
      maxH="450px" // Set a maximum height before scrolling
      aria-label="Hourly Weather Forecast"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.700">
        Hourly Forecast
      </Text>

      {forecastItems.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={4}>
          No hourly forecast data available.
        </Text>
      ) : (
        <List spacing={3}>
          {forecastItems.map((item, index) => {
            // Validate required props for each item
            if (!item.time || typeof item.temperature === 'undefined' || !item.condition) {
              console.warn(`HourlyForecastList: Missing required data for item at index ${index}. Item:`, item);
              return null; // Skip rendering incomplete items
            }

            // Determine the icon to display, defaulting to a question mark if not found
            const iconKey = item.icon ? item.icon.toLowerCase() : 'unknown';
            const WeatherIcon = weatherIconMap[iconKey] || FaQuestionCircle;

            return (
              <ListItem
                key={index} // Using index as key is acceptable for static lists where items don't change order or get added/removed frequently.
                p={3}
                borderRadius="md"
                _hover={{ bg: "gray.50" }}
                transition="background-color 0.2s"
                aria-label={`Forecast for ${item.time}: ${item.temperature}${item.unit || ''}, ${item.condition}`}
              >
                <HStack justifyContent="space-between" alignItems="center" flexWrap="wrap">
                  {/* Time */}
                  <Text
                    minW={{ base: "60px", md: "80px" }}
                    fontWeight="medium"
                    color="gray.800"
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    {item.time}
                  </Text>

                  {/* Icon and Condition */}
                  <HStack spacing={2} alignItems="center" flexGrow={1} justifyContent={{ base: "flex-start", md: "center" }}>
                    <Icon as={WeatherIcon} boxSize={{ base: 4, md: 5 }} color="blue.500" />
                    <Text color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                      {item.condition}
                    </Text>
                  </HStack>

                  {/* Temperature */}
                  <Text
                    minW={{ base: "50px", md: "60px" }}
                    textAlign="right"
                    fontWeight="bold"
                    color="blue.600"
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    {item.temperature}{item.unit || ''}
                  </Text>
                </HStack>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}

HourlyForecastList.propTypes = {
  /**
   * Array of hourly forecast data. Each item should contain:
   * - `time`: string (e.g., "10:00 AM") - Required.
   * - `temperature`: number (e.g., 25) - Required.
   * - `unit`: string (e.g., "°C" or "°F") - Optional.
   * - `condition`: string (e.g., "Partly Cloudy") - Required.
   * - `icon`: string (a keyword from `weatherIconMap`, e.g., "sun", "cloud", "rain") - Optional.
   */
  forecastItems: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      temperature: PropTypes.number.isRequired,
      unit: PropTypes.string,
      condition: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
};