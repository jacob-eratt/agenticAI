import React from 'react';
import { FormControl, FormLabel, Switch, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A switch component to toggle settings on or off.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - Text label for the toggle.
 * @param {boolean} props.isChecked - Current checked state of the toggle.
 * @param {function} props.onChange - Callback function when the toggle state changes.
 */
export default function ToggleSwitch({ label, isChecked = false, onChange = () => {} }) {
  const switchId = `toggle-switch-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <FormControl display="flex" alignItems="center" justifyContent="space-between" p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
      <FormLabel htmlFor={switchId} mb="0" flex="1" cursor="pointer" fontSize="md" fontWeight="medium" color="gray.700">
        {label}
      </FormLabel>
      <Switch
        id={switchId}
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="teal"
        size="md"
        aria-label={label}
      />
    </FormControl>
  );
}

ToggleSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  isChecked: PropTypes.bool,
  onChange: PropTypes.func,
};