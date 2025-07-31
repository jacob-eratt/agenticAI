import React from 'react';
import { Box, VStack, HStack, Text, Divider } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A list component to display hourly weather forecast entries.
 * Each entry shows time, weather condition, and temperature.
 */
export default function HourlyForecastList({ forecastItems = [] }) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="white"
      boxShadow="md"
      maxW={{ base: "100%", md: "md", lg: "lg" }}
      mx="auto"
      aria-live="polite" // Announce changes to screen readers if content updates
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.700">
        Hourly Forecast
      </Text>

      {forecastItems.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={4}>
          No hourly forecast data available.
        </Text>
      ) : (
        <VStack spacing={0} align="stretch" maxH="500px" overflowY="auto">
          {forecastItems.map((item, index) => (
            <React.Fragment key={index}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                py={3}
                px={2}
                _hover={{ bg: "gray.50" }}
                transition="background-color 0.2s"
                role="listitem" // Explicitly define role for list item
              >
                <Text
                  fontWeight="semibold"
                  fontSize={{ base: "md", md: "lg" }}
                  color="gray.800"
                  minW="80px" // Ensure time column has minimum width
                >
                  {item.time}
                </Text>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color="gray.600"
                  flex="1"
                  textAlign="center"
                >
                  {item.condition}
                </Text>
                <Text
                  fontWeight="bold"
                  fontSize={{ base: "lg", md: "xl" }}
                  color="blue.600"
                  minW="60px" // Ensure temperature column has minimum width
                  textAlign="right"
                >
                  {item.temperature}
                </Text>
              </HStack>
              {index < forecastItems.length - 1 && <Divider borderColor="gray.200" />}
            </React.Fragment>
          ))}
        </VStack>
      )}
    </Box>
  );
}

HourlyForecastList.propTypes = {
  /**
   * Array of hourly forecast data, each item containing time, temperature, and weather conditions.
   * Each item should be an object with `time` (string), `temperature` (string), and `condition` (string).
   */
  forecastItems: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      temperature: PropTypes.string.isRequired,
      condition: PropTypes.string.isRequired,
    })
  ),
};