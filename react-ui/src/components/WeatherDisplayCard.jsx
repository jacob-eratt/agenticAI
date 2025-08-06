import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Image,
  Stack,
  Flex,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * WeatherDisplayCard component displays various weather-related information in a card format.
 * It is designed to be visually appealing, highly customizable, and accessible.
 */
function WeatherDisplayCard({
  locationName,
  temperature,
  condition,
  icon,
  precipitation,
  humidity,
  windSpeed,
  onClick,
  // Chakra UI appearance props
  colorScheme,
  variant,
  size,
  spacing,
  padding,
  margin,
  borderRadius,
  fontSize, // General font size for detailed info
  fontWeight, // General font weight for detailed info
  background,
  maxH, // Maximum height for scrollable content
  ...rest // Allows passing through any other Chakra UI props
}) {
  const cardProps = onClick ? {
    as: 'button', // Render as a button for accessibility
    onClick: onClick,
    cursor: 'pointer',
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: 'lg',
    },
    transition: 'all 0.2s ease-in-out',
    role: 'button',
    tabIndex: 0,
  } : {};

  return (
    <Card
      maxW={{ base: 'sm', md: 'md', lg: 'lg' }}
      minW={{ base: 'xs', md: 'sm' }}
      p={padding || 4}
      m={margin || 2}
      borderRadius={borderRadius || 'lg'}
      boxShadow="md"
      bg={background || 'white'}
      colorScheme={colorScheme}
      variant={variant || 'elevated'}
      size={size}
      overflowY="auto" // Enables vertical scrolling if content exceeds maxH
      maxH={maxH} // Applies maximum height if provided
      {...cardProps}
      {...rest} // Pass any additional Chakra UI props to the Card component
    >
      <CardHeader pb={0}>
        <Heading
          size="lg"
          color="gray.800"
          fontSize={{ base: 'xl', md: '2xl' }} // Specific font size for the location name
          fontWeight="bold" // Specific font weight for the location name
        >
          {locationName}
        </Heading>
      </CardHeader>

      <CardBody pt={2}>
        <Flex
          alignItems="center"
          justifyContent="space-between"
          flexDirection={{ base: 'column', md: 'row' }}
          gap={spacing || 4}
        >
          <Flex alignItems="center" gap={2}>
            {icon && (
              <Image
                src={icon}
                alt={condition ? `${condition} icon` : 'Weather icon'}
                boxSize={{ base: '60px', md: '80px' }}
                objectFit="contain"
              />
            )}
            <Text
              fontSize={{ base: '5xl', md: '6xl' }} // Specific font size for the temperature
              fontWeight="bold" // Specific font weight for the temperature
              color="blue.600"
            >
              {temperature}
            </Text>
          </Flex>

          <Stack spacing={spacing || 1} textAlign={{ base: 'center', md: 'right' }}>
            <Text fontSize={fontSize || { base: 'lg', md: 'xl' }} fontWeight={fontWeight || 'normal'} color="gray.700">
              {condition}
            </Text>
            {precipitation && (
              <Text fontSize={fontSize || { base: 'md', md: 'lg' }} fontWeight={fontWeight || 'normal'} color="gray.600">
                Precipitation: {precipitation}
              </Text>
            )}
            {humidity && (
              <Text fontSize={fontSize || { base: 'md', md: 'lg' }} fontWeight={fontWeight || 'normal'} color="gray.600">
                Humidity: {humidity}
              </Text>
            )}
            {windSpeed && (
              <Text fontSize={fontSize || { base: 'md', md: 'lg' }} fontWeight={fontWeight || 'normal'} color="gray.600">
                Wind: {windSpeed}
              </Text>
            )}
          </Stack>
        </Flex>
      </CardBody>
    </Card>
  );
}

WeatherDisplayCard.propTypes = {
  /**
   * Name of the location for the weather display.
   */
  locationName: PropTypes.string.isRequired,
  /**
   * Current temperature.
   */
  temperature: PropTypes.string.isRequired,
  /**
   * Current weather condition (e.g., Sunny, Cloudy).
   */
  condition: PropTypes.string,
  /**
   * Icon representing the current weather condition (URL).
   */
  icon: PropTypes.string,
  /**
   * Precipitation information.
   */
  precipitation: PropTypes.string,
  /**
   * Humidity percentage.
   */
  humidity: PropTypes.string,
  /**
   * Wind speed and direction.
   */
  windSpeed: PropTypes.string,
  /**
   * Callback function when the card is clicked.
   */
  onClick: PropTypes.func,
  /**
   * Chakra UI color scheme.
   */
  colorScheme: PropTypes.string,
  /**
   * Chakra UI variant.
   */
  variant: PropTypes.string,
  /**
   * Chakra UI size.
   */
  size: PropTypes.string,
  /**
   * Spacing between elements within the card.
   */
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Padding of the card.
   */
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Margin of the card.
   */
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Border radius of the card.
   */
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * General font size for detailed information text (condition, precipitation, humidity, wind).
   */
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * General font weight for detailed information text (condition, precipitation, humidity, wind).
   */
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Background color of the card.
   */
  background: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /**
   * Maximum height of the card, enabling scrolling if content exceeds.
   */
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
};

WeatherDisplayCard.defaultProps = {
  condition: '',
  icon: '',
  precipitation: '',
  humidity: '',
  windSpeed: '',
  onClick: undefined,
  colorScheme: 'blue',
  variant: 'elevated',
  size: 'md',
  spacing: 4,
  padding: 4,
  margin: 2,
  borderRadius: 'lg',
  fontSize: { base: 'md', md: 'lg' }, // Default for general text
  fontWeight: 'normal', // Default for general text
  background: 'white',
  maxH: undefined, // No default maximum height
};

export default WeatherDisplayCard;