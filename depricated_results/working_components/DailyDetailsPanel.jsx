import React from 'react';
import { Box, Text, SimpleGrid, Stack, Icon, Heading } from '@chakra-ui/react';
import {
  FaThermometerHalf,
  FaCloudRain,
  FaWind,
  FaTint,
  FaCalendarAlt
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * @typedef {object} DailyDetailsPanelProps
 * @property {string} [temperature="N/A"] - Daily temperature, e.g., "25°C".
 * @property {string} [precipitation="N/A"] - Daily precipitation, e.g., "10%".
 * @property {string} [wind="N/A"] - Daily wind speed and direction, e.g., "15 km/h NE".
 * @property {string} [humidity="N/A"] - Daily humidity, e.g., "60%".
 * @property {string} [date="N/A"] - Date for the daily details, e.g., "2023-10-27".
 */

/**
 * DailyDetailsPanel component displays comprehensive weather details for a specific day.
 * It presents temperature, precipitation, wind, humidity, and the date in a clear, organized panel.
 *
 * @param {DailyDetailsPanelProps} props - The props for the DailyDetailsPanel component.
 * @returns {JSX.Element} A Chakra UI Box component acting as a panel for daily weather details.
 */
export default function DailyDetailsPanel({
  temperature = 'N/A',
  precipitation = 'N/A',
  wind = 'N/A',
  humidity = 'N/A',
  date = 'N/A',
}) {
  const detailItems = [
    { icon: FaThermometerHalf, label: 'Temperature', value: temperature, color: 'red.500' },
    { icon: FaCloudRain, label: 'Precipitation', value: precipitation, color: 'blue.500' },
    { icon: FaWind, label: 'Wind', value: wind, color: 'green.500' },
    { icon: FaTint, label: 'Humidity', value: humidity, color: 'purple.500' },
  ];

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
      maxW={{ base: '95%', md: 'md', lg: 'lg' }}
      mx="auto"
      my={4}
      aria-labelledby="daily-details-heading"
    >
      <Stack spacing={4}>
        <Heading
          as="h2"
          size="lg"
          mb={2}
          color="gray.700"
          fontWeight="bold"
          textAlign="center"
          id="daily-details-heading"
        >
          <Icon as={FaCalendarAlt} mr={2} color="teal.500" aria-hidden="true" />
          Weather Details for {date}
        </Heading>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          {detailItems.map((item, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              spacing={3}
              p={3}
              bg="gray.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{ bg: 'gray.100', borderColor: 'gray.300' }}
              transition="all 0.2s ease-in-out"
            >
              <Icon as={item.icon} boxSize={6} color={item.color} aria-hidden="true" />
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {item.label}:
                </Text>
                <Text fontSize="md" fontWeight="semibold" color="gray.800">
                  {item.value}
                </Text>
              </Box>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

DailyDetailsPanel.propTypes = {
  temperature: PropTypes.string,
  precipitation: PropTypes.string,
  wind: PropTypes.string,
  humidity: PropTypes.string,
  date: PropTypes.string,
};