import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  CheckboxGroup,
  Checkbox,
  Text,
  useToast,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} TogglePreference
 * @property {string} [id] - Unique identifier for the preference. If not provided, one will be generated.
 * @property {string} label - The display label for the preference.
 * @property {'toggle'} type - The type of preference control, 'toggle'.
 * @property {boolean} isChecked - The initial checked state for the toggle.
 * @property {(newValue: boolean) => void} [onChange] - Callback function when the toggle state changes.
 */

/**
 * @typedef {object} SelectorPreference
 * @property {string} [id] - Unique identifier for the preference. If not provided, one will be generated.
 * @property {string} label - The display label for the preference.
 * @property {'selector'} type - The type of preference control, 'selector'.
 * @property {string[]} options - An array of string options for the selector.
 * @property {string | string[]} value - The initial selected value(s) for the selector. If an array, it will render a multi-select checkbox group.
 * @property {(newValue: string | string[]) => void} [onChange] - Callback function when the selector value changes.
 */

/**
 * @typedef {TogglePreference | SelectorPreference} Preference
 */

/**
 * @typedef {object} NotificationPreferenceSectionProps
 * @property {string} title - The title of the notification section.
 * @property {Preference[]} [preferences=[]] - An array of notification preference objects.
 */

// Define PropTypes for the preference objects
const preferencePropTypes = PropTypes.shape({
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['toggle', 'selector']).isRequired,
  // For 'toggle' type
  isChecked: PropTypes.bool,
  // For 'selector' type
  options: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  onChange: PropTypes.func,
});

/**
 * NotificationPreferenceSection component displays and manages various notification preferences.
 * It supports toggle switches and selectors (single or multi-select).
 *
 * @param {NotificationPreferenceSectionProps} props - The props for the component.
 * @returns {JSX.Element} The rendered NotificationPreferenceSection component.
 */
export default function NotificationPreferenceSection({ title, preferences = [] }) {
  const toast = useToast();

  // Internal state to manage the current values of preferences
  // We use a Map for efficient lookups and updates by ID
  const [preferenceStates, setPreferenceStates] = useState(() => {
    const initialState = new Map();
    preferences.forEach((pref, index) => {
      const id = pref.id || `pref-${index}-${pref.label.replace(/\s/g, '-')}`;
      if (pref.type === 'toggle') {
        initialState.set(id, { ...pref, id, value: pref.isChecked });
      } else if (pref.type === 'selector') {
        initialState.set(id, { ...pref, id, value: pref.value });
      }
    });
    return initialState;
  });

  // Effect to update internal state if preferences prop changes externally
  // This ensures that if the parent passes a new set of preferences,
  // the component's internal state is updated, while preserving existing user selections.
  useEffect(() => {
    setPreferenceStates((currentStates) => {
      const newStates = new Map();
      preferences.forEach((pref, index) => {
        const id = pref.id || `pref-${index}-${pref.label.replace(/\s/g, '-')}`;
        // If the preference already exists in state by ID, keep its current value.
        // Otherwise, initialize it from the props.
        if (currentStates.has(id)) {
          newStates.set(id, { ...pref, id, value: currentStates.get(id).value });
        } else {
          if (pref.type === 'toggle') {
            newStates.set(id, { ...pref, id, value: pref.isChecked });
          } else if (pref.type === 'selector') {
            newStates.set(id, { ...pref, id, value: pref.value });
          }
        }
      });
      return newStates;
    });
  }, [preferences]); // Re-run if the preferences array reference changes

  /**
   * Handles the change event for a toggle preference.
   * @param {string} id - The ID of the preference that changed.
   * @param {boolean} newValue - The new checked state.
   */
  const handleToggleChange = useCallback((id, newValue) => {
    setPreferenceStates((prevStates) => {
      const newState = new Map(prevStates);
      const pref = newState.get(id);
      if (pref) {
        newState.set(id, { ...pref, value: newValue });
        // Call the original onChange handler if provided by the parent
        if (pref.onChange) {
          pref.onChange(newValue);
        }
      }
      return newState;
    });
  }, []);

  /**
   * Handles the change event for a selector preference (single or multi-select).
   * @param {string} id - The ID of the preference that changed.
   * @param {string | string[]} newValue - The new selected value(s).
   */
  const handleSelectorChange = useCallback((id, newValue) => {
    setPreferenceStates((prevStates) => {
      const newState = new Map(prevStates);
      const pref = newState.get(id);
      if (pref) {
        newState.set(id, { ...pref, value: newValue });
        // Call the original onChange handler if provided by the parent
        if (pref.onChange) {
          pref.onChange(newValue);
        }
      }
      return newState;
    });
  }, []);

  // Runtime validation for required 'title' prop
  if (!title) {
    toast({
      title: "Missing Prop",
      description: "The 'title' prop is required for NotificationPreferenceSection.",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
    return null; // Render nothing or a fallback UI if critical prop is missing
  }

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      _dark={{ bg: "gray.700", borderColor: "gray.600" }}
      maxW="xl"
      mx="auto"
    >
      <Heading as="h2" size="lg" mb={6} color="gray.800" _dark={{ color: "white" }}>
        {title}
      </Heading>

      <Stack spacing={5}>
        {Array.from(preferenceStates.values()).map((pref) => {
          if (pref.type === 'toggle') {
            return (
              <FormControl display="flex" alignItems="center" key={pref.id}>
                <FormLabel htmlFor={`toggle-${pref.id}`} mb="0" flex="1" cursor="pointer">
                  <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>
                    {pref.label}
                  </Text>
                </FormLabel>
                <Switch
                  id={`toggle-${pref.id}`}
                  isChecked={pref.value}
                  onChange={(e) => handleToggleChange(pref.id, e.target.checked)}
                  colorScheme="teal"
                  size="lg"
                  aria-label={`Toggle ${pref.label}`}
                />
              </FormControl>
            );
          } else if (pref.type === 'selector') {
            // Determine if it's a multi-select based on the initial value type
            const isMultiSelect = Array.isArray(pref.value);

            return (
              <FormControl key={pref.id}>
                <FormLabel htmlFor={`selector-${pref.id}`} mb="2">
                  <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>
                    {pref.label}
                  </Text>
                </FormLabel>
                {isMultiSelect ? (
                  <CheckboxGroup
                    colorScheme="teal"
                    value={pref.value}
                    onChange={(newValues) => handleSelectorChange(pref.id, newValues)}
                  >
                    <Stack direction={{ base: "column", sm: "row" }} spacing={4} wrap="wrap">
                      {pref.options && pref.options.map((option) => (
                        <Checkbox key={option} value={option} size="md">
                          {option}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                ) : (
                  <Select
                    id={`selector-${pref.id}`}
                    value={pref.value}
                    onChange={(e) => handleSelectorChange(pref.id, e.target.value)}
                    placeholder="Select an option"
                    size="md"
                    variant="filled"
                    colorScheme="teal"
                    _dark={{ bg: "gray.600", borderColor: "gray.500", color: "white" }}
                  >
                    {pref.options && pref.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>
            );
          }
          return null; // Fallback for unknown preference types
        })}
        {preferences.length === 0 && (
          <Text color="gray.500" _dark={{ color: "gray.400" }} textAlign="center" py={4}>
            No notification preferences available.
          </Text>
        )}
      </Stack>
    </Box>
  );
}

NotificationPreferenceSection.propTypes = {
  /**
   * The title of the notification section.
   */
  title: PropTypes.string.isRequired,
  /**
   * An array of notification preference objects.
   * Each object defines a toggle or selector preference.
   */
  preferences: PropTypes.arrayOf(preferencePropTypes),
};

NotificationPreferenceSection.defaultProps = {
  preferences: [],
};