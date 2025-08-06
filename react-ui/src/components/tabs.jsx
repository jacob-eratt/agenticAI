import React from 'react';
import { Tabs as ChakraTabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * Tabs component for organizing content into multiple tabbed sections.
 * It acts as a wrapper for Chakra UI's Tabs, providing common props and defaults.
 *
 * @param {object} props - The component props.
 * @param {number} [props.defaultIndex=0] - The index of the tab to be open by default.
 * @param {function} [props.onChange] - Callback function when the active tab changes.
 * @param {React.ReactNode} props.children - The content of the tabs, typically consisting of `TabList` and `TabPanels`.
 * @param {string} [props.colorScheme='blue'] - The color scheme of the tabs.
 * @param {string} [props.variant='line'] - The visual variant of the tabs.
 * @param {string} [props.size='md'] - The size of the tabs.
 * @param {string} [props.orientation='horizontal'] - The orientation of the tabs.
 * @param {boolean} [props.isFitted=false] - If true, tabs will take up the full width of the container.
 * @param {boolean} [props.isLazy=false] - If true, tab panels are rendered only when activated.
 * @param {boolean} [props.isManual=false] - If true, the tabs will be controlled manually.
 * @param {object} [props.sx] - The style object for the component, allowing direct Chakra UI style props.
 * @param {string|number|object} [props.padding] - Padding for the tabs container.
 * @param {string|number|object} [props.margin] - Margin for the tabs container.
 * @param {string|number|object} [props.borderRadius] - Border radius for the tabs container.
 * @param {string} [props.background] - Background color for the tabs container.
 * @param {string} [props.overflowY] - Specifies how to handle content that overflows the container's top and bottom edges.
 * @param {string|number} [props.maxH] - The maximum height of the tabs container.
 */
export default function Tabs({
  defaultIndex = 0,
  onChange,
  children,
  colorScheme = 'blue',
  variant = 'line',
  size = 'md',
  orientation = 'horizontal',
  isFitted = false,
  isLazy = false,
  isManual = false,
  sx,
  padding,
  margin,
  borderRadius,
  background,
  overflowY,
  maxH,
  ...rest
}) {
  return (
    <ChakraTabs
      defaultIndex={defaultIndex}
      onChange={onChange}
      colorScheme={colorScheme}
      variant={variant}
      size={size}
      orientation={orientation}
      isFitted={isFitted}
      isLazy={isLazy}
      isManual={isManual}
      sx={sx}
      padding={padding}
      margin={margin}
      borderRadius={borderRadius}
      background={background}
      overflowY={overflowY}
      maxH={maxH}
      {...rest}
    >
      {children}
    </ChakraTabs>
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
   * The content of the tabs, typically consisting of `TabList` and `TabPanels`.
   * Example: `<TabList><Tab>One</Tab></TabList><TabPanels><TabPanel>Content One</TabPanel></TabPanels>`
   */
  children: PropTypes.node.isRequired,
  /**
   * The color scheme of the tabs.
   */
  colorScheme: PropTypes.string,
  /**
   * The visual variant of the tabs.
   */
  variant: PropTypes.oneOf(['line', 'enclosed', 'enclosed-colored', 'soft-rounded', 'solid-rounded', 'unstyled']),
  /**
   * The size of the tabs.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * The orientation of the tabs.
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * If true, tabs will take up the full width of the container.
   */
  isFitted: PropTypes.bool,
  /**
   * If true, tab panels are rendered only when activated.
   */
  isLazy: PropTypes.bool,
  /**
   * If true, the tabs will be controlled manually.
   */
  isManual: PropTypes.bool,
  /**
   * The style object for the component, allowing direct Chakra UI style props.
   */
  sx: PropTypes.object,
  /**
   * Padding for the tabs container.
   */
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Margin for the tabs container.
   */
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Border radius for the tabs container.
   */
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Background color for the tabs container.
   */
  background: PropTypes.string,
  /**
   * Specifies how to handle content that overflows the container's top and bottom edges.
   */
  overflowY: PropTypes.string,
  /**
   * The maximum height of the tabs container.
   */
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};