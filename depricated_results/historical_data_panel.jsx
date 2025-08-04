import React from 'react';
import {
  Box,
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
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A panel component to display historical weather data for a selected location.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.data - Array of historical weather data points. Each object should ideally contain `date`, `temperature`, and `condition`.
 * @param {string} props.location - The name of the location for which data is displayed.
 */
export default function HistoricalDataPanel({ data = [], location = '' }) {
  const hasData = data && data.length > 0;

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      _dark={{ bg: 'gray.700' }}
      maxW={{ base: '100%', md: 'xl', lg: '2xl' }}
      mx="auto"
      my={4}
      display="flex"
      flexDirection="column"
    >
      <Heading as="h2" size="lg" mb={4} color="teal.600" _dark={{ color: 'teal.300' }}>
        Historical Data for {location || 'Selected Location'}
      </Heading>

      {!hasData ? (
        <Alert status="info" variant="left-accent" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            {location ? `No historical data available for ${location}.` : 'Please select a location to view historical data.'}
          </AlertDescription>
        </Alert>
      ) : (
        <TableContainer
          maxH="400px" // Sets a maximum height for the table
          overflowY="auto" // Enables vertical scrolling if content exceeds maxH
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.200"
          _dark={{ borderColor: 'gray.600' }}
        >
          <Table variant="simple" size="md">
            <Thead bg="gray.50" _dark={{ bg: 'gray.800' }} position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th color="gray.600" _dark={{ color: 'gray.300' }}>Date</Th>
                <Th color="gray.600" _dark={{ color: 'gray.300' }} isNumeric>Temperature (°C)</Th>
                <Th color="gray.600" _dark={{ color: 'gray.300' }}>Condition</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item, index) => (
                <Tr key={index} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.600' } }}>
                  <Td>{item.date}</Td>
                  <Td isNumeric>{item.temperature}</Td>
                  <Td>{item.condition}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

HistoricalDataPanel.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      temperature: PropTypes.number.isRequired,
      condition: PropTypes.string, // Condition is optional as it might not always be available
    })
  ),
  location: PropTypes.string,
};