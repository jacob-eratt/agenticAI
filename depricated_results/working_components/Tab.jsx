import React from 'react';
import { Tab as ChakraTab } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} TabProps
 * @property {string} label - Text label for the tab. This will be displayed on the tab button.
 * @property {React.ReactNode} panelContent - The content to be displayed in the tab panel when this tab is active.
 *                                            This prop is consumed by a parent `Tabs` component and is not rendered directly by this `Tab` component.
 * @property {object} [tabProps] - Additional props to pass directly to the underlying Chakra UI `Tab` component,
 *                                  such as `isDisabled`, `colorScheme`, `variant`, etc.
 */

/**
 * An individual tab component designed to be used within a custom `Tabs` container.
 * This component serves as a declarative way to define a single tab, including its
 * visible label and the content associated with its panel.
 *
 * It renders the clickable tab header using Chakra UI's `Tab` component, displaying
 * the `label` prop. The `panelContent` prop is intended to be read and rendered
 * by a parent `Tabs` component (not provided here) to manage the active tab's content.
 *
 * @param {TabProps} props
 * @returns {JSX.Element}
 */
function Tab({ label, panelContent, ...tabProps }) {
  // The panelContent prop is not rendered by this component.
  // It's a data prop meant to be consumed by a parent Tabs component
  // to render the corresponding TabPanel.
  return (
    <ChakraTab
      // Chakra UI Tab component handles accessibility attributes automatically.
      // We pass through any additional props for customization.
      {...tabProps}
    >
      {label}
    </ChakraTab>
  );
}

Tab.propTypes = {
  /**
   * Text label for the tab. This will be displayed on the tab button.
   */
  label: PropTypes.string.isRequired,
  /**
   * The content to be displayed in the tab panel when this tab is active.
   * This prop is consumed by a parent `Tabs` component and is not rendered directly by this `Tab` component.
   */
  panelContent: PropTypes.node.isRequired,
  /**
   * Additional props to pass directly to the underlying Chakra UI `Tab` component,
   * such as `isDisabled`, `colorScheme`, `variant`, etc.
   */
  tabProps: PropTypes.object,
};

export default React.memo(Tab);