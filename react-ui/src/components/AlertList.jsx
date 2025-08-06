import React from 'react';
import {
  Box,
  Text,
  VStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Icon,
  useColorModeValue,
  Heading,
  List,
  ListItem,
  Button,
  Flex
} from '@chakra-ui/react';
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCloudSun, // Example icon, not directly used for severity but good to have
  FaBolt, // Example icon
  FaWater, // Example icon
  FaWind // Example icon
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * Helper function to format a date string into a localized date and time string.
 * @param {string} dateString - The date string to format (e.g., ISO 8601).
 * @returns {string} The formatted date string, or 'N/A' if invalid.
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Options for a more readable format
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString(undefined, options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

/**
 * Helper function to map alert severity levels to Chakra UI color schemes and icons.
 * @param {string} severity - The severity level of the alert (e.g., "Extreme", "Severe", "Moderate", "Minor").
 * @returns {{colorScheme: string, icon: React.ComponentType}} An object containing the Chakra UI color scheme and a React icon component.
 */
const getSeverityProps = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return { colorScheme: 'red', icon: FaExclamationTriangle };
    case 'severe':
      return { colorScheme: 'orange', icon: FaExclamationTriangle };
    case 'moderate':
      return { colorScheme: 'yellow', icon: FaInfoCircle };
    case 'minor':
      return { colorScheme: 'blue', icon: FaInfoCircle };
    default:
      return { colorScheme: 'gray', icon: FaInfoCircle };
  }
};

/**
 * AlertList component displays a chronological list of severe weather alerts.
 * Each alert item is clickable to show more details, leveraging Chakra UI for styling and responsiveness.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.alerts - An array of alert objects, each containing alert details.
 *   Each alert object should ideally have:
 *   - `id`: string | number (unique identifier, required)
 *   - `headline`: string (main title of the alert)
 *   - `description`: string (detailed description)
 *   - `severity`: string (e.g., "Minor", "Moderate", "Severe", "Extreme")
 *   - `issuedAt`: string (ISO date string, for chronological sorting)
 * @param {function} props.onAlertClick - Callback function when an alert item is clicked.
 *   Receives the clicked alert object as an argument.
 */
function AlertList({ alerts = [], onAlertClick = () => {} }) {
  // Chakra UI hooks for color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Display a message if no alerts are available
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg={cardBg}
        borderColor={borderColor}
        textAlign="center"
        maxW="lg"
        mx="auto"
        boxShadow="sm"
      >
        <Text fontSize="md" color="gray.500">No alerts to display.</Text>
      </Box>
    );
  }

  // Sort alerts by 'issuedAt' in descending order (most recent first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const dateA = new Date(a.issuedAt);
    const dateB = new Date(b.issuedAt);
    return dateB - dateA;
  });

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="lg"
      bg={cardBg}
      borderColor={borderColor}
      maxW="lg"
      mx="auto"
      boxShadow="md"
      overflowY="auto" // Enable vertical scrolling
      maxH={{ base: "400px", md: "500px", lg: "600px" }} // Responsive max height for scrollability
    >
      <Heading as="h2" size="lg" mb={4} textAlign="center" color="teal.500">
        Weather Alerts
      </Heading>
      <List spacing={3}>
        {sortedAlerts.map((alert) => {
          const { colorScheme, icon: SeverityIcon } = getSeverityProps(alert.severity);
          return (
            <ListItem key={alert.id}>
              <Button
                as={Flex} // Use Flex for layout inside the button to leverage Chakra's layout props
                width="100%"
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor={borderColor}
                bg={cardBg}
                _hover={{ bg: cardHoverBg, transform: 'translateY(-2px)', boxShadow: 'lg' }}
                _active={{ bg: cardHoverBg }}
                onClick={() => onAlertClick(alert)}
                justifyContent="space-between"
                alignItems="center"
                flexDirection={{ base: "column", md: "row" }} // Stack vertically on small screens, row on larger
                textAlign="left"
                transition="all 0.2s ease-in-out" // Smooth transition for hover effects
                aria-label={`View details for alert: ${alert.headline || 'No Headline'}`}
              >
                <VStack align="start" spacing={1} flex="1" pr={{ base: 0, md: 4 }}>
                  <Flex alignItems="center" mb={1}>
                    <Tag size="sm" colorScheme={colorScheme} borderRadius="full" mr={2}>
                      {SeverityIcon && <TagLeftIcon as={SeverityIcon} />}
                      <TagLabel>{alert.severity || 'Unknown'}</TagLabel>
                    </Tag>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(alert.issuedAt)}
                    </Text>
                  </Flex>
                  <Heading as="h3" size="md" noOfLines={1} color="gray.800">
                    {alert.headline || 'No Headline'}
                  </Heading>
                  <Text fontSize="sm" noOfLines={2} color="gray.600">
                    {alert.description || 'No description available.'}
                  </Text>
                </VStack>
                {/* Info icon on the right, hidden on small screens if space is tight */}
                <Icon as={FaInfoCircle} color="gray.400" boxSize={5} ml={{ base: 0, md: 4 }} mt={{ base: 2, md: 0 }} />
              </Button>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

AlertList.propTypes = {
  /**
   * Array of alert objects, each containing alert details.
   * Each alert object should ideally have:
   * - `id`: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired (unique identifier)
   * - `headline`: PropTypes.string (main title of the alert)
   * - `description`: PropTypes.string (detailed description)
   * - `severity`: PropTypes.string (e.g., "Minor", "Moderate", "Severe", "Extreme")
   * - `issuedAt`: PropTypes.string (ISO date string, for chronological sorting)
   */
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      headline: PropTypes.string,
      description: PropTypes.string,
      severity: PropTypes.string,
      issuedAt: PropTypes.string,
    })
  ),
  /**
   * Callback function when an alert item is clicked.
   * Receives the clicked alert object as an argument.
   */
  onAlertClick: PropTypes.func,
};

export default React.memo(AlertList);