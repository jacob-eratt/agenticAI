import React from 'react';
import { IconButton as ChakraIconButton } from '@chakra-ui/react';
import {
  SearchIcon,
  DeleteIcon,
  SettingsIcon,
  QuestionOutlineIcon,
  PlayIcon,
  ArrowForwardIcon,
  DownloadIcon, // Used for 'save'
} from '@chakra-ui/icons';
import PropTypes from 'prop-types';

// Helper function to map string icon names to Chakra UI icon components
const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'search':
      return <SearchIcon />;
    case 'save':
      return <DownloadIcon />; // Using DownloadIcon as a common representation for 'save'
    case 'trash':
      return <DeleteIcon />;
    case 'location':
    case 'map_icon':
      return <ArrowForwardIcon />; // Represents navigation or a point of interest
    case 'settings':
      return <SettingsIcon />;
    case 'play':
      return <PlayIcon />;
    default:
      // Fallback for unknown icon names, with a console warning for development
      console.warn(`Unknown icon name: "${iconName}". Using QuestionOutlineIcon as fallback.`);
      return <QuestionOutlineIcon />;
  }
};

/**
 * An icon button used to initiate an action.
 * It displays an icon and triggers a callback when clicked.
 * This component leverages Chakra UI's IconButton for consistent styling and accessibility.
 */
export default function IconButton({ icon, onClick, ariaLabel, ...rest }) {
  const IconComponent = getIconComponent(icon);

  return (
    <ChakraIconButton
      icon={IconComponent}
      onClick={onClick}
      aria-label={ariaLabel}
      variant="ghost" // Default variant for a subtle look
      size="md" // Default medium size
      colorScheme="gray" // Default color scheme
      isRound={true} // Makes the button round, common for icon buttons
      {...rest} // Allows overriding default props like variant, size, colorScheme, etc.
    />
  );
}

IconButton.propTypes = {
  /**
   * Name of the icon to display.
   * Supported values: 'search', 'save', 'trash', 'location', 'map_icon', 'settings', 'play'.
   * Falls back to a question mark icon if the name is not recognized.
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
   * Any additional Chakra UI IconButton props to customize the button's appearance or behavior.
   * E.g., `colorScheme`, `variant`, `size`, `isDisabled`, `isLoading`, etc.
   */
  // eslint-disable-next-line react/forbid-prop-types
  rest: PropTypes.object,
};

IconButton.defaultProps = {
  onClick: () => {}, // Provide a no-op default for onClick
  rest: {},
};