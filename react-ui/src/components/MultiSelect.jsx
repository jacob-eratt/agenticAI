import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Checkbox,
  CheckboxGroup,
  Stack,
  FormLabel,
  useTheme,
  useMultiStyleConfig,
  useFormControlProps,
  Text,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} MultiSelectOption
 * @property {string} label - The human-readable label for the option.
 * @property {string | number} value - The unique value associated with the option.
 */

/**
 * MultiSelect component for selecting multiple options from a list.
 * It supports both simple string arrays and object arrays for options.
 *
 * @param {object} props - The component props.
 * @param {(string | MultiSelectOption)[]} props.options - Array of options. Each option can be a string (where label and value are the same) or an object with `label` and `value` properties.
 * @param {(string | number)[]} [props.value=[]] - Array of currently selected values.
 * @param {(selectedValues: (string | number)[]) => void} [props.onChange] - Callback function when the selected values change.
 * @param {string} [props.label] - Overall label for the multi-select component.
 * @param {string} [props.name] - The name attribute for the checkbox group, useful for form submission.
 * @param {boolean} [props.isDisabled=false] - If true, the multi-select is disabled.
 * @param {boolean} [props.isReadOnly=false] - If true, the multi-select is read-only.
 * @param {boolean} [props.isInvalid=false] - If true, the multi-select is marked as invalid.
 * @param {string} [props.spacing="4"] - Spacing between checkboxes. Can be a Chakra UI spacing token or a responsive array.
 * @param {string | string[]} [props.direction="column"] - The direction of the stack containing the checkboxes. Can be "row" or "column" or a responsive array.
 * @param {object} [props.containerProps] - Props to pass to the main container Box.
 * @param {object} [props.labelProps] - Props to pass to the FormLabel component.
 * @param {object} [props.checkboxGroupProps] - Props to pass to the CheckboxGroup component.
 * @param {object} [props.checkboxProps] - Props to pass to individual Checkbox components.
 */
export default function MultiSelect({
  options,
  value = [],
  onChange,
  label,
  name,
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  spacing = '4',
  direction = 'column',
  containerProps,
  labelProps,
  checkboxGroupProps,
  checkboxProps,
  ...rest
}) {
  const theme = useTheme();
  const styles = useMultiStyleConfig('MultiSelect', { ...rest });

  // Use Chakra's form control props for consistent styling and accessibility
  const formControlProps = useFormControlProps({
    isDisabled,
    isReadOnly,
    isInvalid,
    ...rest,
  });

  // Normalize options to { label, value } format
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) {
      console.warn('MultiSelect: options prop must be an array.');
      return [];
    }
    return options.map(option => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      }
      if (typeof option === 'object' && option !== null && 'label' in option && 'value' in option) {
        return option;
      }
      console.warn('MultiSelect: Invalid option format. Expected string or { label: string, value: any }.', option);
      return null;
    }).filter(Boolean); // Filter out any nulls from invalid options
  }, [options]);

  const handleChange = useCallback((selectedValues) => {
    if (onChange) {
      onChange(selectedValues);
    }
  }, [onChange]);

  return (
    <Box
      __css={styles.container}
      {...formControlProps}
      {...containerProps}
      {...rest}
    >
      {label && (
        <FormLabel
          htmlFor={name}
          __css={styles.label}
          {...labelProps}
        >
          {label}
        </FormLabel>
      )}

      <CheckboxGroup
        value={value}
        onChange={handleChange}
        name={name}
        isDisabled={formControlProps.isDisabled}
        isReadOnly={formControlProps.isReadOnly}
        isInvalid={formControlProps.isInvalid}
        __css={styles.checkboxGroup}
        {...checkboxGroupProps}
      >
        <Stack
          direction={direction}
          spacing={spacing}
          __css={styles.stack}
        >
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((option) => (
              <Checkbox
                key={option.value}
                value={option.value}
                colorScheme="blue" // Default color scheme
                size="md" // Default size
                __css={styles.checkbox}
                {...checkboxProps}
              >
                {option.label}
              </Checkbox>
            ))
          ) : (
            <Text color="gray.500" fontSize="sm" __css={styles.noOptionsText}>
              No options available.
            </Text>
          )}
        </Stack>
      </CheckboxGroup>
    </Box>
  );
}

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      }),
    ])
  ).isRequired,
  value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onChange: PropTypes.func,
  label: PropTypes.string,
  name: PropTypes.string,
  isDisabled: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isInvalid: PropTypes.bool,
  spacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  direction: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  containerProps: PropTypes.object,
  labelProps: PropTypes.object,
  checkboxGroupProps: PropTypes.object,
  checkboxProps: PropTypes.object,
};