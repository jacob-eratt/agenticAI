import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Tag,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Helper function to format ISO date strings into a localized date and time string.
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} The formatted date string, or 'N/A' if invalid.
 */
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return 'Invalid Date';
  }
};

/**
 * Helper function to determine the Chakra UI color scheme for a severity tag.
 * @param {string} severity - The severity level (e.g., "Extreme", "Severe", "Moderate", "Minor").
 * @returns {string} The Chakra UI color scheme name.
 */
const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return 'red';
    case 'severe':
      return 'orange';
    case 'moderate':
      return 'yellow';
    case 'minor':
      return 'blue';
    default:
      return 'gray';
  }
};

/**
 * A panel component to display detailed information for a selected severe weather alert.
 * It provides a clear, structured view of alert details, including event type,
 * description, effective and expiration times, severity, and instructions.
 *
 * @param {object} props - The component props.
 * @param {object} props.alert - The alert object containing details to display.
 *   If `null` or `undefined`, a "No Alert Selected" message is shown.
 *   Expected properties within the `alert` object include:
 *   - `event` (string): The type of alert (e.g., "Severe Thunderstorm Warning").
 *   - `headline` (string): A brief summary or headline for the alert.
 *   - `description` (string): Detailed description of the alert.
 *   - `effective` (string): ISO string of when the alert becomes effective.
 *   - `expires` (string): ISO string of when the alert expires.
 *   - `severity` (string): The severity level (e.g., "Extreme", "Severe", "Moderate", "Minor").
 *   - `urgency` (string): The urgency level (e.g., "Immediate", "Expected").
 *   - `certainty` (string): The certainty level (e.g., "Observed", "Likely").
 *   - `areaDesc` (string): Description of the affected geographical areas.
 *   - `instruction` (string): Recommended actions or instructions for the public.
 */
export default function AlertDetailsPanel({ alert }) {
  // Display a message if no alert is selected
  if (!alert) {
    return (
      <Box
        p={6}
        borderWidth={1}
        borderRadius="lg"
        borderColor="gray.200"
        bg="white"
        shadow="md"
        maxW="xl"
        mx="auto"
        minH="300px" // Ensures a minimum height for the panel
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No Alert Selected
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Please select an alert from the list to view its details here.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: 4, md: 6 }} // Responsive padding
      borderWidth={1}
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      shadow="md"
      maxW="xl" // Maximum width for the panel
      mx="auto" // Center the panel horizontally
      overflowY="auto" // Enable vertical scrolling if content overflows
      maxH={{ base: "calc(100vh - 100px)", md: "700px" }} // Responsive max height
    >
      <Heading as="h2" size="lg" mb={4} color="red.600">
        {alert.event || 'Unknown Alert Event'}
      </Heading>

      {alert.headline && (
        <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
          {alert.headline}
        </Text>
      )}

      <Divider mb={4} />

      <Stack spacing={3} mb={4}>
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="bold">Severity:</Text>{' '}
          <Tag size="md" variant="solid" colorScheme={getSeverityColor(alert.severity)}>
            {alert.severity || 'N/A'}
          </Tag>
        </Text>
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="bold">Urgency:</Text>{' '}
          <Tag size="md" variant="outline" colorScheme="purple">
            {alert.urgency || 'N/A'}
          </Tag>
        </Text>
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="bold">Certainty:</Text>{' '}
          <Tag size="md" variant="outline" colorScheme="teal">
            {alert.certainty || 'N/A'}
          </Tag>
        </Text>
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="bold">Effective:</Text>{' '}
          {formatDate(alert.effective)}
        </Text>
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="bold">Expires:</Text>{' '}
          {formatDate(alert.expires)}
        </Text>
        <Text fontSize="sm" color="gray.600">
          <Text as="span" fontWeight="bold">Affected Areas:</Text>{' '}
          {alert.areaDesc || 'N/A'}
        </Text>
      </Stack>

      {alert.description && (
        <>
          <Heading as="h3" size="md" mb={2} color="gray.700">
            Details
          </Heading>
          <Text fontSize="md" mb={4} whiteSpace="pre-wrap" color="gray.800">
            {alert.description}
          </Text>
        </>
      )}

      {alert.instruction && (
        <>
          <Heading as="h3" size="md" mb={2} color="gray.700">
            Instructions
          </Heading>
          <Text fontSize="md" mb={4} whiteSpace="pre-wrap" color="gray.800" fontWeight="medium">
            {alert.instruction}
          </Text>
        </>
      )}
    </Box>
  );
}

AlertDetailsPanel.propTypes = {
  /**
   * The alert object containing details to display.
   * Expected properties include:
   * - `event`: The type of alert (e.g., "Severe Thunderstorm Warning").
   * - `headline`: A brief summary of the alert.
   * - `description`: Detailed description of the alert.
   * - `effective`: ISO string of when the alert becomes effective.
   * - `expires`: ISO string of when the alert expires.
   * - `severity`: The severity level (e.g., "Extreme", "Severe", "Moderate", "Minor").
   * - `urgency`: The urgency level (e.g., "Immediate", "Expected").
   * - `certainty`: The certainty level (e.g., "Observed", "Likely").
   * - `areaDesc`: Description of the affected areas.
   * - `instruction`: Recommended actions for the public.
   */
  alert: PropTypes.shape({
    event: PropTypes.string,
    headline: PropTypes.string,
    description: PropTypes.string,
    effective: PropTypes.string,
    expires: PropTypes.string,
    severity: PropTypes.string,
    urgency: PropTypes.string,
    certainty: PropTypes.string,
    areaDesc: PropTypes.string,
    instruction: PropTypes.string,
  }),
};