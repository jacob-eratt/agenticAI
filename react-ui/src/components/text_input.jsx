import React from 'react';
import { Input } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A text input field for user entry.
 *
 * @param {object} props - The component props.
 * @param {string} [props.value=''] - The current value of the input.
 * @param {function} [props.onChange] - Callback function when the input value changes.
 * @param {string} [props.placeholder=''] - Placeholder text for the input field.
 * @param {string} [props.ariaLabel] - Accessibility label for the input.
 * @param {string} [props.size='md'] - The size of the input.
 * @param {string} [props.variant='outline'] - The variant of the input.
 * @param {string} [props.focusBorderColor='blue.500'] - The border color when the input is focused.
 * @param {string} [props.errorBorderColor='red.500'] - The border color when the input is in an error state.
 */
export default function TextInput({
  value = '',
  onChange = () => {},
  placeholder = '',
  ariaLabel,
  size = 'md',
  variant = 'outline',
  focusBorderColor = 'blue.500',
  errorBorderColor = 'red.500',
  ...rest
}) {
  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      size={size}
      variant={variant}
      focusBorderColor={focusBorderColor}
      errorBorderColor={errorBorderColor}
      {...rest} // Allows passing any additional Chakra UI Input props
    />
  );
}

TextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  ariaLabel: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  focusBorderColor: PropTypes.string,
  errorBorderColor: PropTypes.string,
};