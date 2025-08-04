import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Helper function to format the timestamp.
 * @param {string} timestamp - The timestamp string.
 * @returns {string} Formatted date and time.
 */
const formatAlertTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    console.error('Error formatting timestamp:', e);
    return 'Invalid Date';
  }
};

/**
 * Helper function to determine Chakra UI color scheme based on severity.
 * @param {string} severity - The severity level (e.g., "severe", "moderate", "minor").
 * @returns {string} Chakra UI color scheme name.
 */
const getSeverityColorScheme = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'severe':
    case 'critical':
    case 'emergency':
      return 'red';
    case 'moderate':
    case 'warning':
      return 'orange';
    case 'minor':
    case 'advisory':
      return 'yellow';
    case 'info':
    default:
      return 'blue';
  }
};

/**
 * AlertList component displays a chronological list of severe weather alerts.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.alerts - Array of alert objects, each containing alert details.
 * @param {Function} [props.onAlertClick] - Callback function when an alert item is clicked.
 */
export default function AlertList({ alerts = [], onAlertClick = () => {} }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Sort alerts chronologically (oldest first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateA.getTime() - dateB.getTime();
  });

  if (sortedAlerts.length === 0) {
    return (
      <Box
        p={6}
        borderWidth={1}
        borderRadius="lg"
        borderColor={cardBorderColor}
        bg={cardBg}
        textAlign="center"
        boxShadow="sm"
        aria-live="polite"
      >
        <Text fontSize="lg" color="gray.500" fontWeight="medium">
          No alerts to display at this time.
        </Text>
      </Box>
    );
  }

  return (
    <VStack
      spacing={4}
      align="stretch"
      maxH="600px" // Max height for scrollability
      overflowY="auto" // Enable vertical scrolling
      p={2} // Padding for the scrollable area
      borderRadius="lg"
      borderWidth={1}
      borderColor={cardBorderColor}
      bg={useColorModeValue('gray.50', 'gray.800')} // Background for the list container
      boxShadow="md"
      role="list"
      aria-label="List of weather alerts"
    >
      {sortedAlerts.map((alert) => (
        <Card
          key={alert.id}
          onClick={() => onAlertClick(alert)}
          cursor="pointer"
          tabIndex={0} // Make the card focusable
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onAlertClick(alert);
            }
          }}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
            bg: hoverBg,
          }}
          transition="all 0.2s ease-in-out"
          borderRadius="md"
          borderWidth={1}
          borderColor={cardBorderColor}
          bg={cardBg}
          boxShadow="sm"
          role="listitem"
          aria-label={`Alert: ${alert.title} on ${formatAlertTimestamp(alert.timestamp)}`}
        >
          <CardHeader pb={2}>
            <HStack justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Heading as="h3" size="md" color={useColorModeValue('gray.800', 'white')}>
                {alert.title}
              </Heading>
              <Tag
                size="md"
                variant="solid"
                colorScheme={getSeverityColorScheme(alert.severity)}
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="bold"
              >
                {alert.severity || 'Unknown'}
              </Tag>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} mb={2}>
              {formatAlertTimestamp(alert.timestamp)}
            </Text>
            {alert.description && (
              <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.200')}>
                {alert.description}
              </Text>
            )}
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
}

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      timestamp: PropTypes.string.isRequired,
      severity: PropTypes.string,
    })
  ),
  onAlertClick: PropTypes.func,
};