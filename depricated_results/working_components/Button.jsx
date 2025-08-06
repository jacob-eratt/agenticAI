import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A standard clickable button component built with Chakra UI.
 * It provides common button functionalities and styling options.
 *
 * @param {object} props - The props for the Button component.
 * @param {string} props.label - Text displayed on the button. This prop is required.
 * @param {function} props.onClick - Callback function to be executed when the button is clicked. This prop is required.
 * @param {('ghost'|'outline'|'solid'|'link'|'unstyled')} [props.variant='solid'] - The visual style of the button.
 * @param {string} [props.colorScheme='blue'] - The color scheme of the button (e.g., 'blue', 'teal', 'red').
 * @param {('xs'|'sm'|'md'|'lg')} [props.size='md'] - The size of the button.
 * @param {boolean} [props.isLoading=false] - If true, the button will show a spinner and be disabled.
 * @param {boolean} [props.isDisabled=false] - If true, the button will be disabled.
 * @param {string} [props.type='button'] - The native HTML button type ('button', 'submit', 'reset').
 * @param {string} [props.ariaLabel] - Defines a string value that labels the current element for accessibility. Defaults to `label` if not provided.
 * @param {object} [props.sx] - Custom style properties for the button, using Chakra UI's `sx` prop.
 * @param {object} [props.rest] - Additional Chakra UI Button props to be spread onto the component (e.g., `width`, `height`, `margin`, `padding`).
 */
export default function Button({
  label,
  onClick,
  variant = 'solid',
  colorScheme = 'blue',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  type = 'button',
  ariaLabel,
  sx,
  ...rest
}) {
  // Provide runtime warnings for critical missing props in development environment
  if (process.env.NODE_ENV !== 'production') {
    if (!label) {
      console.warn('Button: The "label" prop is required for accessibility and display.');
    }
    if (!onClick) {
      console.warn('Button: The "onClick" prop is required for button functionality.');
    }
  }

  return (
    <ChakraButton
      onClick={onClick}
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      type={type}
      aria-label={ariaLabel || label} // Ensure accessibility by providing an aria-label
      sx={sx}
      {...rest}
    >
      {label}
    </ChakraButton>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['ghost', 'outline', 'solid', 'link', 'unstyled']),
  colorScheme: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  ariaLabel: PropTypes.string,
  sx: PropTypes.object,
};

Button.defaultProps = {
  variant: 'solid',
  colorScheme: 'blue',
  size: 'md',
  isLoading: false,
  isDisabled: false,
  type: 'button',
  ariaLabel: undefined, // Let ChakraButton handle default if not explicitly provided
  sx: undefined,
};