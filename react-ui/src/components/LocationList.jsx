import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  Text,
  IconButton,
  Flex,
  Spacer,
  useToast,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { DragHandleIcon, CheckIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

/**
 * @typedef {object} LocationItem
 * @property {string | number} id - Unique identifier for the item.
 * @property {string} name - The primary text to display for the item.
 * @property {string} [description] - Optional secondary text for the item.
 * @property {any} [data] - Any additional data associated with the item.
 */

/**
 * LocationList component displays a list of items, supporting selection and optional reordering.
 *
 * @param {object} props - The component props.
 * @param {LocationItem[]} props.items - Array of items to display in the list. Each item should ideally have an 'id' and 'name' property.
 * @param {function(LocationItem): void} [props.onSelect] - Callback function when an item is selected. Receives the selected item.
 * @param {string} [props.itemKey='id'] - Key to uniquely identify list items. Defaults to 'id'.
 * @param {string} props.ariaLabel - Accessibility label for the list. Required for screen readers.
 * @param {boolean} [props.isReorderable=false] - If true, items in the list can be reordered via drag-and-drop.
 * @param {function(LocationItem[]): void} [props.onReorder] - Callback function when items are reordered. Provides the new order of items.
 */
export default function LocationList({
  items = [],
  onSelect,
  itemKey = 'id',
  ariaLabel,
  isReorderable = false,
  onReorder,
}) {
  const [orderedItems, setOrderedItems] = useState(items);
  const toast = useToast();

  // Refs for drag and drop
  const dragItem = useRef(null); // Index of the item being dragged
  const dragOverItem = useRef(null); // Index of the item being dragged over

  // Colors for drag feedback
  const dragBgColor = useColorModeValue('blue.50', 'blue.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const itemBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const descriptionColor = useColorModeValue('gray.500', 'gray.400');
  const emptyStateColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

  const handleDragStart = useCallback((e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Add a class to the dragged item for visual feedback
    e.currentTarget.classList.add('dragging');
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    dragOverItem.current = index;
    // Add a class to the item being dragged over for visual feedback
    e.currentTarget.classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Remove the class when leaving an item
    e.currentTarget.classList.remove('drag-over');
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Necessary to allow dropping
  }, []);

  const handleDrop = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;

    const newOrderedItems = [...orderedItems];
    const [draggedItem] = newOrderedItems.splice(dragItem.current, 1);
    newOrderedItems.splice(dragOverItem.current, 0, draggedItem);

    setOrderedItems(newOrderedItems);
    if (onReorder) {
      onReorder(newOrderedItems);
    }

    // Reset refs
    dragItem.current = null;
    dragOverItem.current = null;
  }, [orderedItems, onReorder]);

  const handleDragEnd = useCallback((e) => {
    // Remove all drag feedback classes
    const itemsElements = document.querySelectorAll('.dragging, .drag-over');
    itemsElements.forEach(el => el.classList.remove('dragging', 'drag-over'));
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const handleItemClick = useCallback((item) => {
    if (onSelect) {
      onSelect(item);
    }
  }, [onSelect]);

  if (!ariaLabel) {
    console.warn('LocationList: "ariaLabel" prop is required for accessibility.');
  }

  if (!items || items.length === 0) {
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        borderColor={borderColor}
        bg={useColorModeValue('white', 'gray.800')}
        textAlign="center"
      >
        <Text color={emptyStateColor}>No locations to display.</Text>
      </Box>
    );
  }

  return (
    <List
      spacing={2}
      aria-label={ariaLabel}
      borderWidth={1}
      borderRadius="md"
      borderColor={borderColor}
      bg={useColorModeValue('white', 'gray.800')}
      p={2}
      sx={{
        '.dragging': {
          opacity: 0.5,
          backgroundColor: dragBgColor,
          boxShadow: 'lg',
        },
        '.drag-over': {
          border: '2px dashed',
          borderColor: 'blue.400',
        },
      }}
    >
      {orderedItems.map((item, index) => (
        <ListItem
          key={item[itemKey] || `item-${index}`} // Fallback to index if itemKey is not found
          p={3}
          borderWidth={1}
          borderRadius="md"
          borderColor={borderColor}
          bg={itemBgColor}
          _hover={{ bg: hoverBgColor }}
          display="flex"
          alignItems="center"
          cursor={isReorderable ? 'grab' : (onSelect ? 'pointer' : 'default')}
          draggable={isReorderable}
          onDragStart={isReorderable ? (e) => handleDragStart(e, index) : undefined}
          onDragEnter={isReorderable ? (e) => handleDragEnter(e, index) : undefined}
          onDragLeave={isReorderable ? handleDragLeave : undefined}
          onDragOver={isReorderable ? handleDragOver : undefined}
          onDrop={isReorderable ? handleDrop : undefined}
          onDragEnd={isReorderable ? handleDragEnd : undefined}
          onClick={onSelect ? () => handleItemClick(item) : undefined}
          role="option"
          aria-selected={false} // Can be dynamic if there's a concept of selected item
          tabIndex={0} // Make list items focusable for keyboard navigation
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleItemClick(item);
            }
          }}
        >
          {isReorderable && (
            <Icon
              as={DragHandleIcon}
              mr={3}
              color="gray.500"
              cursor="grab"
              aria-label="Drag handle to reorder item"
            />
          )}
          <Flex direction="column" flex="1" minW={0}>
            <Text fontSize="md" fontWeight="medium" color={textColor} noOfLines={1}>
              {item.name || item.label || `Item ${index + 1}`} {/* Fallback for display */}
            </Text>
            {item.description && (
              <Text fontSize="sm" color={descriptionColor} noOfLines={1}>
                {item.description}
              </Text>
            )}
          </Flex>
          <Spacer />
          {onSelect && (
            <IconButton
              icon={<CheckIcon />}
              aria-label={`Select ${item.name || `Item ${index + 1}`}`}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={(e) => {
                e.stopPropagation(); // Prevent ListItem's onClick from firing
                handleItemClick(item);
              }}
            />
          )}
        </ListItem>
      ))}
    </List>
  );
}

LocationList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      data: PropTypes.any,
    })
  ),
  onSelect: PropTypes.func,
  itemKey: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
  isReorderable: PropTypes.bool,
  onReorder: PropTypes.func,
};