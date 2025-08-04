import React from 'react';
import PropTypes from 'prop-types';
import { Tabs as ChakraTabs, TabList, TabPanels, Tab, TabPanel, Box } from '@chakra-ui/react';

/**
 * A container component for organizing content into multiple tabbed sections.
 * It wraps Chakra UI's Tabs component, providing a convenient way to manage
 * default active tab and tab change events.
 *
 * @param {object} props - The component props.
 * @param {number} [props.defaultIndex=0] - The index of the tab to be open by default.
 * @param {function} [props.onChange] - Callback function when the active tab changes.
 * @param {React.ReactNode} props.children - The content to be rendered inside the Tabs component, typically `TabList` and `TabPanels`.
 * @param {object} [props.rest] - Additional Chakra UI props to pass to the underlying Tabs component.
 */
export default function Tabs({ defaultIndex = 0, onChange, children, ...rest }) {
  return (
    <Box width="100%">
      <ChakraTabs
        defaultIndex={defaultIndex}
        onChange={onChange}
        variant="enclosed" // A common and visually distinct variant for tabs
        colorScheme="blue" // Default color scheme for the tabs
        isLazy // Render tab panel content only when it's selected
        {...rest}
      >
        {children}
      </ChakraTabs>
    </Box>
  );
}

Tabs.propTypes = {
  /**
   * The index of the tab to be open by default.
   * @type {number}
   */
  defaultIndex: PropTypes.number,
  /**
   * Callback function when the active tab changes.
   * It receives the new index as an argument.
   * @type {function(number): void}
   */
  onChange: PropTypes.func,
  /**
   * The content to be rendered inside the Tabs component.
   * This should typically include Chakra UI's `TabList` and `TabPanels` components.
   * Example:
   */
}