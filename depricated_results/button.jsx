import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A standard clickable button component.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - Text displayed on the button.
 * @param {function} [props.onClick] - Callback function when the button is clicked.
 * @param {string} [props.variant='solid'] - Visual style of the button (e.g., 'solid', 'outline', 'ghost', 'link', 'unstyled').
 * @param {string} [props.colorScheme='blue'] - The color scheme of the button.
 * @param {string} [props.size='md'] - The size of the button (e.g., 'sm', 'md', 'lg').
 * @param {boolean} [props.isDisabled=false] - If true, the button will be disabled.
 * @param {boolean} [props.isLoading=false] - If true, the button will show a spinner.
 * @param {string} [props.loadingText] - Text to display when the button is loading.
 * @param {string} [props.type='button'] - The type of the button (e.g., 'button', 'submit', 'reset').
 * @param {object} [props.sx] - Custom style properties for the button.
 */
export default function Button({
  label,
  onClick = () => {},
  variant = 'solid',
  colorScheme = 'blue',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  loadingText,
  type = 'button',
  sx,
  ...rest
}) {
  return (
    <ChakraButton
      onClick={onClick}
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      isDisabled={isDisabled}
      isLoading={isLoading}
      loadingText={loadingText}
      type={type}
      sx={sx}
      {...rest}
    >
      {label}
    </ChakraButton>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'link', 'unstyled']),
  colorScheme: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  sx: PropTypes.object,
};