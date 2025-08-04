import React from 'react';
import { Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * TextDisplay component to render static or dynamic text with Chakra UI styling capabilities.
 * It acts as a wrapper around Chakra UI's Text component, allowing all Text component props
 * to be passed directly for extensive customization.
 *
 * @param {object} props - The props for the TextDisplay component.
 * @param {string} props.text - The text content to display. This is a required prop.
 * @param {object} [props.rest] - Any additional Chakra UI Text component props for styling (e.g., fontSize, color, fontWeight, mt, mb, textAlign, etc.).
 */
export default function TextDisplay({ text, ...rest }) {
  return (
    <Text {...rest}>
      {text}
    </Text>
  );
}

TextDisplay.propTypes = {
  /**
   * The text content to display.
   */
  text: PropTypes.string.isRequired,
  // All other Chakra UI Text component props are implicitly supported via `...rest`.
  // This allows for full customization of the underlying Chakra Text component.
};