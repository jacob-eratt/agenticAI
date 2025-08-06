import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Text,
  CheckboxGroup,
  Checkbox,
  VStack,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A multi-select component for selecting multiple options from a list.
 * It supports both string arrays and object arrays for options, and is fully
 * controlled by the `value` and `onChange` props.
 *
 * @param {object} props - The component props.
 * @param {Array<object|string>} props.options - Array of options. Each option can be a string (e.g., "Option A") or an object with `label` and `value` properties (e.g., `{ label: "Option A", value: "a" }`).
 * @param {Array<any>} [props.value=[]] - Array of currently selected values. This makes the component controlled.
 * @param {function} props.onChange - Callback function when the selected values change. Receives an array of selected values as its argument. This prop is required for controlled components.
 * @param {string} [props.label] - Overall label for the multi-select component, displayed above the options.
 * @param {string} [props.colorScheme='blue'] - The color scheme for the checkboxes (e.g., 'blue', 'green', 'purple').
 * @param {string} [props.size='md'] - The size of the checkboxes ('sm', 'md', 'lg').
 * @param {string|number|Array<string|number>} [props.spacing='4'] - The spacing between individual checkboxes. Can be a string (e.g., '4px'), number (e.g., 4), or responsive array.
 * @param {string|number|Array<string|number>} [props.padding='4'] - Padding around the entire component box. Can be a string (e.g., '16px'), number (e.g., 4), or responsive array.
 * @param {string|number|Array<string|number>} [props.margin='0'] - Margin around the entire component box. Can be a string (e.g., '8px'), number (e.g., 2), or responsive array.
 * @param {string} [props.borderRadius='md'] - Border radius for the component box (e.g., 'sm', 'md', 'lg', 'full').
 * @param {string|number|Array<string|number>} [props.fontSize='md'] - Font size for the label. Can be a string (e.g., 'lg'), number (e.g., 16), or responsive array.
 * @param {string|number} [props.fontWeight='bold'] - Font weight for the label (e.g., 'normal', 'bold', '500').
 * @param {string} [props.background='white'] - Background color for the component box.
 * @param {string|number|Array<string|number>} [props.maxH] - Maximum height for the scrollable content area. Can be a string (e.g., '200px'), number (e.g., '200'), or responsive array.
 * @param {string} [props.overflowY='auto'] - Overflow behavior for the content area, typically 'auto' for scrollable content.
 * @param {object} [props.sx] - The Chakra UI `sx` prop for custom styles.
 */
function MultiSelect({
  options,
  value = [],
  onChange,
  label,
  colorScheme = 'blue',
  size = 'md',
  spacing = '4',
  padding = '4',
  margin = '0',
  borderRadius = 'md',
  fontSize = 'md',
  fontWeight = 'bold',
  background = 'white',
  maxH,
  overflowY = 'auto',
  ...rest
}) {
  // Process options to ensure they are in { label, value } format
  const processedOptions = useMemo(() => {
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
      console.warn("MultiSelect: Each option in 'options' prop should be a string or an object with 'label' and 'value' properties.", option);
      return null; // Filter out invalid options later
    }).filter(Boolean); // Remove any nulls resulting from invalid options
  }, [options]);

  // Internal state for selected values, controlled by the 'value' prop
  const [selectedValues, setSelectedValues] = useState(value);

  // Update internal state when external 'value' prop changes
  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  // Handle change event from CheckboxGroup
  const handleChange = useCallback((newValues) => {
    setSelectedValues(newValues);
    if (onChange) {
      onChange(newValues);
    } else {
      // Provide a runtime warning if onChange is missing for a controlled component
      console.warn("MultiSelect: 'onChange' prop is missing. The component is controlled but has no way to communicate changes back to the parent. Please provide an 'onChange' function.");
    }
  }, [onChange]);

  return (
    <Box
      p={padding}
      m={margin}
      borderWidth={1}
      borderRadius={borderRadius}
      bg={background}
      maxH={maxH}
      overflowY={overflowY}
      {...rest} // Allows passing additional Chakra UI Box props like width, height, etc.
    >
      {label && (
        <Text fontSize={fontSize} mb={2} fontWeight={fontWeight} color="gray.700">
          {label}
        </Text>
      )}

      <CheckboxGroup colorScheme={colorScheme} value={selectedValues} onChange={handleChange}>
        <VStack align="stretch" spacing={spacing}>
          {processedOptions.length > 0 ? (
            processedOptions.map((option) => (
              <Checkbox key={option.value} value={option.value} size={size}>
                {option.label}
              </Checkbox>
            ))
          ) : (
            <Text color="gray.500" fontStyle="italic">No options available.</Text>
          )}
        </VStack>
      </CheckboxGroup>
    </Box>
  );
}

MultiSelect.propTypes = {
  /**
   * Array of options. Each option can be a string (which will be converted to { label: string, value: string })
   * or an object with `label` and `value` properties.
   */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
      }),
    ])
  ).isRequired,
  /**
   * Array of currently selected values. This makes the component controlled.
   */
  value: PropTypes.array,
  /**
   * Callback function when the selected values change. Receives an array of selected values.
   * This prop is required for controlled components.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Overall label for the multi-select component.
   */
  label: PropTypes.string,
  /**
   * The color scheme for the checkboxes.
   */
  colorScheme: PropTypes.string,
  /**
   * The size of the checkboxes ('sm', 'md', 'lg').
   */
  size: PropTypes.string,
  /**
   * The spacing between checkboxes. Can be a string, number, or responsive array.
   */
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /**
   * Padding around the entire component box. Can be a string, number, or responsive array.
   */
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /**
   * Margin around the entire component box. Can be a string, number, or responsive array.
   */
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /**
   * Border radius for the component box.
   */
  borderRadius: PropTypes.string,
  /**
   * Font size for the label. Can be a string, number, or responsive array.
   */
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /**
   * Font weight for the label.
   */
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * Background color for the component box.
   */
  background: PropTypes.string,
  /**
   * Maximum height for the scrollable content area. Can be a string, number, or responsive array.
   */
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  /**
   * Overflow behavior for the content area.
   */
  overflowY: PropTypes.string,
  /**
   * The Chakra UI `sx` prop for custom styles.
   */
  sx: PropTypes.object,
};

export default MultiSelect;