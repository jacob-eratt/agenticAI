import React from 'react';
import { Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A component to display static or dynamic text.
 * It leverages Chakra UI's Text component for consistent styling and theming.
 */
export default function TextDisplay({ text, ...rest }) {
  return (
    <Text
      fontSize={{ base: "md", md: "lg" }} // Responsive font size
      color="gray.700" // Default text color
      fontWeight="normal" // Default font weight
      lineHeight="tall" // Default line height for readability
      {...rest} // Allows passing any additional Chakra UI Text props
    >
      {text}
    </Text>
  );
}

TextDisplay.propTypes = {
  /**
   * The text content to display.
   */
  text: PropTypes.string.isRequired,
  // Any additional Chakra UI Text props can be passed through `...rest`
  // For example: fontSize, color, fontWeight, textAlign, etc.
};