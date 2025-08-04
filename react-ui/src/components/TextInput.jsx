import React from 'react';
import { Input } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} TextInputProps
 * @property {string} [value=''] - The current value of the input.
 * @property {(event: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - Callback function when the input value changes.
 * @property {string} [placeholder=''] - Placeholder text for the input field.
 * @property {string} [ariaLabel='Text input field'] - Accessibility label for the input.
 * @property {string} [size='md'] - The size of the input. Options: 'sm', 'md', 'lg'.
 * @property {string} [variant='outline'] - The visual style of the input. Options: 'outline', 'filled', 'flushed', 'unstyled'.
 * @property {string} [colorScheme='gray'] - The color scheme of the input.
 * @property {boolean} [isDisabled=false] - If true, the input will be disabled.
 * @property {boolean} [isReadOnly=false] - If true, the input will be read-only.
 * @property {boolean} [isInvalid=false] - If true, the input will be marked as invalid.
 * @property {boolean} [isRequired=false] - If true, the input will be marked as required.
 * @property {string} [type='text'] - The type of the input. E.g., 'text', 'email', 'password', 'number'.
 * @property {string} [id] - The ID of the input element.
 * @property {string} [name] - The name of the input element.
 */

/**
 * A customizable text input field for user entry, built with Chakra UI.
 * Supports standard HTML input attributes and Chakra UI styling props.
 *
 * @param {TextInputProps} props - The props for the TextInput component.
 * @returns {JSX.Element} A Chakra UI Input component.
 */
export default function TextInput({
  value = '',
  onChange = () => {},
  placeholder = '',
  ariaLabel = 'Text input field',
  size = 'md',
  variant = 'outline',
  colorScheme = 'gray',
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  isRequired = false,
  type = 'text',
  id,
  name,
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
      colorScheme={colorScheme}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      isRequired={isRequired}
      type={type}
      id={id}
      name={name}
      {...rest} // Allows passing any additional Chakra UI Input props
    />
  );
}

TextInput.propTypes = {
  /**
   * The current value of the input.
   */
  value: PropTypes.string,
  /**
   * Callback function when the input value changes.
   * Receives the event object: `(event: React.ChangeEvent<HTMLInputElement>) => void`.
   */
  onChange: PropTypes.func,
  /**
   * Placeholder text for the input field.
   */
  placeholder: PropTypes.string,
  /**
   * Accessibility label for the input. Essential for screen readers.
   */
  ariaLabel: PropTypes.string,
  /**
   * The size of the input. Options: 'sm', 'md', 'lg'.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * The visual style of the input. Options: 'outline', 'filled', 'flushed', 'unstyled'.
   */
  variant: PropTypes.oneOf(['outline', 'filled', 'flushed', 'unstyled']),
  /**
   * The color scheme of the input.
   */
  colorScheme: PropTypes.string,
  /**
   * If true, the input will be disabled.
   */
  isDisabled: PropTypes.bool,
  /**
   * If true, the input will be read-only.
   */
  isReadOnly: PropTypes.bool,
  /**
   * If true, the input will be marked as invalid.
   */
  isInvalid: PropTypes.bool,
  /**
   * If true, the input will be marked as required.
   */
  isRequired: PropTypes.bool,
  /**
   * The type of the input. E.g., 'text', 'email', 'password', 'number'.
   */
  type: PropTypes.string,
  /**
   * The ID of the input element.
   */
  id: PropTypes.string,
  /**
   * The name of the input element.
   */
  name: PropTypes.string,
};