import React, { useState, useEffect, useId } from 'react';
import { Box, Text, RadioGroup as ChakraRadioGroup, Radio, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} RadioOption
 * @property {string} label - The display label for the radio option.
 * @property {string} value - The unique value associated with the radio option.
 */

/**
 * RadioGroup component for selecting a single option from a list of radio buttons.
 * It supports both simple string arrays for options (where label and value are the same)
 * and arrays of objects with explicit label and value properties.
 *
 * @param {object} props - The component props.
 * @param {Array<string | RadioOption>} props.options - Array of options. Each option can be a string (where label and value are the same) or an object { label: string, value: string }. This prop is required.
 * @param {string} [props.value] - The currently selected value. This prop makes the component a controlled component.
 * @param {function(string): void} [props.onChange] - Callback function when the selected value changes. Receives the new value as an argument.
 * @param {string} [props.label] - Overall label for the radio group, providing an accessible name.
 * @param {string} [props.colorScheme='blue'] - The color scheme for the radio buttons (e.g., 'blue', 'green', 'red').
 * @param {string} [props.size='md'] - The size of the radio buttons ('sm', 'md', 'lg').
 * @param {'row' | 'column'} [props.direction='column'] - The direction of the radio button stack ('row' or 'column').
 * @param {object} [props.containerProps] - Chakra UI props to apply to the outer Box container that wraps the entire component.
 * @param {object} [props.groupProps] - Chakra UI props to apply directly to the Chakra UI RadioGroup component.
 * @param {object} [props.radioProps] - Chakra UI props to apply to individual Radio components within the group.
 * @param {object} [rest] - Additional Chakra UI props passed directly to the root Box container.
 */
export default function RadioGroup({
  options = [],
  value,
  onChange,
  label,
  colorScheme = 'blue',
  size = 'md',
  direction = 'column',
  containerProps,
  groupProps,
  radioProps,
  ...rest
}) {
  const [selectedValue, setSelectedValue] = useState(value);
  const labelId = useId();

  // Update internal state if the external 'value' prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  /**
   * Handles the change event from the Chakra UI RadioGroup.
   * Updates internal state and calls the external onChange prop.
   * @param {string} newValue - The new selected value.
   */
  const handleRadioChange = (newValue) => {
    setSelectedValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Normalize options to { label, value } format for consistent rendering
  const normalizedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option };
    }
    return option;
  });

  // Provide a warning if options are missing or empty
  if (!Array.isArray(options) || options.length === 0) {
    console.warn("RadioGroup: 'options' prop is required and must be a non-empty array.");
    return null; // Render nothing if options are invalid
  }

  return (
    <Box {...containerProps} {...rest}>
      {label && (
        <Text
          id={labelId}
          fontSize="md"
          fontWeight="semibold"
          mb={2}
          color="gray.700"
          _dark={{ color: "gray.200" }}
        >
          {label}
        </Text>
      )}
      <ChakraRadioGroup
        value={selectedValue}
        onChange={handleRadioChange}
        aria-labelledby={label ? labelId : undefined} // Link label to the group for accessibility
        {...groupProps}
      >
        <Stack direction={direction} spacing={4}>
          {normalizedOptions.map((option) => (
            <Radio
              key={option.value} // Use value as key for uniqueness
              value={option.value}
              colorScheme={colorScheme}
              size={size}
              {...radioProps}
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
   * Array of options. Each option can be a string (where label and value are the same)
   * or an object `{ label: string, value: string }`. This prop is required.
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
   * The currently selected value. This prop makes the component a controlled component.
   */
  value: PropTypes.string,
  /**
   * Callback function when the selected value changes. Receives the new value as an argument.
   */
  onChange: PropTypes.func,
  /**
   * Overall label for the radio group, providing an accessible name.
   */
  label: PropTypes.string,
  /**
   * The color scheme for the radio buttons (e.g., 'blue', 'green', 'red').
   */
  colorScheme: PropTypes.string,
  /**
   * The size of the radio buttons ('sm', 'md', 'lg').
   */
  size: PropTypes.string,
  /**
   * The direction of the radio button stack ('row' or 'column').
   */
  direction: PropTypes.oneOf(['row', 'column']),
  /**
   * Chakra UI props to apply to the outer Box container that wraps the entire component.
   */
  containerProps: PropTypes.object,
  /**
   * Chakra UI props to apply directly to the Chakra UI RadioGroup component.
   */
  groupProps: PropTypes.object,
  /**
   * Chakra UI props to apply to individual Radio components within the group.
   */
  radioProps: PropTypes.object,
};