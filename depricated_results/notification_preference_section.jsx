import React from 'react';
import {
  Box,
  Heading,
  Stack,
  Switch,
  Select,
  FormControl,
  FormLabel,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

// Define prop types for individual preference items
const preferencePropTypes = PropTypes.shape({
  /**
   * The display label for the preference item.
   */
  label: PropTypes.string.isRequired,
  /**
   * The type of control for the preference. Can be 'toggle' (Switch) or 'selector' (Select).
   */
  type: PropTypes.oneOf(['toggle', 'selector']).isRequired,
  /**
   * For 'toggle' type: The current checked state of the switch.
   */
  isChecked: PropTypes.bool,
  /**
   * For 'selector' type: An array of string options available for selection.
   */
  options: PropTypes.arrayOf(PropTypes.string),
  /**
   * For 'selector' type: The currently selected value(s). If an array, the first element is used for single-select.
   */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /**
   * Callback function invoked when the preference value changes.
   * For 'toggle', it receives a boolean (the new checked state).
   * For 'selector', it receives a string (the new selected value).
   */
  onChange: PropTypes.func,
});

export default function NotificationPreferenceSection({ title, preferences = [] }) {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="sm"
      bg={bgColor}
      borderColor={borderColor}
      maxW="xl" // Sensible max width for a settings section
      mx="auto" // Center the component
      aria-labelledby="notification-section-title" // Associates the section with its title for accessibility
    >
      <Heading as="h2" size="lg" mb={6} color={textColor} id="notification-section-title">
        {title || "Notification Preferences"}
      </Heading>

      <Stack spacing={5}>
        {preferences.length === 0 && (
          <Text color={labelColor} fontStyle="italic">
            No notification preferences available.
          </Text>
        )}

        {preferences.map((pref, index) => (
          <FormControl key={index} display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel htmlFor={`pref-${index}`} mb="0" flex="1" mr={4} color={labelColor} fontWeight="normal">
              {pref.label}
            </FormLabel>

            {pref.type === 'toggle' && (
              <Switch
                id={`pref-${index}`}
                isChecked={pref.isChecked}
                onChange={(e) => pref.onChange && pref.onChange(e.target.checked)} // Pass boolean value directly
                colorScheme="teal"
                size="lg"
                aria-label={pref.label} // Ensure accessibility for screen readers
              />
            )}

            {pref.type === 'selector' && (
              <Select
                id={`pref-${index}`}
                value={Array.isArray(pref.value) ? pref.value[0] : pref.value || ''} // Take first element if array, or default to empty string
                onChange={(e) => pref.onChange && pref.onChange(e.target.value)} // Pass string value directly
                placeholder="Select option"
                width="auto" // Allow select to size based on content
                minW="150px" // Minimum width for better appearance
                maxW="200px" // Maximum width
                color={textColor}
                borderColor={borderColor}
                _hover={{ borderColor: 'gray.400' }}
                _focus={{ borderColor: 'teal.500', boxShadow: 'outline' }}
                aria-label={pref.label} // Ensure accessibility for screen readers
              >
                {pref.options && pref.options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>
        ))}
      </Stack>
    </Box>
  );
}

NotificationPreferenceSection.propTypes = {
  /**
   * Title of the notification section.
   */
  title: PropTypes.string,
  /**
   * Array of notification preference objects, each defining a toggle or selector.
   */
  preferences: PropTypes.arrayOf(preferencePropTypes),
};