import React from 'react';
import { Box, Text, Image, Stack, Flex, Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} WeatherDisplayCardProps
 * @property {string} [locationName] - Name of the location for the weather display.
 * @property {string} [temperature] - Current temperature (e.g., "25°C").
 * @property {string} [condition] - Current weather condition (e.g., "Sunny", "Cloudy").
 * @property {string} [icon] - URL or path to the icon representing the current weather condition.
 * @property {string} [precipitation] - Precipitation information (e.g., "10% chance").
 * @property {string} [humidity] - Humidity percentage (e.g., "75%").
 * @property {string} [windSpeed] - Wind speed and direction (e.g., "15 km/h NW").
 * @property {function} [onClick] - Callback function when the card is clicked.
 */

/**
 * WeatherDisplayCard component to display various weather-related information.
 * It provides a visually appealing and customizable card layout for weather data.
 *
 * @param {WeatherDisplayCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered WeatherDisplayCard component.
 */
export default function WeatherDisplayCard({
  locationName,
  temperature,
  condition,
  icon,
  precipitation,
  humidity,
  windSpeed,
  onClick,
}) {
  const isClickable = typeof onClick === 'function';

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      boxShadow="md"
      maxW={{ base: "95%", sm: "md", lg: "lg" }}
      mx="auto"
      textAlign="center"
      transition="all 0.2s ease-in-out"
      {...(isClickable && {
        cursor: 'pointer',
        _hover: {
          boxShadow: 'lg',
          transform: 'translateY(-2px)',
        },
        onClick: onClick,
        role: 'button',
        tabIndex: 0,
        onKeyPress: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        },
      })}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        mb={4}
      >
        <Box flex="1" textAlign={{ base: "center", md: "left" }}>
          {locationName && (
            <Heading as="h2" size="lg" mb={1} color="gray.800">
              {locationName}
            </Heading>
          )}
          {condition && (
            <Text fontSize="md" color="gray.600">
              {condition}
            </Text>
          )}
        </Box>

        <Flex align="center" justify="center" mt={{ base: 4, md: 0 }} ml={{ md: 4 }}>
          {icon && (
            <Image
              src={icon}
              alt={condition ? `${condition} weather icon` : "Weather icon"}
              boxSize={{ base: "60px", md: "80px" }}
              objectFit="contain"
              mr={temperature ? 4 : 0}
            />
          )}
          {temperature && (
            <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="bold" color="blue.600">
              {temperature}
            </Text>
          )}
        </Flex>
      </Flex>

      <Stack
        direction={{ base: "column", sm: "row" }}
        spacing={{ base: 2, sm: 4 }}
        justify="space-around"
        mt={4}
        pt={4}
        borderTop="1px solid"
        borderColor="gray.200"
      >
        {precipitation && (
          <Flex align="center" justify="center" direction="column">
            <Text fontSize="sm" color="gray.500">Precipitation</Text>
            <Text fontSize="md" fontWeight="medium" color="gray.700">{precipitation}</Text>
          </Flex>
        )}
        {humidity && (
          <Flex align="center" justify="center" direction="column">
            <Text fontSize="sm" color="gray.500">Humidity</Text>
            <Text fontSize="md" fontWeight="medium" color="gray.700">{humidity}</Text>
          </Flex>
        )}
        {windSpeed && (
          <Flex align="center" justify="center" direction="column">
            <Text fontSize="sm" color="gray.500">Wind</Text>
            <Text fontSize="md" fontWeight="medium" color="gray.700">{windSpeed}</Text>
          </Flex>
        )}
      </Stack>
    </Box>
  );
}

WeatherDisplayCard.propTypes = {
  /**
   * Name of the location for the weather display.
   */
  locationName: PropTypes.string,
  /**
   * Current temperature (e.g., "25°C").
   */
  temperature: PropTypes.string,
  /**
   * Current weather condition (e.g., "Sunny", "Cloudy").
   */
  condition: PropTypes.string,
  /**
   * URL or path to the icon representing the current weather condition.
   */
  icon: PropTypes.string,
  /**
   * Precipitation information (e.g., "10% chance").
   */
  precipitation: PropTypes.string,
  /**
   * Humidity percentage (e.g., "75%").
   */
  humidity: PropTypes.string,
  /**
   * Wind speed and direction (e.g., "15 km/h NW").
   */
  windSpeed: PropTypes.string,
  /**
   * Callback function when the card is clicked.
   */
  onClick: PropTypes.func,
};