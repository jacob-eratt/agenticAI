import React from 'react';
import { Box, CheckboxGroup, Checkbox, Stack, FormLabel } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Helper function to normalize options.
 * Converts string options into { label: string, value: string } objects
 * and ensures object options have both label and value.
 * @param {Array} options - The raw options array.
 * @returns {Array} Normalized options array.
 */
const normalizeOptions = (options) => {
  if (!Array.isArray(options)) {
    console.warn("MultiSelect: 'options' prop must be an array.");
    return [];
  }
  return options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    if (typeof option === 'object' && option !== null && 'label' in option && 'value' in option) {
      return option;
    }
    console.warn("MultiSelect: Invalid option format. Expected string or { label, value }.", option);
    return null; // Filter out invalid options
  }).filter(Boolean); // Remove any nulls from malformed options
};

/**
 * A multi-select component for selecting multiple options from a list.
 *
 * @param {Object} props - The component props.
 * @param {Array<string|Object>} props.options - Array of options. Each item can be a string (e.g., "Option A") or an object with `label` and `value` properties (e.g., `{ label: "Option A", value: "A" }`).
 * @param {Array<any>} props.value - Array of currently selected values.
 * @param {function(Array<any>): void} props.onChange - Callback function when the selected values change. Receives an array of the new selected values.
 * @param {string} props.label - Overall label for the multi-select component.
 */
export default function MultiSelect({ options = [], value = [], onChange, label }) {
  const normalizedOptions = normalizeOptions(options);

  const handleChange = (newValues) => {
    if (onChange) {
      onChange(newValues);
    }
  };

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      bg="white"
      maxW={{ base: "100%", md: "md" }}
      mx="auto"
      boxShadow="sm"
      aria-labelledby={label ? `multi-select-label-${label.replace(/\s/g, '-')}` : undefined}
    >
      {label && (
        <FormLabel
          mb={3}
          fontSize="lg"
          fontWeight="bold"
          color="gray.700"
          id={label ? `multi-select-label-${label.replace(/\s/g, '-')}` : undefined}
        >
          {label}
        </FormLabel>
      )}
      <CheckboxGroup value={value} onChange={handleChange}>
        <Stack
          spacing={3}
          direction={{ base: "column", sm: "row" }}
          wrap="wrap"
          align="flex-start" // Align items to the start in case of wrapping
        >
          {normalizedOptions.map((option) => (
            <Checkbox
              key={option.value}
              value={option.value}
              colorScheme="blue"
              size="md"
              _hover={{ bg: "blue.50" }}
              _checked={{ bg: "blue.100", borderColor: "blue.500" }}
              borderColor="gray.300"
              borderRadius="sm"
              p={1} // Add a little padding around the checkbox for better click area
            >
              {option.label}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
    </Box>
  );
}

MultiSelect.propTypes = {
  /**
   * Array of options. Each item can be a string (e.g., "Option A") or an object
   * with `label` and `value` properties (e.g., `{ label: "Option A", value: "A" }`).
   */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
      }),
    ])
  ),
  /**
   * Array of currently selected values.
   */
  value: PropTypes.array,
  /**
   * Callback function when the selected values change.
   * Receives an array of the new selected values.
   */
  onChange: PropTypes.func,
  /**
   * Overall label for the multi-select component.
   */
  label: PropTypes.string,
};

MultiSelect.defaultProps = {
  options: [],
  value: [],
  onChange: () => {},
  label: '',
};