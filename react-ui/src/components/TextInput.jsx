import React from 'react';
import { Input } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A customizable text input field for user entry, built with Chakra UI.
 * It supports standard input functionalities and Chakra UI's styling props.
 *
 * @param {object} props - The component's props.
 * @param {string} [props.value=''] - The current value of the input field.
 * @param {function} [props.onChange] - Callback function invoked when the input value changes.
 *   Receives the event object as its argument.
 * @param {string} [props.placeholder=''] - Placeholder text displayed when the input is empty.
 * @param {string} props.ariaLabel - Accessibility label for the input field. This is crucial for screen readers.
 *   It is highly recommended to provide a meaningful label for accessibility.
 * @param {string} [props.size='md'] - The size of the input field. Can be 'sm', 'md', or 'lg'.
 * @param {string} [props.variant='outline'] - The visual variant of the input field. Can be 'outline', 'filled', 'flushed', or 'unstyled'.
 * @param {boolean} [props.isDisabled=false] - If true, the input field will be disabled.
 * @param {boolean} [props.isReadOnly=false] - If true, the input field will be read-only.
 * @param {boolean} [props.isInvalid=false] - If true, the input field will display an invalid state.
 * @param {string} [props.errorBorderColor='red.500'] - The border color when `isInvalid` is true.
 * @param {object} [props.sx] - The Chakra UI `sx` prop for custom styles.
 * @param {object} [props.rest] - Any other props supported by Chakra UI's Input component.
 */
function TextInput({
  value = '',
  onChange = () => {},
  placeholder = '',
  ariaLabel,
  size = 'md',
  variant = 'outline',
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  errorBorderColor = 'red.500',
  ...rest
}) {
  // Runtime warning for missing ariaLabel for better accessibility
  if (!ariaLabel) {
    console.warn(
      'TextInput: The `ariaLabel` prop is highly recommended for accessibility. ' +
        'Please provide a descriptive label for screen readers.'
    );
  }

  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      size={size}
      variant={variant}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      errorBorderColor={isInvalid ? errorBorderColor : undefined}
      {...rest}
    />
  );
}

TextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired, // Made required for accessibility best practice
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  isDisabled: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isInvalid: PropTypes.bool,
  errorBorderColor: PropTypes.string,
  sx: PropTypes.object, // Allow passing sx prop for custom styles
};

export default TextInput;