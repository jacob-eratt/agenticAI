import React from 'react';
import { Box, Text, Stack, HStack, Divider } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * HourlyForecastList component displays a list of hourly weather forecast entries.
 * Each entry includes time, temperature, and weather conditions.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.forecastItems - An array of hourly forecast data.
 *   Each item should be an object with `time` (string), `temperature` (string),
 *   and `description` (string) properties.
 * @param {string} [props.colorScheme='blue'] - The color scheme for the component, influencing text colors.
 * @param {string} [props.variant='outline'] - The visual variant of the container. 'outline' adds a border.
 * @param {string} [props.size='md'] - The general size of the component, influencing internal text sizes.
 * @param {string|number} [props.spacing='4'] - The spacing between individual forecast items in the list.
 * @param {string|number} [props.padding='4'] - The padding around the entire list container.
 * @param {string|number} [props.margin='0'] - The margin around the entire list container.
 * @param {string|number} [props.borderRadius='md'] - The border radius of the container.
 * @param {string} [props.background='white'] - The background color of the container.
 * @param {string|number} [props.maxH='300px'] - The maximum height of the list, enabling vertical scrolling if content exceeds this height.
 * @param {string} [props.emptyMessage='No hourly forecast data available.'] - Message to display when no forecast items are present.
 */
function HourlyForecastList({
  forecastItems = [],
  colorScheme = 'blue',
  variant = 'outline',
  size = 'md',
  spacing = '4',
  padding = '4',
  margin = '0',
  borderRadius = 'md',
  background = 'white',
  maxH = '300px',
  emptyMessage = 'No hourly forecast data available.',
  ...rest
}) {
  // Determine font sizes based on the 'size' prop
  const itemFontSize = { base: 'sm', md: size === 'lg' ? 'md' : 'sm' };
  const itemTempFontSize = { base: 'md', md: size === 'lg' ? 'lg' : 'md' };

  return (
    <Box
      borderWidth={variant === 'outline' ? '1px' : '0'}
      borderColor={variant === 'outline' ? `${colorScheme}.200` : 'transparent'}
      borderRadius={borderRadius}
      p={padding}
      m={margin}
      bg={background}
      overflowY="auto"
      maxH={maxH}
      boxShadow="sm"
      aria-live="polite" // Announce changes to screen readers if content updates
      {...rest}
    >
      {forecastItems.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={4}>
          {emptyMessage}
        </Text>
      ) : (
        <Stack spacing={spacing} divider={<Divider borderColor="gray.200" />}>
          {forecastItems.map((item, index) => (
            <HStack key={index} justifyContent="space-between" alignItems="center" py={1}>
              <Text flex="1" fontWeight="semibold" fontSize={itemFontSize} color="gray.700">
                {item.time}
              </Text>
              <Text flex="1" textAlign="center" fontWeight="bold" fontSize={itemTempFontSize} color={`${colorScheme}.600`}>
                {item.temperature}
              </Text>
              <Text flex="1" textAlign="right" fontSize={itemFontSize} color="gray.600">
                {item.description}
              </Text>
            </HStack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

HourlyForecastList.propTypes = {
  /**
   * An array of hourly forecast data. Each item should be an object with `time` (string),
   * `temperature` (string), and `description` (string) properties.
   */
  forecastItems: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      temperature: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ),
  /**
   * The color scheme for the component, influencing text colors.
   */
  colorScheme: PropTypes.string,
  /**
   * The visual variant of the container. 'outline' adds a border.
   */
  variant: PropTypes.string,
  /**
   * The general size of the component, influencing internal text sizes.
   */
  size: PropTypes.string,
  /**
   * The spacing between individual forecast items in the list.
   */
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The padding around the entire list container.
   */
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The margin around the entire list container.
   */
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The border radius of the container.
   */
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The background color of the container.
   */
  background: PropTypes.string,
  /**
   * The maximum height of the list, enabling vertical scrolling if content exceeds this height.
   */
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * Message to display when no forecast items are present.
   */
  emptyMessage: PropTypes.string,
};

export default HourlyForecastList;