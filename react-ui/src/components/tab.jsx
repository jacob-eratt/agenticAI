import React from 'react';
import PropTypes from 'prop-types';

/**
 * The `Tab` component is a conceptual representation of an individual tab item.
 * It is designed to be used as a child within a parent `Tabs` container component
 * (e.g., Chakra UI's `Tabs` or a custom wrapper).
 *
 * This component itself does not render any visible UI elements directly.
 * Instead, it serves as a container for the properties (`label` and `panelContent`)
 * that a parent `Tabs` component would consume to render the actual Chakra UI
 * `Tab` (the clickable button) and `TabPanel` (the content area) components.
 *
 * This pattern allows for a declarative way to define tab items, where the parent
 * component iterates over its `Tab` children to construct the full tab interface.
 */
const Tab = ({ label, panelContent }) => {
  // The props 'label' and 'panelContent' are intended to be consumed by a parent
  // component (e.g., a custom 'TabsContainer' or directly by Chakra UI's Tabs
  // if structured appropriately) that iterates over its children to construct
  // the Chakra UI Tabs structure (TabList, TabPanels, Tab, TabPanel).
  // This component itself does not render any direct UI elements.
  return null;
};

Tab.propTypes = {
  /**
   * Text label for the tab. This will typically be displayed on the clickable tab button.
   */
  label: PropTypes.string.isRequired,
  /**
   * Content to be displayed when this tab is active. This will typically be rendered
   * within the corresponding `TabPanel`.
   */
  panelContent: PropTypes.node.isRequired,
};

export default Tab;