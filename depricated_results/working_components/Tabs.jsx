import React, { useState, useCallback } from 'react';
import {
  Tabs as ChakraTabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  useTheme,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} TabsProps
 * @property {number} [defaultIndex=0] - The index of the tab to be open by default.
 * @property {(index: number) => void} [onChange] - Callback function when the active tab changes.
 * @property {React.ReactNode} children - The content of the tabs, typically `TabList` and `TabPanels` components.
 * @property {string} [variant='enclosed'] - The visual style of the tabs. Can be 'line', 'enclosed', 'enclosed-colored', 'soft-rounded', 'solid-rounded', or 'unstyled'.
 * @property {string} [colorScheme='blue'] - The color scheme of the tabs.
 * @property {string} [size='md'] - The size of the tabs. Can be 'sm', 'md', or 'lg'.
 * @property {boolean} [isFitted=false] - If `true`, tabs will take up the full width of their container.
 * @property {boolean} [isLazy=false] - If `true`, tab panels are rendered only when activated.
 * @property {boolean} [isManual=false] - If `true`, the tabs will be controlled manually.
 * @property {number} [index] - The controlled index of the active tab.
 */

/**
 * Tabs component for organizing content into multiple tabbed sections.
 *
 * This component provides a flexible and accessible way to display content
 * in a tabbed interface, leveraging Chakra UI's `Tabs` component.
 * It supports default active tab, change callbacks, and various styling options.
 *
 * @param {TabsProps} props - The props for the Tabs component.
 * @returns {JSX.Element} A Chakra UI Tabs component.
 */
export default function Tabs({
  defaultIndex = 0,
  onChange,
  children,
  variant = 'enclosed',
  colorScheme = 'blue',
  size = 'md',
  isFitted = false,
  isLazy = false,
  isManual = false,
  index: controlledIndex, // Renamed to avoid conflict with internal state
  ...rest
}) {
  const theme = useTheme();
  const [internalIndex, setInternalIndex] = useState(defaultIndex);

  // Determine the effective index to use: controlled (if provided) or internal state
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  /**
   * Handles the change event when a new tab is selected.
   * Updates the internal state and calls the external onChange prop if provided.
   * @param {number} newIndex - The index of the newly selected tab.
   */
  const handleTabsChange = useCallback(
    (newIndex) => {
      if (controlledIndex === undefined) {
        // Only update internal state if not controlled externally
        setInternalIndex(newIndex);
      }
      if (onChange) {
        onChange(newIndex);
      }
    },
    [onChange, controlledIndex]
  );

  return (
    <Box
      width="100%"
      p={4}
      borderRadius="md"
      bg="white"
      boxShadow="sm"
      _dark={{ bg: 'gray.700' }}
      {...rest}
    >
      <ChakraTabs
        index={activeIndex}
        onChange={handleTabsChange}
        variant={variant}
        colorScheme={colorScheme}
        size={size}
        isFitted={isFitted}
        isLazy={isLazy}
        isManual={isManual}
      >
        {children}
      </ChakraTabs>
    </Box>
  );
}

Tabs.propTypes = {
  /**
   * The index of the tab to be open by default.
   */
  defaultIndex: PropTypes.number,
  /**
   * Callback function when the active tab changes.
   * @param {number} index - The index of the newly active tab.
   */
  onChange: PropTypes.func,
  /**
   * The content of the tabs, typically `TabList` and `TabPanels` components.
   * Example: `<TabList><Tab>One</Tab></TabList><TabPanels><TabPanel>Content</TabPanel></TabPanels>`
   */
  children: PropTypes.node.isRequired,
  /**
   * The visual style of the tabs.
   * Can be 'line', 'enclosed', 'enclosed-colored', 'soft-rounded', 'solid-rounded', or 'unstyled'.
   */
  variant: PropTypes.oneOf([
    'line',
    'enclosed',
    'enclosed-colored',
    'soft-rounded',
    'solid-rounded',
    'unstyled',
  ]),
  /**
   * The color scheme of the tabs.
   */
  colorScheme: PropTypes.string,
  /**
   * The size of the tabs. Can be 'sm', 'md', or 'lg'.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * If `true`, tabs will take up the full width of their container.
   */
  isFitted: PropTypes.bool,
  /**
   * If `true`, tab panels are rendered only when activated.
   */
  isLazy: PropTypes.bool,
  /**
   * If `true`, the tabs will be controlled manually.
   */
  isManual: PropTypes.bool,
  /**
   * The controlled index of the active tab. If provided, the component becomes controlled.
   */
  index: PropTypes.number,
};

// Export Chakra UI's TabList, TabPanels, Tab, and TabPanel for convenience
export { TabList, TabPanels, Tab, TabPanel };