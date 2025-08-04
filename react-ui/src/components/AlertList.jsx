import React from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Stack,
  useColorModeValue,
  Icon,
  Flex,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle, FaInfoCircle, FaCloudSunRain, FaBolt } from 'react-icons/fa';

/**
 * Helper function to format a timestamp into a localized string.
 * @param {string} timestamp - The timestamp string (e.g., ISO 8601).
 * @returns {string} The formatted date and time string, or 'N/A' if invalid.
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp);
    // Example: "1/1/2023, 10:30:00 AM"
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return 'Invalid Date';
  }
};

/**
 * Helper function to get an appropriate icon based on alert severity or type.
 * @param {'info' | 'warning' | 'error' | 'success'} severity - The severity level of the alert.
 * @param {string} type - The type of weather event.
 * @returns {React.ElementType} The React icon component.
 */
const getAlertIcon = (severity, type) => {
  switch (severity) {
    case 'error':
      return FaExclamationTriangle; // Critical alert
    case 'warning':
      return FaBolt; // Warning, like severe weather
    case 'info':
      return FaInfoCircle; // General information
    default:
      return FaCloudSunRain; // Default weather icon
  }
};

/**
 * @typedef {object} Alert
 * @property {string | number} id - Unique identifier for the alert.
 * @property {string} title - The main title of the alert.
 * @property {string} [description] - A brief description of the alert.
 * @property {string} timestamp - ISO string or similar, representing when the alert was issued/updated.
 * @property {'info' | 'warning' | 'error' | 'success'} [severity='info'] - The severity level of the alert.
 * @property {string} [type] - The type of weather event (e.g., "Severe Thunderstorm", "Flood Warning").
 */

/**
 * AlertList component displays a chronological list of severe weather alerts.
 * Each alert item is clickable to show more details.
 *
 * @param {object} props - The component props.
 * @param {Alert[]} props.alerts - Array of alert objects, each containing alert details.
 * @param {(alert: Alert) => void} [props.onAlertClick] - Callback function when an alert item is clicked.
 */
export default function AlertList({ alerts = [], onAlertClick = () => {} }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Sort alerts by timestamp in descending order (most recent first)
  const sortedAlerts = React.useMemo(() => {
    return [...alerts].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, [alerts]);

  if (sortedAlerts.length === 0) {
    return (
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={cardBorderColor}
        bg={cardBg}
        textAlign="center"
        color="gray.500"
        fontSize="lg"
        minH="150px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="sm"
      >
        <Text>No alerts to display.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto" pr={2}>
      {sortedAlerts.map((alert) => {
        const IconComponent = getAlertIcon(alert.severity, alert.type);
        const severityColor = {
          'error': 'red.500',
          'warning': 'orange.500',
          'info': 'blue.500',
          'success': 'green.500'
        }[alert.severity || 'info'];

        return (
          <Card
            key={alert.id}
            direction={{ base: 'column', sm: 'row' }}
            overflow="hidden"
            variant="outline"
            borderColor={cardBorderColor}
            bg={cardBg}
            _hover={{ bg: hoverBg, cursor: 'pointer' }}
            onClick={() => onAlertClick(alert)}
            role="button"
            tabIndex={0}
            aria-label={`View details for alert: ${alert.title}. Issued on ${formatTimestamp(alert.timestamp)}.`}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAlertClick(alert);
              }
            }}
            boxShadow="sm"
          >
            <CardHeader pb={{ base: 0, sm: 4 }}>
              <Flex align="center">
                <Icon as={IconComponent} boxSize={6} color={severityColor} mr={3} />
                <Heading size="md" flex="1">{alert.title}</Heading>
              </Flex>
            </CardHeader>
            <CardBody pt={{ base: 0, sm: 4 }}>
              <Stack spacing={1}>
                {alert.type && (
                  <Text fontSize="sm" color="gray.500">
                    Type: <Text as="span" fontWeight="medium" color="gray.600">{alert.type}</Text>
                  </Text>
                )}
                <Text fontSize="sm" color="gray.500">
                  Issued: <Text as="span" fontWeight="medium" color="gray.600">{formatTimestamp(alert.timestamp)}</Text>
                </Text>
                {alert.description && (
                  <Text fontSize="sm" noOfLines={2} color="gray.600">
                    {alert.description}
                  </Text>
                )}
              </Stack>
            </CardBody>
            <CardFooter display="flex" alignItems="center" justifyContent="flex-end">
              <Button variant="link" colorScheme="blue" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </VStack>
  );
}

AlertList.propTypes = {
  /**
   * Array of alert objects, each containing alert details.
   * Each alert object should have at least `id`, `title`, `timestamp`.
   * Optional: `description`, `severity` ('info' | 'warning' | 'error' | 'success'), `type`.
   */
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      timestamp: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
      type: PropTypes.string,
    })
  ),
  /**
   * Callback function when an alert item is clicked.
   * Receives the clicked alert object as an argument.
   */
  onAlertClick: PropTypes.func,
};