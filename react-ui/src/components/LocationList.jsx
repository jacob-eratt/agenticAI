import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  IconButton,
  List,
  ListItem,
  Flex,
  Spacer,
  useToast
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

/**
 * A list component to display search results or saved items, with optional reordering capabilities.
 * It is designed to be visually appealing, highly customizable, and accessible using Chakra UI.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.items - Array of items to display in the list. Each item should ideally have a unique identifier.
 * @param {function} [props.onSelect] - Callback function when an item is selected. Receives the selected item as an argument.
 * @param {string} [props.itemKey='id'] - Key to uniquely identify list items. If not found, falls back to 'name' or index.
 * @param {string} [props.ariaLabel='List of items'] - Accessibility label for the list.
 * @param {boolean} [props.isReorderable=false] - If true, items in the list can be reordered using up/down buttons.
 * @param {function} [props.onReorder] - Callback function when items are reordered. Provides the new order of items as an array.
 * @param {string} [props.colorScheme='blue'] - The color scheme for interactive elements (buttons, icons).
 * @param {string} [props.variant='outline'] - The variant for the select button.
 * @param {string} [props.size='md'] - The size for interactive elements (buttons, icons).
 * @param {string} [props.borderRadius='md'] - Border radius for the main container.
 * @param {string} [props.fontSize='md'] - Font size for list item text.
 * @param {string} [props.fontWeight='normal'] - Font weight for list item text.
 * @param {string} [props.background='white'] - Background color for the main container.
 * @param {string} [props.maxH='400px'] - Maximum height for the list, enabling vertical scrolling.
 * @param {string} [props.overflowY='auto'] - Overflow behavior for the Y-axis, typically 'auto' for scrollable content.
 */
export default function LocationList({
  items = [],
  onSelect,
  itemKey = 'id',
  ariaLabel = 'List of items',
  isReorderable = false,
  onReorder,
  colorScheme = 'blue',
  variant = 'outline',
  size = 'md',
  borderRadius = 'md',
  fontSize = 'md',
  fontWeight = 'normal',
  background = 'white',
  maxH = '400px',
  overflowY = 'auto',
  ...rest
}) {
  const [orderedItems, setOrderedItems] = useState(items);
  const toast = useToast();

  // Update internal state if the 'items' prop changes from the parent
  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  /**
   * Generates a unique key for a list item.
   * Prioritizes item[itemKey], then item.id, then item.name, then the item's index.
   * @param {object} item - The item object.
   * @param {number} index - The index of the item in the list.
   * @returns {string|number} A unique key for the React list item.
   */
  const getItemUniqueKey = useCallback((item, index) => {
    if (item && item[itemKey] !== undefined) {
      return item[itemKey];
    }
    if (item && item.id !== undefined) {
      return item.id;
    }
    if (item && item.name !== undefined) {
      return item.name;
    }
    return index; // Fallback to index if no suitable key property is found
  }, [itemKey]);

  /**
   * Determines the display text for a list item.
   * Prioritizes item.name, then item.label, then a stringified version of the item.
   * @param {object} item - The item object.
   * @returns {string} The text to display for the item.
   */
  const getItemDisplayText = useCallback((item) => {
    if (item && item.name) {
      return item.name;
    }
    if (item && item.label) {
      return item.label;
    }
    // Fallback for complex objects or items without 'name' or 'label'
    try {
      return JSON.stringify(item);
    } catch (e) {
      return 'Unnamed Item';
    }
  }, []);

  /**
   * Handles the selection of an item. Calls the onSelect callback if provided,
   * otherwise shows a toast notification.
   * @param {object} item - The selected item.
   */
  const handleSelectItem = useCallback((item) => {
    if (onSelect) {
      onSelect(item);
    } else {
      toast({
        title: 'Item Selected',
        description: `Selected: ${getItemDisplayText(item)}`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  }, [onSelect, toast, getItemDisplayText]);

  /**
   * Moves an item up or down in the list. Updates the internal state and calls
   * the onReorder callback if provided.
   * @param {number} index - The current index of the item to move.
   * @param {number} direction - -1 to move up, 1 to move down.
   */
  const moveItem = useCallback((index, direction) => {
    const newIndex = index + direction;
    // Ensure the new index is within valid bounds
    if (newIndex >= 0 && newIndex < orderedItems.length) {
      const newOrderedItems = [...orderedItems];
      const [movedItem] = newOrderedItems.splice(index, 1); // Remove item from current position
      newOrderedItems.splice(newIndex, 0, movedItem); // Insert item at new position
      setOrderedItems(newOrderedItems); // Update internal state

      if (onReorder) {
        onReorder(newOrderedItems); // Notify parent of the new order
      } else {
        toast({
          title: 'Reorder Action',
          description: 'Item reordered, but no onReorder callback provided.',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  }, [orderedItems, onReorder, toast]);

  return (
    <Box
      borderWidth={1}
      borderRadius={borderRadius}
      bg={background}
      p={4}
      maxH={maxH}
      overflowY={overflowY}
      aria-label={ariaLabel}
      {...rest}
    >
      {orderedItems.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={4}>
          No items to display.
        </Text>
      ) : (
        <List spacing={2}>
          {orderedItems.map((item, index) => (
            <ListItem
              key={getItemUniqueKey(item, index)}
              p={2}
              borderWidth={1}
              borderRadius="md"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
              display="flex"
              alignItems="center"
              flexWrap="wrap" // Allows content and buttons to wrap on smaller screens
            >
              <Text flex="1" fontSize={fontSize} fontWeight={fontWeight} mr={2}>
                {getItemDisplayText(item)}
              </Text>
              <Spacer />
              <Flex gap={2} mt={{ base: 2, md: 0 }}> {/* Responsive margin-top for buttons */}
                {isReorderable && (
                  <>
                    <IconButton
                      icon={<ChevronUpIcon />}
                      onClick={() => moveItem(index, -1)}
                      isDisabled={index === 0} // Disable 'up' button for the first item
                      aria-label={`Move ${getItemDisplayText(item)} up`}
                      size={size}
                      colorScheme={colorScheme}
                      variant="ghost"
                    />
                    <IconButton
                      icon={<ChevronDownIcon />}
                      onClick={() => moveItem(index, 1)}
                      isDisabled={index === orderedItems.length - 1} // Disable 'down' button for the last item
                      aria-label={`Move ${getItemDisplayText(item)} down`}
                      size={size}
                      colorScheme={colorScheme}
                      variant="ghost"
                    />
                  </>
                )}
                {onSelect && (
                  <Button
                    onClick={() => handleSelectItem(item)}
                    size={size}
                    colorScheme={colorScheme}
                    variant={variant}
                    aria-label={`Select ${getItemDisplayText(item)}`}
                  >
                    Select
                  </Button>
                )}
              </Flex>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

LocationList.propTypes = {
  /**
   * Array of items to display in the list. Each item should ideally have a unique identifier.
   */
  items: PropTypes.arrayOf(PropTypes.object),
  /**
   * Callback function when an item is selected. Receives the selected item as an argument.
   */
  onSelect: PropTypes.func,
  /**
   * Key to uniquely identify list items. If not found, falls back to 'name' or index.
   */
  itemKey: PropTypes.string,
  /**
   * Accessibility label for the list.
   */
  ariaLabel: PropTypes.string,
  /**
   * If true, items in the list can be reordered using up/down buttons.
   */
  isReorderable: PropTypes.bool,
  /**
   * Callback function when items are reordered. Provides the new order of items as an array.
   */
  onReorder: PropTypes.func,
  /**
   * The color scheme for interactive elements (buttons, icons).
   */
  colorScheme: PropTypes.string,
  /**
   * The variant for the select button.
   */
  variant: PropTypes.string,
  /**
   * The size for interactive elements (buttons, icons).
   */
  size: PropTypes.string,
  /**
   * Border radius for the main container.
   */
  borderRadius: PropTypes.string,
  /**
   * Font size for list item text.
   */
  fontSize: PropTypes.string,
  /**
   * Font weight for list item text.
   */
  fontWeight: PropTypes.string,
  /**
   * Background color for the main container.
   */
  background: PropTypes.string,
  /**
   * Maximum height for the list, enabling vertical scrolling.
   */
  maxH: PropTypes.string,
  /**
   * Overflow behavior for the Y-axis, typically 'auto' for scrollable content.
   */
  overflowY: PropTypes.string,
};