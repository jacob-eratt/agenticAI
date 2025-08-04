import React from 'react';
import { FormControl, FormLabel, Switch, Box, useTheme } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} ToggleSwitchProps
 * @property {string} label - Text label for the toggle.
 * @property {boolean} [isChecked=false] - Current checked state of the toggle.
 * @property {(isChecked: boolean) => void} [onChange] - Callback function when the toggle state changes.
 * @property {string} [id] - Optional ID for the switch and its label. If not provided, a unique ID will be generated.
 * @property {string} [colorScheme='blue'] - The color scheme for the switch.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - The size of the switch.
 * @property {boolean} [isDisabled=false] - If true, the switch will be disabled.
 * @property {boolean} [isReadOnly=false] - If true, the switch will be read-only.
 * @property {boolean} [isInvalid=false] - If true, the switch will be marked as invalid.
 */

/**
 * A switch component to toggle settings on or off.
 * It provides a clear label and handles its checked state and change events.
 *
 * @param {ToggleSwitchProps} props - The props for the ToggleSwitch component.
 * @returns {JSX.Element} A Chakra UI ToggleSwitch component.
 */
export default function ToggleSwitch({
  label,
  isChecked = false,
  onChange,
  id,
  colorScheme = 'blue',
  size = 'md',
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  ...rest
}) {
  const uniqueId = id || `toggle-switch-${React.useId()}`;
  const theme = useTheme();

  // Validate required props at runtime
  if (!label) {
    console.warn('ToggleSwitch: The "label" prop is required for accessibility and clarity.');
  }

  return (
    <Box
      p={2}
      borderRadius="md"
      _hover={{ bg: 'gray.50' }}
      transition="background-color 0.2s"
      {...rest}
    >
      <FormControl
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        id={uniqueId}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
      >
        <FormLabel
          htmlFor={uniqueId}
          mb="0"
          cursor={isDisabled || isReadOnly ? 'not-allowed' : 'pointer'}
          fontSize={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          fontWeight="medium"
          color="gray.700"
          _dark={{ color: 'gray.200' }}
          flex="1"
          mr={4} // Add some margin to separate label from switch
        >
          {label}
        </FormLabel>
        <Switch
          id={uniqueId}
          isChecked={isChecked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          colorScheme={colorScheme}
          size={size}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          aria-label={label} // Redundant if FormLabel is used, but good for robustness
        />
      </FormControl>
    </Box>
  );
}

ToggleSwitch.propTypes = {
  /**
   * Text label for the toggle.
   */
  label: PropTypes.string.isRequired,
  /**
   * Current checked state of the toggle.
   */
  isChecked: PropTypes.bool,
  /**
   * Callback function when the toggle state changes.
   * @param {boolean} isChecked - The new checked state.
   */
  onChange: PropTypes.func,
  /**
   * Optional ID for the switch and its label. If not provided, a unique ID will be generated.
   */
  id: PropTypes.string,
  /**
   * The color scheme for the switch.
   */
  colorScheme: PropTypes.string,
  /**
   * The size of the switch.
   */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /**
   * If true, the switch will be disabled.
   */
  isDisabled: PropTypes.bool,
  /**
   * If true, the switch will be read-only.
   */
  isReadOnly: PropTypes.bool,
  /**
   * If true, the switch will be marked as invalid.
   */
  isInvalid: PropTypes.bool,
};