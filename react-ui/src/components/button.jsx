import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A standard clickable button component.
 *
 * This component wraps Chakra UI's Button, providing common props
 * for text, click handling, and visual variants, while also allowing
 * all other Chakra UI Button props to be passed through for extensive customization.
 */
function Button({ label, onClick, variant, ...rest }) {
  return (
    <ChakraButton
      onClick={onClick}
      variant={variant}
      // Spread any additional Chakra UI Button props for further customization
      {...rest}
    >
      {label}
    </ChakraButton>
  );
}

Button.propTypes = {
  /**
   * Text displayed on the button.
   */
  label: PropTypes.string.isRequired,
  /**
   * Callback function when the button is clicked.
   */
  onClick: PropTypes.func,
  /**
   * Visual style of the button (e.g., "solid", "outline", "ghost", "link", "unstyled").
   * Defaults to "solid".
   */
  variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'link', 'unstyled']),
  // Chakra UI appearance props can be passed directly due to the spread operator
  // For example: colorScheme, size, isLoading, isDisabled, leftIcon, rightIcon, etc.
};

Button.defaultProps = {
  onClick: () => {},
  variant: 'solid',
};

export default Button;