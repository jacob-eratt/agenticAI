import React from 'react';
import { FormControl, FormLabel, Switch, Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * A customizable toggle switch component for settings.
 * It provides a label and manages its checked state.
 *
 * @param {object} props - The props for the ToggleSwitch component.
 * @param {string} props.label - The text label displayed next to the toggle switch.
 * @param {boolean} [props.isChecked=false] - The current checked state of the toggle.
 * @param {function} [props.onChange] - Callback function invoked when the toggle state changes.
 *   It receives the event object as its argument.
 * @param {string} [props.colorScheme='blue'] - The color scheme for the switch (e.g., 'blue', 'green', 'red').
 * @param {string} [props.size='md'] - The size of the switch ('sm', 'md', 'lg').
 * @param {object} [props.containerProps] - Props to be passed directly to the outer Box container.
 * @param {object} [props.labelProps] - Props to be passed directly to the FormLabel component.
 * @param {object} [props.switchProps] - Props to be passed directly to the Switch component.
 */
export default function ToggleSwitch({
  label,
  isChecked = false,
  onChange,
  colorScheme = 'blue',
  size = 'md',
  containerProps,
  labelProps,
  switchProps,
  ...rest
}) {
  return (
    <Box {...containerProps} {...rest}>
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor={`toggle-switch-${label}`} mb="0" mr={3} {...labelProps}>
          {label}
        </FormLabel>
        <Switch
          id={`toggle-switch-${label}`}
          isChecked={isChecked}
          onChange={onChange}
          colorScheme={colorScheme}
          size={size}
          {...switchProps}
        />
      </FormControl>
    </Box>
  );
}

ToggleSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  isChecked: PropTypes.bool,
  onChange: PropTypes.func,
  colorScheme: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  containerProps: PropTypes.object,
  labelProps: PropTypes.object,
  switchProps: PropTypes.object,
};