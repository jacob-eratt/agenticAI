import React from 'react';
import { Box, FormLabel, RadioGroup as ChakraRadioGroup, Radio, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A group of radio buttons for selecting a single option from a list.
 * This component wraps Chakra UI's RadioGroup, providing a standardized
 * way to define options and a label.
 */
export default function RadioGroup({ options, value, onChange, label, ...rest }) {
  // Normalize options to always be { value, label } objects
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <Box {...rest}>
      {label && (
        <FormLabel
          mb={2}
          fontSize="md"
          fontWeight="semibold"
          color="gray.700"
          htmlFor={label.replace(/\s/g, '')} // Simple ID for association, consider more robust ID generation for multiple instances
        >
          {label}
        </FormLabel>
      )}
      <ChakraRadioGroup
        value={value}
        onChange={onChange}
        aria-labelledby={label ? label.replace(/\s/g, '') : undefined} // Associate with label for accessibility
      >
        <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
          {normalizedOptions.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              colorScheme="blue" // Default color scheme, can be overridden by parent via `rest` props on the RadioGroup or individual Radio
              size="md" // Default size, can be overridden
            >
              {option.label}
            </Radio>
          ))}
        </Stack>
      </ChakraRadioGroup>
    </Box>
  );
}

RadioGroup.propTypes = {
  /**
   * Array of objects, each with a label and a value for the radio options.
   * Can also be an array of strings, in which case the string is used for both value and label.
   * Example: `[{ value: 'option1', label: 'Option 1' }]` or `['Option 1', 'Option 2']`
   */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
    ])
  ).isRequired,
  /**
   * The currently selected value. This component is controlled.
   */
  value: PropTypes.string.isRequired,
  /**
   * Callback function when the selected value changes.
   * Receives the new selected value as its argument.
   * @param {string} nextValue - The new selected value.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Overall label for the radio group. This label is associated with the group for accessibility.
   */
  label: PropTypes.string,
};

RadioGroup.defaultProps = {
  label: undefined,
};