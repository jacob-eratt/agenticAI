import React from 'react';
import { FormControl, FormLabel, Input, Box, useId } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * DatePicker component for selecting a single date.
 * It leverages Chakra UI's FormControl, FormLabel, and Input components
 * to provide a customizable and accessible date input field.
 *
 * @param {object} props - The component props.
 * @param {string} [props.value=''] - The currently selected date in 'YYYY-MM-DD' format.
 *   This value is passed directly to the HTML input's `value` attribute.
 * @param {function} [props.onChange=(date) => {}] - Callback function invoked when the date changes.
 *   It receives the new date string in 'YYYY-MM-DD' format as its argument.
 * @param {string} [props.label=''] - The text label displayed above the date input.
 *   If an empty string, no label will be rendered.
 * @param {string} [props.id] - An optional ID for the form control and input element.
 *   If not provided, a unique ID will be generated automatically for accessibility.
 * @param {object} [props.inputProps={}] - An object containing additional props to pass directly
 *   to the Chakra UI `Input` component (e.g., `size`, `variant`, `placeholder`).
 * @param {object} [props.formControlProps={}] - An object containing additional props to pass directly
 *   to the Chakra UI `FormControl` component (e.g., `isInvalid`, `isDisabled`, `isRequired`).
 */
export default function DatePicker({
  value = '',
  onChange = () => {},
  label = '',
  id,
  inputProps = {},
  formControlProps = {},
}) {
  const generatedId = useId();
  const inputId = id || `date-picker-${generatedId}`;

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box>
      <FormControl id={inputId} {...formControlProps}>
        {label && (
          <FormLabel htmlFor={inputId} mb={1} fontWeight="medium" color="gray.700">
            {label}
          </FormLabel>
        )}
        <Input
          type="date"
          value={value}
          onChange={handleChange}
          size="md"
          variant="outline"
          focusBorderColor="blue.500"
          borderRadius="md"
          _hover={{ borderColor: 'gray.400' }}
          _focus={{ boxShadow: 'outline' }}
          {...inputProps}
        />
      </FormControl>
    </Box>
  );
}

DatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
};