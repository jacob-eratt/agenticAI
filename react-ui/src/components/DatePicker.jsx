import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * DatePicker component for selecting a single date.
 * It leverages Chakra UI's FormControl and Input components to provide a styled and accessible date input.
 *
 * @param {object} props - The component props.
 * @param {string} [props.value=''] - The currently selected date. This can be an ISO 8601 string (e.g., "2023-10-27T10:00:00.000Z") or a YYYY-MM-DD string. It will be formatted to YYYY-MM-DD for the native date input.
 * @param {function} [props.onChange] - Callback function when the date changes. It receives the new date string in YYYY-MM-DD format as its argument.
 * @param {string} [props.label] - Label for the date picker, e.g., "Start Date". If provided, a FormLabel will be rendered.
 * @param {string} [props.colorScheme='blue'] - The color scheme to use for the input's focus border.
 * @param {string} [props.size='md'] - The size of the input field (e.g., 'sm', 'md', 'lg').
 * @param {object} [props.sx] - Chakra UI `sx` prop for custom styles applied to the `FormControl`.
 * @param {object} [props.rest] - Additional Chakra UI props passed directly to the `FormControl` component (e.g., `mb`, `width`).
 */
function DatePicker({
  value,
  onChange,
  label,
  colorScheme,
  size,
  sx,
  ...rest
}) {
  /**
   * Formats the input value to YYYY-MM-DD for the HTML date input.
   * If the value is an ISO string, it converts it. Otherwise, it uses the value directly
   * or defaults to an empty string if no value is provided.
   */
  const formattedValue = value
    ? new Date(value).toISOString().split('T')[0]
    : '';

  /**
   * Handles the change event from the native date input.
   * Calls the `onChange` prop with the new date value in YYYY-MM-DD format.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event object.
   */
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl sx={sx} {...rest}>
      {label && <FormLabel>{label}</FormLabel>}
      <Input
        type="date"
        value={formattedValue}
        onChange={handleChange}
        size={size}
        focusBorderColor={`${colorScheme}.500`}
      />
    </FormControl>
  );
}

DatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  colorScheme: PropTypes.string,
  size: PropTypes.string,
  sx: PropTypes.object,
};

DatePicker.defaultProps = {
  value: '',
  onChange: () => {},
  label: '',
  colorScheme: 'blue',
  size: 'md',
  sx: {},
};

export default DatePicker;