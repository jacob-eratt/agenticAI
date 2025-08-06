import React from 'react';
import { IconButton as ChakraIconButton } from '@chakra-ui/react';
import {
  FaSave,
  FaTrash,
  FaMapMarkerAlt,
  FaCog,
  FaMap,
  FaPlay,
  FaSearch,
  FaQuestionCircle // Default icon for unknown names
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * @typedef {object} IconButtonProps
 * @property {string} icon - The string name of the icon to display. Supported names include 'save', 'trash', 'location', 'settings', 'map_icon', 'play', 'search'.
 * @property {function} [onClick] - Callback function when the button is clicked.
 * @property {string} ariaLabel - Accessibility label for the button. This is required for accessibility.
 * @property {string} [colorScheme='gray'] - The color scheme of the button.
 * @property {string} [variant='ghost'] - The variant of the button.
 * @property {string} [size='md'] - The size of the button.
 * @property {boolean} [isLoading=false] - If true, the button will show a spinner.
 * @property {boolean} [isDisabled=false] - If true, the button will be disabled.
 * @property {string} [borderRadius='md'] - The border radius of the button.
 * @property {string} [fontSize='lg'] - The font size of the icon.
 */

/**
 * A mapping of string icon names to React-icons components.
 * @type {Object.<string, React.ComponentType>}
 */
const IconMap = {
  save: FaSave,
  trash: FaTrash,
  location: FaMapMarkerAlt,
  settings: FaCog,
  map_icon: FaMap,
  play: FaPlay,
  search: FaSearch,
};

/**
 * IconButton component used to initiate actions with a visual icon.
 * It leverages Chakra UI's IconButton for styling and accessibility.
 *
 * @param {IconButtonProps} props - The props for the IconButton component.
 * @returns {JSX.Element} A Chakra UI IconButton component.
 */
function IconButton({
  icon,
  onClick,
  ariaLabel,
  colorScheme = 'gray',
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  borderRadius = 'md',
  fontSize = 'lg',
  ...rest
}) {
  const IconComponent = IconMap[icon] || FaQuestionCircle;

  if (!ariaLabel) {
    console.warn('IconButton: "ariaLabel" prop is required for accessibility.');
  }

  return (
    <ChakraIconButton
      icon={<IconComponent fontSize={fontSize} />}
      onClick={onClick}
      aria-label={ariaLabel}
      colorScheme={colorScheme}
      variant={variant}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      borderRadius={borderRadius}
      {...rest}
    />
  );
}

IconButton.propTypes = {
  /**
   * The string name of the icon to display. Supported names include 'save', 'trash', 'location', 'settings', 'map_icon', 'play', 'search'.
   */
  icon: PropTypes.string.isRequired,
  /**
   * Callback function when the button is clicked.
   */
  onClick: PropTypes.func,
  /**
   * Accessibility label for the button. This is required for accessibility.
   */
  ariaLabel: PropTypes.string.isRequired,
  /**
   * The color scheme of the button.
   */
  colorScheme: PropTypes.string,
  /**
   * The variant of the button.
   */
  variant: PropTypes.string,
  /**
   * The size of the button.
   */
  size: PropTypes.string,
  /**
   * If true, the button will show a spinner.
   */
  isLoading: PropTypes.bool,
  /**
   * If true, the button will be disabled.
   */
  isDisabled: PropTypes.bool,
  /**
   * The border radius of the button.
   */
  borderRadius: PropTypes.string,
  /**
   * The font size of the icon.
   */
  fontSize: PropTypes.string,
};

export default IconButton;