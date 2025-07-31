import React from 'react';
import { Box, Text, Stack, Flex, Icon } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaSmog } from 'react-icons/fa'; // Example icons

// Helper function to get an appropriate icon based on weather condition
const getWeatherIcon = (condition) => {
  const lowerCaseCondition = condition ? condition.toLowerCase() : '';
  if (lowerCaseCondition.includes('sun') || lowerCaseCondition.includes('clear')) {
    return FaSun;
  }
  if (lowerCaseCondition.includes('cloud')) {
    return FaCloud;
  }
  if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('drizzle')) {
    return FaCloudRain;
  }
  if (lowerCaseCondition.includes('snow')) {
    return FaSnowflake;
  }
  if (lowerCaseCondition.includes('fog') || lowerCaseCondition.includes('haze') || lowerCaseCondition.includes('smog')) {
    return FaSmog;
  }
  return FaSun; // Default icon
};

export default function DailyForecastList({ forecastItems = [] }) {
  if (!forecastItems || forecastItems.length === 0) {
    return (
      <Box p={4} borderWidth={1} borderRadius="md" borderColor="gray.200" bg="white" textAlign="center">
        <Text fontSize="md" color="gray.500">No forecast data available.</Text>
      </Box>
    );
  }

  return (
    <Stack
      spacing={4}
      p={4}
      borderWidth={1}
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      boxShadow="md"
      maxW={{ base: "100%", md: "xl", lg: "2xl" }}
      mx="auto"
      role="list"
      aria-label="Daily Weather Forecast"
    >
      {forecastItems.map((item, index) => (
        <Flex
          key={index}
          p={3}
          align="center"
          justify="space-between"
          borderWidth={1}
          borderRadius="md"
          borderColor="gray.100"
          bg="gray.50"
          _hover={{ bg: "gray.100", transform: "translateY(-2px)", boxShadow: "sm" }}
          transition="all 0.2s ease-in-out"
          flexWrap={{ base: "wrap", md: "nowrap" }}
          gap={{ base: 2, md: 0 }}
          role="listitem"
          aria-label={`${item.date}: High ${item.high}°C, Low ${item.low}°C, ${item.condition}`}
        >
          {/* Date */}
          <Box flex={{ base: "1 1 100%", md: "1" }} textAlign={{ base: "center", md: "left" }}>
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="gray.700">
              {item.date}
            </Text>
          </Box>

          {/* Weather Condition and Icon */}
          <Flex
            flex={{ base: "1 1 100%", md: "1" }}
            align="center"
            justify={{ base: "center", md: "center" }}
            gap={2}
            py={{ base: 2, md: 0 }}
          >
            <Icon as={getWeatherIcon(item.condition)} boxSize={{ base: 5, md: 6 }} color="blue.500" aria-hidden="true" />
            <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
              {item.condition}
            </Text>
          </Flex>

          {/* Temperatures */}
          <Flex
            flex={{ base: "1 1 100%", md: "1" }}
            align="center"
            justify={{ base: "center", md: "flex-end" }}
            gap={3}
          >
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="red.500">
              High: {item.high}°C
            </Text>
            <Text fontSize={{ base: "md", md: "lg" }} color="blue.500">
              Low: {item.low}°C
            </Text>
          </Flex>
        </Flex>
      ))}
    </Stack>
  );
}

DailyForecastList.propTypes = {
  /**
   * Array of daily forecast data, each item containing date, high/low temperature, and weather conditions.
   * Example item structure: { date: 'Mon, Oct 26', high: 20, low: 10, condition: 'Sunny' }
   */
  forecastItems: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      condition: PropTypes.string.isRequired,
    })
  ),
};