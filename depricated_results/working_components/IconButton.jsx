import React from 'react';
import { IconButton as ChakraIconButton, useToast } from '@chakra-ui/react';
import {
  SearchIcon,
  CheckIcon,
  DeleteIcon,
  SettingsIcon,
  QuestionOutlineIcon,
  ExternalLinkIcon, // Can be used for general links/locations
  ArrowForwardIcon,
  StarIcon, // Could be used for save/favorite
} from '@chakra-ui/icons';
import PropTypes from 'prop-types';

/**
 * @typedef {object} IconButtonProps
 * @property {string} icon - The name of the icon to display. Supported names: 'search', 'save', 'trash', 'location', 'settings', 'map_icon', 'play'.
 * @property {function} [onClick] - Callback function when the button is clicked.
 * @property {string} ariaLabel - Accessibility label for the button. This is crucial for screen readers.
 * @property {string} [colorScheme='gray'] - The color scheme of the button.
 * @property {string} [variant='ghost'] - The variant of the button.
 * @property {string} [size='md'] - The size of the button.
 * @property {boolean} [isLoading=false] - If true, the button will show a spinner.
 * @property {boolean} [isDisabled=false] - If true, the button will be disabled.
 */

// Map string icon names to Chakra UI icon components
const IconMap = {
  search: SearchIcon,
  save: CheckIcon, // Using CheckIcon as a generic 'save' icon. Could be StarIcon or a custom one.
  trash: DeleteIcon,
  location: ExternalLinkIcon, // Using ExternalLinkIcon as a generic 'location' icon.
  settings: SettingsIcon,
  map_icon: ExternalLinkIcon, // Using ExternalLinkIcon for map.
  play: ArrowForwardIcon, // Using ArrowForwardIcon as a generic 'play' icon.
  // Add more mappings as needed
};

/**
 * A customizable icon button component using Chakra UI.
 * It supports various icons, click handlers, and accessibility features.
 *
 * @param {IconButtonProps} props - The props for the IconButton component.
 * @returns {JSX.Element} The IconButton component.
 */
export default function IconButton({
  icon,
  onClick = () => {},
  ariaLabel,
  colorScheme = 'gray',
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  ...rest
}) {
  const toast = useToast();

  // Get the icon component based on the provided string name
  const IconComponent = IconMap[icon];

  // Validate required props
  if (!ariaLabel) {
    console.warn('IconButton: "ariaLabel" prop is required for accessibility.');
    toast({
      title: 'Accessibility Warning',
      description: 'IconButton is missing "ariaLabel" prop. Please provide it for screen readers.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
      position: 'bottom-left',
    });
  }

  if (!icon) {
    console.warn('IconButton: "icon" prop is required.');
    toast({
      title: 'Component Warning',
      description: 'IconButton is missing "icon" prop. Please provide an icon name.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
      position: 'bottom-left',
    });
  }

  // Use a fallback icon if the provided icon name is not found in the map
  const RenderIcon = IconComponent || QuestionOutlineIcon;

  return (
    <ChakraIconButton
      icon={<RenderIcon />}
      onClick={onClick}
      aria-label={ariaLabel || 'Action button'} // Fallback aria-label for safety, but warning is already issued
      colorScheme={colorScheme}
      variant={variant}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled || !ariaLabel || !icon} // Disable if critical props are missing
      {...rest} // Allows passing any other Chakra UI IconButton props
    />
  );
}

IconButton.propTypes = {
  /**
   * The name of the icon to display. Supported names: 'search', 'save', 'trash', 'location', 'settings', 'map_icon', 'play'.
   */
  icon: PropTypes.string.isRequired,
  /**
   * Callback function when the button is clicked.
   */
  onClick: PropTypes.func,
  /**
   * Accessibility label for the button. This is crucial for screen readers.
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
};