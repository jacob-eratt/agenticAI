import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Renders a panel displaying historical weather data for a selected location.
 * Each data point includes date, temperature, humidity, and wind speed.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.data - An array of historical weather data points.
 *   Each object should ideally contain:
 *   - `date`: string (e.g., "2023-10-26")
 *   - `temperature`: number (e.g., 25)
 *   - `humidity`: number (e.g., 70)
 *   - `windSpeed`: number (e.g., 15)
 *   - `tempChange`: number (optional, for StatArrow direction, e.g., -2 for a drop)
 * @param {string} props.location - The name of the location for which data is displayed.
 * @param {string} [props.colorScheme='blue'] - The color scheme for the panel elements.
 * @param {string} [props.variant='elevated'] - The variant style for the panel (e.g., 'elevated', 'outline').
 * @param {string} [props.size='md'] - The size of the panel (e.g., 'sm', 'md', 'lg').
 * @param {string} [props.borderRadius='lg'] - The border radius of the panel.
 * @param {string} [props.maxH='500px'] - The maximum height of the scrollable content area.
 * @param {string} [props.fontSize='md'] - Base font size for text within the panel.
 */
function HistoricalDataPanel({
  data = [],
  location = 'Unknown Location',
  colorScheme = 'blue',
  variant = 'elevated',
  size = 'md',
  borderRadius = 'lg',
  maxH = '500px',
  fontSize = 'md',
  ...rest
}) {
  const panelBg = useColorModeValue('white', 'gray.700');
  const panelBorderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');

  const getVariantProps = () => {
    switch (variant) {
      case 'outline':
        return { borderWidth: '1px', borderColor: panelBorderColor, bg: 'transparent' };
      case 'filled':
        return { bg: useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`) };
      case 'elevated':
      default:
        return { boxShadow: 'lg', bg: panelBg };
    }
  };

  const getSizeProps = () => {
    switch (size) {
      case 'sm':
        return { p: 3, fontSize: 'sm' };
      case 'lg':
        return { p: 6, fontSize: 'lg' };
      case 'md':
      default:
        return { p: 4, fontSize: 'md' };
    }
  };

  return (
    <Box
      borderRadius={borderRadius}
      {...getVariantProps()}
      {...getSizeProps()}
      {...rest}
      width="100%"
      maxW={{ base: '100%', md: 'xl', lg: '2xl' }}
      mx="auto"
      overflow="hidden"
    >
      <Heading as="h2" size={size === 'sm' ? 'md' : 'lg'} mb={4} color={headingColor}>
        Historical Data for{' '}
        <Text as="span" color={`${colorScheme}.500`}>
          {location}
        </Text>
      </Heading>

      <Divider mb={4} />

      {data.length === 0 ? (
        <Text color={textColor} fontSize={fontSize} textAlign="center" py={8}>
          No historical data available for {location}.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch" maxH={maxH} overflowY="auto" pr={2}>
          {data.map((item, index) => (
            <Box
              key={index}
              p={3}
              borderRadius="md"
              bg={useColorModeValue('gray.50', 'gray.800')}
              boxShadow="sm"
              _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
              transition="all 0.2s ease-in-out"
            >
              <HStack justifyContent="space-between" mb={2}>
                <Text fontWeight="bold" fontSize={fontSize} color={textColor}>
                  {item.date}
                </Text>
                <Badge colorScheme={colorScheme} variant="solid" px={2} py={1} borderRadius="full">
                  Day {index + 1}
                </Badge>
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                <Stat>
                  <StatLabel fontSize="sm" color={textColor}>
                    Temperature
                  </StatLabel>
                  <StatNumber fontSize={fontSize} color={textColor}>
                    {item.temperature}°C
                  </StatNumber>
                  {item.tempChange !== undefined && (
                    <StatHelpText fontSize="xs" color={textColor}>
                      <StatArrow type={item.tempChange >= 0 ? 'increase' : 'decrease'} />
                      {Math.abs(item.tempChange)}°C
                    </StatHelpText>
                  )}
                </Stat>
                <Stat>
                  <StatLabel fontSize="sm" color={textColor}>
                    Humidity
                  </StatLabel>
                  <StatNumber fontSize={fontSize} color={textColor}>
                    {item.humidity}%
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel fontSize="sm" color={textColor}>
                    Wind Speed
                  </StatLabel>
                  <StatNumber fontSize={fontSize} color={textColor}>
                    {item.windSpeed} km/h
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

HistoricalDataPanel.propTypes = {
  /**
   * An array of historical weather data points.
   * Each object should ideally contain:
   * - `date`: string (e.g., "2023-10-26")
   * - `temperature`: number (e.g., 25)
   * - `humidity`: number (e.g., 70)
   * - `windSpeed`: number (e.g., 15)
   * - `tempChange`: number (optional, for StatArrow direction, e.g., -2 for a drop)
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      temperature: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
      windSpeed: PropTypes.number.isRequired,
      tempChange: PropTypes.number, // Optional, for showing change
    })
  ),
  /**
   * The name of the location for which data is displayed.
   */
  location: PropTypes.string,
  /**
   * The color scheme for the panel elements.
   */
  colorScheme: PropTypes.string,
  /**
   * The variant style for the panel (e.g., 'elevated', 'outline', 'filled').
   */
  variant: PropTypes.oneOf(['elevated', 'outline', 'filled']),
  /**
   * The size of the panel (e.g., 'sm', 'md', 'lg').
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * The border radius of the panel.
   */
  borderRadius: PropTypes.string,
  /**
   * The maximum height of the scrollable content area.
   */
  maxH: PropTypes.string,
  /**
   * Base font size for text within the panel.
   */
  fontSize: PropTypes.string,
};

export default React.memo(HistoricalDataPanel);