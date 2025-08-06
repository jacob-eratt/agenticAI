import React, { useState, useEffect } from 'react';
import {
  Box,
  FormLabel,
  RadioGroup as ChakraRadioGroup, // Renaming to avoid conflict with component name
  Radio,
  Stack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A group of radio buttons for selecting a single option from a list.
 * This component provides a flexible and accessible way to render radio button groups
 * using Chakra UI, supporting various styling and layout options.
 *
 * @param {object} props - The component props.
 * @param {Array<string|object>} props.options - Array of options for the radio group. Each option can be a string (where label and value are the same) or an object { label: string, value: string }.
 * @param {string} props.value - The currently selected value of the radio group. This prop makes the component a controlled component.
 * @param {function} props.onChange - Callback function invoked when the selected value changes. It receives the new value as its first argument.
 * @param {string} [props.label] - An optional overall label for the radio group, displayed above the options.
 * @param {string} [props.colorScheme='blue'] - The color scheme for the radio buttons (e.g., 'blue', 'green', 'red').
 * @param {string} [props.size='md'] - The size of the radio buttons ('sm', 'md', 'lg').
 * @param {string|object} [props.direction='column'] - The layout direction of the radio buttons. Can be 'row' or 'column', and supports responsive values (e.g., `{ base: 'column', md: 'row' }`).
 * @param {string|number} [props.spacing='4'] - The spacing between individual radio buttons within the group.
 * @param {object} [props.groupProps={}] - An object of props to be passed directly to the underlying Chakra UI `RadioGroup` component.
 * @param {object} [props.labelProps={}] - An object of props to be passed directly to the `FormLabel` component used for the group label.
 * @param {object} [props.stackProps={}] - An object of props to be passed directly to the `Stack` component that wraps the individual `Radio` components.
 * @param {object} [props.rest] - Additional Chakra UI props (e.g., `p`, `m`, `bg`, `borderRadius`) to be applied to the main container `Box`.
 */
function RadioGroup({
  options = [],
  value,
  onChange,
  label,
  colorScheme = 'blue',
  size = 'md',
  direction = 'column',
  spacing = '4',
  groupProps = {},
  labelProps = {},
  stackProps = {},
  ...rest // Allows passing general Chakra UI Box props to the container
}) {
  const [internalValue, setInternalValue] = useState(value);

  // Update internal state if the external value prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  /**
   * Handles the change event from the Chakra UI RadioGroup.
   * Updates the internal state and calls the external onChange prop.
   * @param {string} newValue - The new selected value.
   */
  const handleChange = (newValue) => {
    setInternalValue(newValue);
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

  return (
    <Box {...rest}>
      {label && (
        <FormLabel mb={2} {...labelProps}>
          {label}
        </FormLabel>
      )}
      <ChakraRadioGroup
        onChange={handleChange}
        value={internalValue}
        {...groupProps}
      >
        <Stack direction={direction} spacing={spacing} {...stackProps}>
          {normalizedOptions.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              colorScheme={colorScheme}
              size={size}
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
   * or an object { label: string, value: string }.
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
  value: PropTypes.string.isRequired,
  /**
   * Callback function when the selected value changes. Receives the new value as an argument.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Overall label for the radio group.
   */
  label: PropTypes.string,
  /**
   * The color scheme for the radio buttons.
   */
  colorScheme: PropTypes.string,
  /**
   * The size of the radio buttons ('sm', 'md', 'lg').
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * The direction of the radio buttons layout ('row' or 'column'). Can be responsive.
   */
  direction: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object, // For responsive values like { base: 'column', md: 'row' }
  ]),
  /**
   * The spacing between radio buttons.
   */
  spacing: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  /**
   * Props to pass directly to the Chakra UI RadioGroup component.
   */
  groupProps: PropTypes.object,
  /**
   * Props to pass directly to the FormLabel component.
   */
  labelProps: PropTypes.object,
  /**
   * Props to pass directly to the Stack component wrapping the radios.
   */
  stackProps: PropTypes.object,
};

export default RadioGroup;