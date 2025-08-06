import React from 'react';
import { Box, List, ListItem, Text, Flex, Icon } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {
  FaSun,
  FaCloud,
  FaCloudSun,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
  FaSmog,
  FaQuestionCircle // Default icon for unknown conditions
} from 'react-icons/fa';

/**
 * Maps weather condition strings to corresponding React-Icons components.
 * @type {Object.<string, React.ComponentType>}
 */
const weatherIcons = {
  Sunny: FaSun,
  Cloudy: FaCloud,
  'Partly Cloudy': FaCloudSun,
  Rainy: FaCloudRain,
  Snowy: FaSnowflake,
  Thunderstorm: FaBolt,
  Foggy: FaSmog,
  default: FaQuestionCircle
};

/**
 * Helper function to get the appropriate weather icon component based on condition.
 * @param {string} condition - The weather condition string (e.g., "Sunny", "Cloudy").
 * @returns {JSX.Element} A Chakra UI Icon component.
 */
const getWeatherIcon = (condition) => {
  const IconComponent = weatherIcons[condition] || weatherIcons.default;
  return <Icon as={IconComponent} boxSize={6} color="gray.500" />;
};

/**
 * Default appearance props for the DailyForecastList component.
 */
const defaultAppearanceProps = {
  colorScheme: 'blue',
  size: 'md',
  spacing: 4,
  p: 4,
  m: 0,
  borderRadius: 'md',
  bg: 'white',
  boxShadow: 'md'
};

/**
 * Size-specific adjustments for font sizes, icon sizes, and padding.
 */
const sizeProps = {
  sm: {
    fontSize: 'sm',
    iconSize: 4,
    itemPaddingY: 2,
    itemSpacing: 2
  },
  md: {
    fontSize: 'md',
    iconSize: 6,
    itemPaddingY: 3,
    itemSpacing: 3
  },
  lg: {
    fontSize: 'lg',
    iconSize: 8,
    itemPaddingY: 4,
    itemSpacing: 4
  }
};

/**
 * DailyForecastList component displays a list of daily weather forecast entries.
 * It is visually appealing, highly customizable, accessible, and easy to integrate.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.forecastItems - Array of daily forecast data. Each item should contain:
 *   - `id` (string, unique identifier, optional but recommended for React keys)
 *   - `date` (string, e.g., "Monday", "Tomorrow")
 *   - `tempHigh` (number, high temperature)
 *   - `tempLow` (number, low temperature)
 *   - `condition` (string, e.g., "Sunny", "Cloudy", "Rainy")
 * @param {string} [props.colorScheme='blue'] - The color scheme for the component. Influences text colors.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - The size of the component, affecting padding and font sizes.
 * @param {string|number|object} [props.spacing=4] - Spacing between list items.
 * @param {string|number|object} [props.p=4] - Padding around the entire list container.
 * @param {string|number|object} [props.m=0] - Margin around the entire list container.
 * @param {string|number|object} [props.borderRadius='md'] - Border radius of the list container.
 * @param {string|object} [props.bg='white'] - Background color of the list container.
 * @param {string} [props.boxShadow='md'] - Box shadow of the list container.
 * @param {object} [rest] - Additional Chakra UI props to apply to the main container Box.
 * @returns {JSX.Element} A React functional component.
 */
export default function DailyForecastList({
  forecastItems,
  colorScheme = defaultAppearanceProps.colorScheme,
  size = defaultAppearanceProps.size,
  spacing = defaultAppearanceProps.spacing,
  p = defaultAppearanceProps.p,
  m = defaultAppearanceProps.m,
  borderRadius = defaultAppearanceProps.borderRadius,
  bg = defaultAppearanceProps.bg,
  boxShadow = defaultAppearanceProps.boxShadow,
  ...rest
}) {
  const currentSizeProps = sizeProps[size];

  return (
    <Box
      p={p}
      m={m}
      borderRadius={borderRadius}
      bg={bg}
      boxShadow={boxShadow}
      overflowY="auto"
      maxH="500px" // Default max height for scrollable content
      {...rest}
    >
      {forecastItems.length === 0 ? (
        <Text textAlign="center" color="gray.500" py={4}>
          No forecast data available.
        </Text>
      ) : (
        <List spacing={spacing}>
          {forecastItems.map((item, index) => (
            <ListItem
              key={item.id || index} // Use unique ID if available, otherwise index
              py={currentSizeProps.itemPaddingY}
              px={currentSizeProps.itemPaddingY + 1} // Slightly more horizontal padding
              _notLast={{ borderBottom: '1px solid', borderColor: 'gray.200' }}
            >
              <Flex
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap" // Allow wrapping on smaller screens
              >
                {/* Date */}
                <Text
                  flex="1"
                  minW={{ base: '100%', md: '80px' }} // Full width on small, fixed on md+
                  fontWeight="semibold"
                  fontSize={currentSizeProps.fontSize}
                  color={`${colorScheme}.600`}
                  mb={{ base: 2, md: 0 }} // Margin bottom on small screens
                >
                  {item.date}
                </Text>

                {/* Condition Icon and Text */}
                <Flex
                  alignItems="center"
                  flex="1"
                  minW={{ base: '100%', md: '120px' }} // Full width on small, fixed on md+
                  justifyContent={{ base: 'flex-start', md: 'center' }}
                  mb={{ base: 2, md: 0 }} // Margin bottom on small screens
                >
                  {getWeatherIcon(item.condition)}
                  <Text ml={2} fontSize={currentSizeProps.fontSize} color="gray.700">
                    {item.condition}
                  </Text>
                </Flex>

                {/* Temperatures */}
                <Flex
                  alignItems="center"
                  flex="1"
                  minW={{ base: '100%', md: '100px' }} // Full width on small, fixed on md+
                  justifyContent="flex-end"
                >
                  <Text
                    fontWeight="bold"
                    fontSize={currentSizeProps.fontSize}
                    color={`${colorScheme}.700`}
                  >
                    {item.tempHigh}°
                  </Text>
                  <Text
                    ml={2}
                    fontSize={currentSizeProps.fontSize}
                    color="gray.500"
                  >
                    {item.tempLow}°
                  </Text>
                </Flex>
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

DailyForecastList.propTypes = {
  /**
   * Array of daily forecast data. Each item should have:
   * - `id` (string, unique identifier, optional but recommended for keys)
   * - `date` (string, e.g., "Monday", "Tomorrow")
   * - `tempHigh` (number, high temperature)
   * - `tempLow` (number, low temperature)
   * - `condition` (string, e.g., "Sunny", "Cloudy", "Rainy")
   */
  forecastItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.string.isRequired,
      tempHigh: PropTypes.number.isRequired,
      tempLow: PropTypes.number.isRequired,
      condition: PropTypes.string.isRequired,
    })
  ).isRequired,
  /**
   * The color scheme for the component. Influences background and text colors.
   */
  colorScheme: PropTypes.string,
  /**
   * The size of the component, affecting padding and font sizes.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * Spacing between list items.
   */
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Padding around the entire list container.
   */
  p: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Margin around the entire list container.
   */
  m: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Border radius of the list container.
   */
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Background color of the list container.
   */
  bg: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /**
   * Box shadow of the list container.
   */
  boxShadow: PropTypes.string,
};