import React from 'react';
import { Tab as ChakraTab } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * An individual tab component to be used within a Tabs container.
 * This component renders the clickable tab button and serves as a data carrier
 * for its associated panel content. The `panelContent` prop is intended to be
 * consumed and rendered by a parent Tabs component (e.g., Chakra UI's TabPanels)
 * when this tab is active.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - Text label for the tab. This will be displayed on the tab button.
 * @param {React.ReactNode} props.panelContent - Content to be displayed when this tab is active.
 *   Note: This content is NOT rendered by the `Tab` component itself. It is a conceptual prop
 *   that a parent `Tabs` component should read and render within a `TabPanel` when this tab is selected.
 * @param {string} [props.colorScheme] - The color scheme for the tab. Inherits from Chakra UI theme if not specified.
 * @param {string} [props.variant] - The variant of the tab. Inherits from Chakra UI theme if not specified.
 * @param {string} [props.size] - The size of the tab. Inherits from Chakra UI theme if not specified.
 * @param {object} [props.sx] - The style props for the tab, allowing direct access to Chakra UI's `sx` prop.
 * @param {object} [props.rest] - Additional Chakra UI `Tab` props to be spread onto the underlying component.
 */
function Tab({ label, panelContent, ...rest }) {
  // The `panelContent` prop is not rendered by this component.
  // It's a conceptual prop meant for a parent component to consume
  // and render within a `TabPanel` when this tab is active.
  // The `label` is rendered as the children of the ChakraTab component.
  return (
    <ChakraTab {...rest}>
      {label}
    </ChakraTab>
  );
}

Tab.propTypes = {
  label: PropTypes.string.isRequired,
  panelContent: PropTypes.node.isRequired,
  // Chakra UI Tab appearance props
  colorScheme: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  sx: PropTypes.object,
  // All other props are passed through to the Chakra UI Tab component
  // For example, `isDisabled`, `isSelected`, `id`, `aria-controls`, etc.
};

export default Tab;