import React from 'react';
import { Box, Text, VStack, HStack, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} DailyForecastItem
 * @property {string} date - The formatted date for the forecast (e.g., "Mon, Oct 26").
 * @property {number} highTemp - The high temperature for the day.
 * @property {number} lowTemp - The low temperature for the day.
 * @property {string} condition - A brief description of the weather condition (e.g., "Sunny", "Partly Cloudy").
 * @property {string} [iconUrl] - Optional URL to an icon representing the weather condition.
 */

/**
 * DailyForecastList component displays a list of daily weather forecast entries.
 * Each entry shows the date, weather condition, an optional icon, and high/low temperatures.
 *
 * @param {object} props - The component props.
 * @param {DailyForecastItem[]} [props.forecastItems=[]] - Array of daily forecast data. Each item should contain `date`, `highTemp`, `lowTemp`, `condition`, and optionally `iconUrl`.
 */
export default function DailyForecastList({ forecastItems = [] }) {
  if (!forecastItems || forecastItems.length === 0) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        textAlign="center"
        color="gray.500"
        boxShadow="sm"
        maxW={{ base: "100%", md: "xl", lg: "2xl" }}
        mx="auto"
      >
        <Text fontSize="md">No daily forecast available.</Text>
      </Box>
    );
  }

  return (
    <VStack
      spacing={4}
      align="stretch"
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      boxShadow="md"
      maxW={{ base: "100%", md: "xl", lg: "2xl" }}
      mx="auto"
      aria-label="Daily weather forecast"
    >
      {forecastItems.map((item, index) => (
        <HStack
          key={index} // Using index as key is acceptable for static lists where items don't change order or get added/removed frequently. A unique ID from data is preferred if available.
          spacing={{ base: 2, md: 4 }}
          p={3}
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.200"
          _hover={{ bg: "gray.50", borderColor: "blue.200" }}
          align="center"
          justify="space-between"
          flexWrap="wrap" // Allows items to wrap on smaller screens
          role="listitem"
          aria-label={`Forecast for ${item.date}: ${item.condition}, High ${item.highTemp} degrees, Low ${item.lowTemp} degrees`}
        >
          {/* Date */}
          <Text
            flexShrink={0}
            minW="80px"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            color="gray.700"
          >
            {item.date}
          </Text>

          {/* Icon and Condition */}
          <HStack spacing={2} flexGrow={1} justify={{ base: "flex-start", md: "center" }} minW={{ base: "120px", md: "auto" }}>
            {item.iconUrl && (
              <Image
                src={item.iconUrl}
                alt={item.condition || "Weather icon"}
                boxSize={{ base: "30px", md: "40px" }}
                objectFit="contain"
                aria-hidden="true" // Icon is decorative, condition text provides context
              />
            )}
            <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
              {item.condition}
            </Text>
          </HStack>

          {/* Temperatures */}
          <HStack spacing={1} flexShrink={0} minW="80px" justify="flex-end">
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="blue.600">
              {item.highTemp}°
            </Text>
            <Text fontSize={{ base: "sm", md: "md" }} color="gray.500">
              / {item.lowTemp}°
            </Text>
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
}

DailyForecastList.propTypes = {
  forecastItems: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      highTemp: PropTypes.number.isRequired,
      lowTemp: PropTypes.number.isRequired,
      condition: PropTypes.string.isRequired,
      iconUrl: PropTypes.string, // iconUrl is optional
    })
  ),
};