import React from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Badge,
  Divider,
  Spinner,
  Center,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Formats a date string into a more readable local date and time format.
 * @param {string | null | undefined} dateString - The date string to format.
 * @returns {string} Formatted date string or "N/A" if invalid or null.
 */
const formatAlertDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

/**
 * Determines the Chakra UI color scheme for the severity badge based on the severity level.
 * @param {string | null | undefined} severity - The severity level (e.g., "Extreme", "Severe", "Moderate", "Minor", "Unknown").
 * @returns {string} Chakra UI color scheme name (e.g., "red", "orange", "yellow", "blue", "gray").
 */
const getSeverityColorScheme = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return 'red';
    case 'severe':
      return 'orange';
    case 'moderate':
      return 'yellow';
    case 'minor':
      return 'blue';
    case 'unknown':
    default:
      return 'gray';
  }
};

/**
 * A panel component to display detailed information for a selected severe weather alert.
 * It provides a clear, structured view of alert properties, including headline,
 * severity, timing, affected areas, and detailed descriptions/instructions.
 *
 * @param {object} props - The component props.
 * @param {object | null} props.alert - The alert object containing details to display.
 *                                      Expected properties include:
 *                                      - `id`: Unique identifier for the alert.
 *                                      - `event`: The type of event (e.g., "Tornado Warning").
 *                                      - `headline`: A brief summary of the alert.
 *                                      - `description`: Detailed explanation of the alert.
 *                                      - `instruction`: Recommended actions for the public.
 *                                      - `severity`: The severity level (e.g., "Extreme", "Severe").
 *                                      - `urgency`: How quickly action is needed (e.g., "Immediate", "Expected").
 *                                      - `certainty`: The certainty of the event (e.g., "Observed", "Likely").
 *                                      - `effective`: The start time of the alert (ISO string).
 *                                      - `expires`: The end time of the alert (ISO string).
 *                                      - `senderName`: The issuing agency.
 *                                      - `areaDesc`: Description of affected geographical areas.
 *                                      - `status`: The status of the alert (e.g., "Actual", "Test").
 *                                      - `messageType`: The type of message (e.g., "Alert", "Update").
 */
export default function AlertDetailsPanel({ alert }) {
  if (!alert) {
    return (
      <Center
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        bg="white"
        boxShadow="md"
        minH={{ base: "200px", md: "300px" }}
        flexDirection="column"
        textAlign="center"
        color="gray.500"
        aria-live="polite"
        aria-atomic="true"
      >
        <Spinner size="xl" mb={4} color="blue.500" />
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
          Select an alert to view details
        </Text>
        <Text fontSize={{ base: "sm", md: "md" }}>
          Detailed information will appear here.
        </Text>
      </Center>
    );
  }

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      boxShadow="md"
      maxH={{ base: "calc(100vh - 100px)", md: "calc(100vh - 120px)" }} // Responsive max height
      overflowY="auto"
      display="flex"
      flexDirection="column"
      aria-labelledby="alert-headline"
    >
      <VStack align="stretch" spacing={4}>
        <Heading as="h2" size="lg" color="blue.700" id="alert-headline">
          {alert.event || alert.headline || 'Weather Alert Details'}
        </Heading>

        <HStack wrap="wrap" spacing={2}>
          {alert.severity && (
            <Badge
              colorScheme={getSeverityColorScheme(alert.severity)}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              textTransform="capitalize"
              aria-label={`Severity: ${alert.severity}`}
            >
              Severity: {alert.severity}
            </Badge>
          )}
          {alert.urgency && (
            <Badge
              colorScheme="purple"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              textTransform="capitalize"
              aria-label={`Urgency: ${alert.urgency}`}
            >
              Urgency: {alert.urgency}
            </Badge>
          )}
          {alert.certainty && (
            <Badge
              colorScheme="teal"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              textTransform="capitalize"
              aria-label={`Certainty: ${alert.certainty}`}
            >
              Certainty: {alert.certainty}
            </Badge>
          )}
        </HStack>

        <Divider />

        <VStack align="stretch" spacing={2}>
          <Text fontSize="md" fontWeight="semibold" color="gray.600">
            Effective:{' '}
            <Text as="span" fontWeight="normal">
              {formatAlertDate(alert.effective)}
            </Text>
          </Text>
          <Text fontSize="md" fontWeight="semibold" color="gray.600">
            Expires:{' '}
            <Text as="span" fontWeight="normal">
              {formatAlertDate(alert.expires)}
            </Text>
          </Text>
          {alert.senderName && (
            <Text fontSize="md" fontWeight="semibold" color="gray.600">
              Issued By:{' '}
              <Text as="span" fontWeight="normal">
                {alert.senderName}
              </Text>
            </Text>
          )}
          {alert.areaDesc && (
            <Text fontSize="md" fontWeight="semibold" color="gray.600">
              Affected Areas:{' '}
              <Text as="span" fontWeight="normal">
                {alert.areaDesc}
              </Text>
            </Text>
          )}
          {alert.status && (
            <Text fontSize="md" fontWeight="semibold" color="gray.600">
              Status:{' '}
              <Text as="span" fontWeight="normal">
                {alert.status}
              </Text>
            </Text>
          )}
          {alert.messageType && (
            <Text fontSize="md" fontWeight="semibold" color="gray.600">
              Message Type:{' '}
              <Text as="span" fontWeight="normal">
                {alert.messageType}
              </Text>
            </Text>
          )}
        </VStack>

        {alert.description && (
          <>
            <Divider />
            <Box>
              <Heading as="h3" size="md" mb={2} color="blue.600">
                Description
              </Heading>
              <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
                {alert.description}
              </Text>
            </Box>
          </>
        )}

        {alert.instruction && (
          <>
            <Divider />
            <Box>
              <Heading as="h3" size="md" mb={2} color="blue.600">
                Instructions
              </Heading>
              <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
                {alert.instruction}
              </Text>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
}

AlertDetailsPanel.propTypes = {
  /**
   * The alert object containing details to display.
   * Expected properties: id, event, headline, description, instruction, severity,
   * urgency, certainty, effective, expires, senderName, areaDesc, status, messageType.
   * All properties are optional within the shape, as the component handles their absence.
   */
  alert: PropTypes.shape({
    id: PropTypes.string,
    event: PropTypes.string,
    headline: PropTypes.string,
    description: PropTypes.string,
    instruction: PropTypes.string,
    severity: PropTypes.string,
    urgency: PropTypes.string,
    certainty: PropTypes.string,
    effective: PropTypes.string,
    expires: PropTypes.string,
    senderName: PropTypes.string,
    areaDesc: PropTypes.string,
    status: PropTypes.string,
    messageType: PropTypes.string,
  }),
};

AlertDetailsPanel.defaultProps = {
  alert: null,
};