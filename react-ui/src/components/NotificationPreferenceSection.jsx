import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Stack,
  Switch,
  Text,
  Select,
  CheckboxGroup,
  Checkbox,
  useToast,
  FormControl,
  FormLabel,
  Divider
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * NotificationPreferenceSection component displays and manages various notification preferences.
 * It supports toggles (Switch) and selectors (Select for single, CheckboxGroup for multi-select).
 *
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the notification section.
 * @param {Array<object>} [props.preferences=[]] - An array of notification preference objects.
 *   Each object can be:
 *   - { label: string, type: 'toggle', isChecked: boolean, onChange: function | string }
 *   - { label: string, type: 'selector', options: Array<string>, value: string | Array<string>, onChange: function | string }
 * @param {string} [props.colorScheme='blue'] - The color scheme for interactive elements.
 * @param {string} [props.variant='outline'] - The variant for the container. Can be 'outline' or 'elevated'.
 * @param {string} [props.size='md'] - The size for interactive elements (e.g., 'sm', 'md', 'lg').
 * @param {string} [props.borderRadius='md'] - The border radius for the container.
 * @param {string} [props.background='white'] - The background color for the container.
 * @param {string | number | object} [props.padding='6'] - The padding for the container.
 * @param {string | number | object} [props.margin='4'] - The margin for the container.
 * @param {string | number | object} [props.maxW='lg'] - The maximum width for the container.
 * @param {string} [props.overflowY='auto'] - Overflow-y behavior for scrollable content.
 * @param {string | number | object} [props.maxH='auto'] - Maximum height for scrollable content.
 */
function NotificationPreferenceSection({
  title,
  preferences = [],
  colorScheme = 'blue',
  variant = 'outline',
  size = 'md',
  borderRadius = 'md',
  background = 'white',
  padding = '6',
  margin = '4',
  maxW = 'lg',
  overflowY = 'auto',
  maxH = 'auto',
  ...rest
}) {
  const toast = useToast();

  // Internal state to manage preferences for demonstration.
  // In a real application, these would typically be managed by the parent component
  // and passed down as props, with onChange handlers updating the parent's state.
  const [internalPreferences, setInternalPreferences] = useState(() => {
    return preferences.map(pref => {
      if (pref.type === 'toggle') {
        return { ...pref, isChecked: pref.isChecked || false };
      } else if (pref.type === 'selector') {
        // Initialize value for selector: empty string for single, empty array for multi-select
        const initialValue = Array.isArray(pref.value) ? pref.value : (pref.value || '');
        return { ...pref, value: initialValue };
      }
      return pref;
    });
  });

  // Update internal state if the preferences prop changes from parent
  useEffect(() => {
    setInternalPreferences(preferences.map(pref => {
      if (pref.type === 'toggle') {
        return { ...pref, isChecked: pref.isChecked || false };
      } else if (pref.type === 'selector') {
        const initialValue = Array.isArray(pref.value) ? pref.value : (pref.value || '');
        return { ...pref, value: initialValue };
      }
      return pref;
    }));
  }, [preferences]);

  /**
   * Handles the change event for a toggle preference.
   * @param {number} index - The index of the preference in the array.
   * @param {boolean} newCheckedState - The new checked state of the toggle.
   * @param {function | string} originalOnChange - The original onChange handler provided in props.
   */
  const handleToggleChange = useCallback((index, newCheckedState, originalOnChange) => {
    setInternalPreferences(prevPrefs => {
      const newPrefs = [...prevPrefs];
      newPrefs[index] = { ...newPrefs[index], isChecked: newCheckedState };
      return newPrefs;
    });

    if (typeof originalOnChange === 'function') {
      originalOnChange(newCheckedState);
    } else if (typeof originalOnChange === 'string') {
      // For demonstration, if onChange is a string, show a toast.
      toast({
        title: `Toggle for "${preferences[index].label}" changed.`,
        description: `New state: ${newCheckedState}. (Handler: ${originalOnChange})`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [toast, preferences]);

  /**
   * Handles the change event for a selector preference.
   * @param {number} index - The index of the preference in the array.
   * @param {string | Array<string>} newValue - The new value(s) selected.
   * @param {function | string} originalOnChange - The original onChange handler provided in props.
   */
  const handleSelectorChange = useCallback((index, newValue, originalOnChange) => {
    setInternalPreferences(prevPrefs => {
      const newPrefs = [...prevPrefs];
      newPrefs[index] = { ...newPrefs[index], value: newValue };
      return newPrefs;
    });

    if (typeof originalOnChange === 'function') {
      originalOnChange(newValue);
    } else if (typeof originalOnChange === 'string') {
      // For demonstration, if onChange is a string, show a toast.
      toast({
        title: `Selector for "${preferences[index].label}" changed.`,
        description: `New value: ${Array.isArray(newValue) ? newValue.join(', ') : newValue}. (Handler: ${originalOnChange})`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [toast, preferences]);

  if (!title) {
    console.warn("NotificationPreferenceSection: 'title' prop is required.");
    return (
      <Box p={4} borderWidth={1} borderColor="red.300" borderRadius="md" bg="red.50">
        <Text color="red.700" fontWeight="bold">Error: Title is missing for NotificationPreferenceSection.</Text>
      </Box>
    );
  }

  return (
    <Box
      p={padding}
      m={margin}
      borderWidth={variant === 'outline' ? '1px' : '0'}
      borderRadius={borderRadius}
      bg={background}
      maxW={maxW}
      overflowY={overflowY}
      maxH={maxH}
      borderColor={variant === 'outline' ? `${colorScheme}.200` : 'transparent'}
      boxShadow={variant === 'elevated' ? 'md' : 'none'}
      {...rest}
    >
      <Heading as="h2" size="lg" mb={4} color={`${colorScheme}.700`}>
        {title}
      </Heading>

      {internalPreferences.length === 0 ? (
        <Text color="gray.500">No notification preferences available.</Text>
      ) : (
        <Stack spacing={4}>
          {internalPreferences.map((pref, index) => (
            <React.Fragment key={index}>
              {pref.type === 'toggle' && (
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel htmlFor={`notification-toggle-${index}`} mb="0" flex="1" mr={4} cursor="pointer">
                    <Text fontSize="md" fontWeight="medium" color="gray.700">{pref.label}</Text>
                  </FormLabel>
                  <Switch
                    id={`notification-toggle-${index}`}
                    isChecked={pref.isChecked}
                    onChange={(e) => handleToggleChange(index, e.target.checked, pref.onChange)}
                    colorScheme={colorScheme}
                    size={size}
                  />
                </FormControl>
              )}

              {pref.type === 'selector' && (
                <FormControl>
                  <FormLabel htmlFor={`notification-selector-${index}`}>
                    <Text fontSize="md" fontWeight="medium" color="gray.700">{pref.label}</Text>
                  </FormLabel>
                  {Array.isArray(pref.value) ? ( // Multi-select using CheckboxGroup
                    <CheckboxGroup
                      colorScheme={colorScheme}
                      value={pref.value}
                      onChange={(newValues) => handleSelectorChange(index, newValues, pref.onChange)}
                    >
                      <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} wrap="wrap">
                        {pref.options && pref.options.map((option, optIndex) => (
                          <Checkbox key={optIndex} value={option} size={size}>
                            {option}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  ) : ( // Single-select using Select
                    <Select
                      id={`notification-selector-${index}`}
                      value={pref.value}
                      onChange={(e) => handleSelectorChange(index, e.target.value, pref.onChange)}
                      placeholder="Select an option"
                      colorScheme={colorScheme}
                      size={size}
                    >
                      {pref.options && pref.options.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
              )}
              {/* Add a divider between preferences, but not after the last one */}
              {index < internalPreferences.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      )}
    </Box>
  );
}

NotificationPreferenceSection.propTypes = {
  /**
   * Title of the notification section.
   */
  title: PropTypes.string.isRequired,
  /**
   * Array of notification preference objects, each defining a toggle or selector.
   * Each object can be:
   * - { label: string, type: 'toggle', isChecked: boolean, onChange: function | string }
   * - { label: string, type: 'selector', options: Array<string>, value: string | Array<string>, onChange: function | string }
   */
  preferences: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['toggle', 'selector']).isRequired,
      isChecked: PropTypes.bool, // For type 'toggle'
      options: PropTypes.arrayOf(PropTypes.string), // For type 'selector'
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]), // For type 'selector'
      onChange: PropTypes.oneOfType([PropTypes.func, PropTypes.string]), // Can be a function or a string (for example purposes)
    })
  ),
  /**
   * The color scheme for interactive elements.
   */
  colorScheme: PropTypes.string,
  /**
   * The variant for the container. Can be 'outline' or 'elevated'.
   */
  variant: PropTypes.string,
  /**
   * The size for interactive elements (e.g., 'sm', 'md', 'lg').
   */
  size: PropTypes.string,
  /**
   * The border radius for the container.
   */
  borderRadius: PropTypes.string,
  /**
   * The background color for the container.
   */
  background: PropTypes.string,
  /**
   * The padding for the container.
   */
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * The margin for the container.
   */
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * The maximum width for the container.
   */
  maxW: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Overflow-y behavior for scrollable content.
   */
  overflowY: PropTypes.string,
  /**
   * Maximum height for scrollable content.
   */
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
};

export default NotificationPreferenceSection;