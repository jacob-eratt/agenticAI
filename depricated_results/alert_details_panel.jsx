import React from 'react';
import { Box, Heading, Text, Stack, Tag, Divider, Badge } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Helper function to format ISO date strings into a readable format.
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} The formatted date string or 'N/A' if invalid.
 */
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

/**
 * Helper function to determine the Chakra UI color scheme based on alert severity.
 * @param {string} severity - The severity level (e.g., 'Extreme', 'Severe', 'Moderate').
 * @returns {string} The corresponding Chakra UI color scheme name.
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
      return 'green';
    case 'unknown':
    default:
      return 'gray';
  }
};

/**
 * AlertDetailsPanel component displays detailed information for a selected severe weather alert.
 * It is designed to be visually appealing, highly customizable, and accessible.
 *
 * @param {object} props - The component props.
 * @param {object} props.alert - The alert object containing details to display.
 *   Expected properties include: headline, event, severity, urgency, certainty,
 *   effective, expires, description, instruction, areaDesc, senderName, status, messageType.
 */
export default function AlertDetailsPanel({ alert }) {
  // Display a message if no alert is selected or provided
  if (!alert) {
    return (
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        bg="white"
        maxW="xl"
        mx="auto"
        textAlign="center"
        aria-live="polite" // Announce changes to screen readers
        role="region" // Define this as a distinct region
        aria-label="No Alert Selected"
      >
        <Text fontSize="lg" color="gray.500">
          Select an alert to view details.
        </Text>
      </Box>
    );
  }

  // Destructure alert properties for easier access
  const {
    headline,
    event,
    severity,
    urgency,
    certainty,
    effective,
    expires,
    description,
    instruction,
    areaDesc,
    senderName,
    status,
    messageType,
  } = alert;

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg="white"
      maxW={{ base: "100%", md: "xl", lg: "2xl" }} // Responsive max width
      mx="auto"
      overflowY="auto" // Enable vertical scrolling for long content
      maxH={{ base: "calc(100vh - 120px)", md: "700px" }} // Responsive max height for scrollability
      aria-live="polite" // Announce dynamic content changes
      role="region" // Define this as a distinct region for accessibility
      aria-label="Alert Details"
    >
      <Stack spacing={4}>
        {/* Main Headline/Event Title */}
        <Heading as="h2" size="lg" color="blue.700" mb={2}>
          {headline || event || 'Weather Alert Details'}
        </Heading>

        {/* Tags and Badges for key alert characteristics */}
        <Stack direction={{ base: "column", sm: "row" }} wrap="wrap" spacing={3} align="flex-start">
          {event && (
            <Tag size="lg" colorScheme="purple" variant="solid" borderRadius="full">
              {event}
            </Tag>
          )}
          {severity && (
            <Badge
              colorScheme={getSeverityColor(severity)}
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
            >
              Severity: {severity}
            </Badge>
          )}
          {urgency && (
            <Badge
              colorScheme={urgency.toLowerCase() === 'immediate' ? 'red' : 'blue'}
              variant="outline"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
            >
              Urgency: {urgency}
            </Badge>
          )}
          {certainty && (
            <Badge
              colorScheme={certainty.toLowerCase() === 'observed' ? 'green' : 'teal'}
              variant="outline"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="md"
            >
              Certainty: {certainty}
            </Badge>
          )}
        </Stack>

        <Divider borderColor="gray.200" />

        {/* Effective and Expiration Times */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" color="gray.600">Effective:</Text>
          <Text fontSize="md" color="gray.800">{formatDate(effective)}</Text>
        </Box>

        <Box>
          <Text fontSize="md" fontWeight="semibold" color="gray.600">Expires:</Text>
          <Text fontSize="md" color="gray.800">{formatDate(expires)}</Text>
        </Box>

        {/* Affected Areas */}
        {areaDesc && (
          <Box>
            <Text fontSize="md" fontWeight="semibold" color="gray.600">Affected Areas:</Text>
            <Text fontSize="md" color="gray.800">{areaDesc}</Text>
          </Box>
        )}

        {/* Description of the Alert */}
        {description && (
          <Box>
            <Text fontSize="md" fontWeight="semibold" color="gray.600">Description:</Text>
            <Text fontSize="md" color="gray.800" whiteSpace="pre-wrap">{description}</Text>
          </Box>
        )}

        {/* Instructions/Call to Action */}
        {instruction && (
          <Box>
            <Text fontSize="md" fontWeight="semibold" color="gray.600">Instructions:</Text>
            <Text fontSize="md" color="gray.800" whiteSpace="pre-wrap">{instruction}</Text>
          </Box>
        )}

        <Divider borderColor="gray.200" />

        {/* Footer details: Sender, Status, Message Type */}
        <Stack direction={{ base: "column", sm: "row" }} spacing={4} fontSize="sm" color="gray.600">
          {senderName && <Text><strong>Sender:</strong> {senderName}</Text>}
          {status && <Text><strong>Status:</strong> {status}</Text>}
          {messageType && <Text><strong>Type:</strong> {messageType}</Text>}
        </Stack>
      </Stack>
    </Box>
  );
}

AlertDetailsPanel.propTypes = {
  /**
   * The alert object containing details to display.
   * Expected properties:
   * - `headline`: (string) Main headline of the alert.
   * - `event`: (string) Type of event (e.g., "Tornado Warning").
   * - `severity`: (string) Severity level (e.g., "Extreme", "Severe").
   * - `urgency`: (string) Urgency level (e.g., "Immediate", "Expected").
   * - `certainty`: (string) Certainty level (e.g., "Observed", "Likely").
   * - `effective`: (string) ISO date string for when the alert becomes effective.
   * - `expires`: (string) ISO date string for when the alert expires.
   * - `description`: (string) Detailed description of the alert.
   * - `instruction`: (string) Instructions or recommended actions.
   * - `areaDesc`: (string) Description of affected geographical areas.
   * - `senderName`: (string) Name of the issuing agency.
   * - `status`: (string) Current status of the alert (e.g., "Actual", "Test").
   * - `messageType`: (string) Type of message (e.g., "Alert", "Update", "Cancel").
   */
  alert: PropTypes.shape({
    headline: PropTypes.string,
    event: PropTypes.string,
    severity: PropTypes.string,
    urgency: PropTypes.string,
    certainty: PropTypes.string,
    effective: PropTypes.string,
    expires: PropTypes.string,
    description: PropTypes.string,
    instruction: PropTypes.string,
    areaDesc: PropTypes.string,
    senderName: PropTypes.string,
    status: PropTypes.string,
    messageType: PropTypes.string,
  }),
};