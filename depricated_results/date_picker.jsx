import React from 'react';
import { FormControl, FormLabel, Input, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A component for selecting a single date.
 *
 * @param {object} props - The component props.
 * @param {string} [props.value] - The currently selected date in ISO format (YYYY-MM-DD).
 * @param {function} [props.onChange] - Callback function when the date changes. Receives the new date string (YYYY-MM-DD) as an argument.
 * @param {string} [props.label] - Label for the date picker, e.g., "Start Date".
 */
export default function DatePicker({ value, onChange, label }) {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <Box>
      <FormControl id={label ? label.replace(/\s+/g, '-') : undefined}>
        {label && (
          <FormLabel mb={1} fontSize="sm" fontWeight="medium" color="gray.700">
            {label}
          </FormLabel>
        )}
        <Input
          type="date"
          value={value || ''} // Ensure value is a controlled component, default to empty string
          onChange={handleChange}
          size="md"
          borderRadius="md"
          borderColor="gray.300"
          _hover={{ borderColor: 'gray.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
          aria-label={label || "Date picker"}
        />
      </FormControl>
    </Box>
  );
}

DatePicker.propTypes = {
  /**
   * The currently selected date in ISO format (YYYY-MM-DD).
   */
  value: PropTypes.string,
  /**
   * Callback function when the date changes. Receives the new date string (YYYY-MM-DD) as an argument.
   */
  onChange: PropTypes.func,
  /**
   * Label for the date picker, e.g., "Start Date".
   */
  label: PropTypes.string,
};

DatePicker.defaultProps = {
  value: '',
  onChange: () => {},
  label: '',
};