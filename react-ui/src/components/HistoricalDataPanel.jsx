import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertDescription,
  Stack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} HistoricalDataItem
 * @property {string} date - The date of the historical data point (e.g., "2023-10-26").
 * @property {number} temperature - The temperature at that date (e.g., 25).
 * @property {number} humidity - The humidity percentage (e.g., 70).
 * @property {number} windSpeed - The wind speed (e.g., 15).
 * @property {string} condition - The weather condition (e.g., "Sunny").
 */

/**
 * HistoricalDataPanel component displays historical weather data for a selected location.
 * It presents the data in a scrollable table format, providing clear headings and
 * informative messages for missing data or location selection.
 *
 * @param {object} props - The component props.
 * @param {Array<HistoricalDataItem>} [props.data=[]] - Array of historical weather data points.
 *   Each item should include `date`, `temperature`, `humidity`, `windSpeed`, and `condition`.
 * @param {string} [props.location=''] - The name of the location for which data is displayed.
 */
export default function HistoricalDataPanel({ data = [], location = '' }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      bg="white"
      p={4}
      width="100%"
      maxW={{ base: "100%", md: "xl", lg: "2xl" }}
      mx="auto"
      my={4}
      aria-labelledby="historical-data-heading"
    >
      <CardHeader pb={2}>
        <Heading as="h2" size="lg" color="teal.600" id="historical-data-heading">
          Historical Weather Data
          {location && (
            <Text as="span" fontSize="md" fontWeight="normal" ml={2} color="gray.600">
              for {location}
            </Text>
          )}
        </Heading>
      </CardHeader>

      <CardBody pt={2}>
        {!location && (
          <Alert status="info" variant="left-accent" mb={4}>
            <AlertIcon />
            <AlertDescription>Please select a location to view historical data.</AlertDescription>
          </Alert>
        )}

        {location && !hasData && (
          <Alert status="info" variant="left-accent" mb={4}>
            <AlertIcon />
            <AlertDescription>No historical data available for {location}.</AlertDescription>
          </Alert>
        )}

        {hasData && (
          <TableContainer maxHeight="400px" overflowY="auto" borderWidth="1px" borderRadius="md">
            <Table variant="simple" size="sm" colorScheme="gray">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Date</Th>
                  <Th isNumeric>Temp (°C)</Th>
                  <Th isNumeric>Humidity (%)</Th>
                  <Th isNumeric>Wind (km/h)</Th>
                  <Th>Condition</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item, index) => (
                  <Tr key={index} _hover={{ bg: "gray.50" }}>
                    <Td>{item.date}</Td>
                    <Td isNumeric>{item.temperature}</Td>
                    <Td isNumeric>{item.humidity}</Td>
                    <Td isNumeric>{item.windSpeed}</Td>
                    <Td>{item.condition}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </CardBody>
    </Card>
  );
}

HistoricalDataPanel.propTypes = {
  /**
   * Array of historical weather data points.
   * Each item should have the following structure:
   * - `date`: string (e.g., "2023-10-26")
   * - `temperature`: number (e.g., 25)
   * - `humidity`: number (e.g., 70)
   * - `windSpeed`: number (e.g., 15)
   * - `condition`: string (e.g., "Sunny")
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      temperature: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
      windSpeed: PropTypes.number.isRequired,
      condition: PropTypes.string.isRequired,
    })
  ),
  /**
   * The name of the location for which data is displayed.
   */
  location: PropTypes.string,
};