import React from 'react';
import {
  Box,
  Text,
  Image,
  Stack,
  Flex,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

const WeatherDisplayCard = ({
  locationName,
  temperature,
  condition,
  icon,
  precipitation,
  humidity,
  windSpeed,
  onClick
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Card
      maxW={{ base: 'full', md: 'md', lg: 'lg' }}
      minW={{ base: 'full', md: 'sm' }}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      bg={cardBg}
      color={textColor}
      p={0} // CardBody will handle padding
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      _hover={onClick ? { transform: 'translateY(-2px)', boxShadow: 'xl' } : {}}
      transition="all 0.2s ease-in-out"
      aria-label={locationName ? `Weather in ${locationName}` : "Weather information card"}
    >
      <CardBody p={6}>
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'center', sm: 'flex-start' }}
          justify="space-between"
          mb={4}
        >
          <Box textAlign={{ base: 'center', sm: 'left' }}>
            <Heading as="h2" size="lg" mb={1} color={textColor}>
              {locationName || 'Unknown Location'}
            </Heading>
            <Text fontSize="5xl" fontWeight="bold" lineHeight="1" mb={2}>
              {temperature || 'N/A'}
            </Text>
            <Text fontSize="xl" color={secondaryTextColor}>
              {condition || 'No data'}
            </Text>
          </Box>
          {icon && (
            <Image
              src={icon}
              alt={condition || 'Weather icon'}
              boxSize={{ base: '100px', sm: '120px' }}
              objectFit="contain"
              mt={{ base: 4, sm: 0 }}
              ml={{ base: 0, sm: 4 }}
            />
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={4}>
          <Box>
            <Text fontSize="sm" color={secondaryTextColor}>Precipitation</Text>
            <Text fontSize="md" fontWeight="medium">{precipitation || 'N/A'}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color={secondaryTextColor}>Humidity</Text>
            <Text fontSize="md" fontWeight="medium">{humidity || 'N/A'}</Text>
          </Box>
          <Box>
            <Text fontSize="sm" color={secondaryTextColor}>Wind</Text>
            <Text fontSize="md" fontWeight="medium">{windSpeed || 'N/A'}</Text>
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

WeatherDisplayCard.propTypes = {
  /**
   * Name of the location for the weather display.
   */
  locationName: PropTypes.string,
  /**
   * Current temperature.
   */
  temperature: PropTypes.string,
  /**
   * Current weather condition (e.g., Sunny, Cloudy).
   */
  condition: PropTypes.string,
  /**
   * Icon representing the current weather condition (e.g., URL to an image).
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
};

export default WeatherDisplayCard;