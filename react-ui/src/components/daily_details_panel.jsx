import React from 'react';
import { Box, Text, Stack, HStack, Icon } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { FaThermometerHalf, FaCloudRain, FaWind, FaTint, FaCalendarAlt } from 'react-icons/fa';

/**
 * A panel component to display comprehensive weather details for a specific day.
 *
 * @param {object} props - The component props.
 * @param {string} props.temperature - Daily temperature (e.g., "25°C").
 * @param {string} props.precipitation - Daily precipitation (e.g., "10%").
 * @param {string} props.wind - Daily wind speed and direction (e.g., "15 km/h NE").
 * @param {string} props.humidity - Daily humidity (e.g., "60%").
 * @param {string} props.date - Date for the daily details (e.g., "2023-10-27").
 */
export default function DailyDetailsPanel({
  temperature,
  precipitation,
  wind,
  humidity,
  date
}) {
  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      maxW={{ base: "full", md: "md", lg: "lg" }}
      mx="auto"
      aria-labelledby="daily-details-heading"
    >
      <HStack mb={4} spacing={2} alignItems="center">
        <Icon as={FaCalendarAlt} color="blue.500" w={5} h={5} />
        <Text id="daily-details-heading" fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.700">
          {date || "Date Not Available"}
        </Text>
      </HStack>

      <Stack spacing={3}>
        <HStack justifyContent="space-between" py={1}>
          <HStack spacing={2}>
            <Icon as={FaThermometerHalf} color="red.500" w={5} h={5} />
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" color="gray.600">Temperature:</Text>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="gray.800">{temperature || "N/A"}</Text>
        </HStack>

        <HStack justifyContent="space-between" py={1}>
          <HStack spacing={2}>
            <Icon as={FaCloudRain} color="blue.400" w={5} h={5} />
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" color="gray.600">Precipitation:</Text>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="gray.800">{precipitation || "N/A"}</Text>
        </HStack>

        <HStack justifyContent="space-between" py={1}>
          <HStack spacing={2}>
            <Icon as={FaWind} color="green.500" w={5} h={5} />
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" color="gray.600">Wind:</Text>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="gray.800">{wind || "N/A"}</Text>
        </HStack>

        <HStack justifyContent="space-between" py={1}>
          <HStack spacing={2}>
            <Icon as={FaTint} color="purple.500" w={5} h={5} />
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="medium" color="gray.600">Humidity:</Text>
          </HStack>
          <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="gray.800">{humidity || "N/A"}</Text>
        </HStack>
      </Stack>
    </Box>
  );
}

DailyDetailsPanel.propTypes = {
  temperature: PropTypes.string,
  precipitation: PropTypes.string,
  wind: PropTypes.string,
  humidity: PropTypes.string,
  date: PropTypes.string
};

DailyDetailsPanel.defaultProps = {
  temperature: "N/A",
  precipitation: "N/A",
  wind: "N/A",
  humidity: "N/A",
  date: "N/A"
};