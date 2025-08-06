import React from 'react';
import { Box, Text, Stack, SimpleGrid, Icon } from '@chakra-ui/react';
import {
  FaThermometerHalf,
  FaCloudRain,
  FaWind,
  FaTint,
  FaCalendarAlt
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * DailyDetailsPanel component displays comprehensive weather details for a specific day.
 * It presents information such as temperature, precipitation, wind, humidity, and the date
 * in a visually appealing and organized panel.
 *
 * @param {object} props - The component props.
 * @param {string} props.temperature - Daily temperature, e.g., "25°C".
 * @param {string} props.precipitation - Daily precipitation, e.g., "10%".
 * @param {string} props.wind - Daily wind speed and direction, e.g., "15 km/h NE".
 * @param {string} props.humidity - Daily humidity, e.g., "60%".
 * @param {string} props.date - Date for the daily details, e.g., "2023-10-27".
 * @param {string} [props.colorScheme='blue'] - The color scheme for the panel.
 * @param {string} [props.variant='elevated'] - The visual variant of the panel (e.g., 'elevated', 'outline').
 * @param {string} [props.size='md'] - The size of the panel (e.g., 'sm', 'md', 'lg').
 * @param {string} [props.borderRadius='lg'] - The border radius of the panel.
 * @param {string} [props.background='white'] - The background color of the panel.
 * @param {string} [props.textColor='gray.800'] - The default text color.
 * @param {object} [props.sx] - Custom style properties for the Box component.
 */
export default function DailyDetailsPanel({
  temperature,
  precipitation,
  wind,
  humidity,
  date,
  colorScheme = 'blue',
  variant = 'elevated',
  size = 'md',
  borderRadius = 'lg',
  background = 'white',
  textColor = 'gray.800',
  sx,
  ...rest
}) {
  const panelPadding = { base: 4, md: 6 };
  const fontSize = { base: 'md', md: 'lg' };
  const iconSize = { base: '1.2em', md: '1.5em' };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          borderWidth: '1px',
          borderColor: `${colorScheme}.200`,
          bg: 'transparent',
          boxShadow: 'none',
        };
      case 'filled':
        return {
          bg: `${colorScheme}.50`,
          borderWidth: '1px',
          borderColor: `${colorScheme}.100`,
          boxShadow: 'none',
        };
      case 'elevated':
      default:
        return {
          bg: background,
          boxShadow: 'lg',
          borderWidth: '1px',
          borderColor: 'gray.100',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Box
      p={panelPadding}
      borderRadius={borderRadius}
      color={textColor}
      overflowY="auto"
      maxH="fit-content"
      {...variantStyles}
      sx={sx}
      {...rest}
    >
      <Stack spacing={4}>
        {/* Date */}
        <Text
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="bold"
          color={`${colorScheme}.600`}
          pb={2}
          borderBottom="1px solid"
          borderColor="gray.200"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaCalendarAlt} mr={2} color={`${colorScheme}.500`} />
          {date}
        </Text>

        {/* Details Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          {/* Temperature */}
          <Stack direction="row" align="center" spacing={2}>
            <Icon as={FaThermometerHalf} boxSize={iconSize} color={`${colorScheme}.500`} />
            <Text fontSize={fontSize} fontWeight="medium">
              Temperature: <Text as="span" fontWeight="semibold">{temperature}</Text>
            </Text>
          </Stack>

          {/* Precipitation */}
          <Stack direction="row" align="center" spacing={2}>
            <Icon as={FaCloudRain} boxSize={iconSize} color={`${colorScheme}.500`} />
            <Text fontSize={fontSize} fontWeight="medium">
              Precipitation: <Text as="span" fontWeight="semibold">{precipitation}</Text>
            </Text>
          </Stack>

          {/* Wind */}
          <Stack direction="row" align="center" spacing={2}>
            <Icon as={FaWind} boxSize={iconSize} color={`${colorScheme}.500`} />
            <Text fontSize={fontSize} fontWeight="medium">
              Wind: <Text as="span" fontWeight="semibold">{wind}</Text>
            </Text>
          </Stack>

          {/* Humidity */}
          <Stack direction="row" align="center" spacing={2}>
            <Icon as={FaTint} boxSize={iconSize} color={`${colorScheme}.500`} />
            <Text fontSize={fontSize} fontWeight="medium">
              Humidity: <Text as="span" fontWeight="semibold">{humidity}</Text>
            </Text>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

DailyDetailsPanel.propTypes = {
  /**
   * Daily temperature, e.g., "25°C".
   */
  temperature: PropTypes.string.isRequired,
  /**
   * Daily precipitation, e.g., "10%".
   */
  precipitation: PropTypes.string.isRequired,
  /**
   * Daily wind speed and direction, e.g., "15 km/h NE".
   */
  wind: PropTypes.string.isRequired,
  /**
   * Daily humidity, e.g., "60%".
   */
  humidity: PropTypes.string.isRequired,
  /**
   * Date for the daily details, e.g., "2023-10-27".
   */
  date: PropTypes.string.isRequired,
  /**
   * The color scheme for the panel.
   */
  colorScheme: PropTypes.string,
  /**
   * The visual variant of the panel (e.g., 'elevated', 'outline', 'filled').
   */
  variant: PropTypes.oneOf(['elevated', 'outline', 'filled']),
  /**
   * The size of the panel (e.g., 'sm', 'md', 'lg'). Note: This prop primarily influences padding and font sizes.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * The border radius of the panel.
   */
  borderRadius: PropTypes.string,
  /**
   * The background color of the panel. Only applies to 'elevated' variant.
   */
  background: PropTypes.string,
  /**
   * The default text color.
   */
  textColor: PropTypes.string,
  /**
   * Custom style properties for the Box component.
   */
  sx: PropTypes.object,
};