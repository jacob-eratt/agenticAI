import React from 'react';
import { Box, List, ListItem, Text, IconButton, Flex, HStack } from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra/icons';
import PropTypes from 'prop-types';

const LocationList = ({
  items = [],
  onSelect,
  itemKey,
  ariaLabel = 'List items',
  isReorderable = false,
  onReorder,
  ...rest
}) => {
  /**
   * Determines the unique key for a list item.
   * Prioritizes the `itemKey` prop, then common object keys like 'id' or 'name',
   * finally falling back to the item's index.
   * @param {object | string} item - The current item.
   * @param {number} index - The index of the current item.
   * @returns {string | number} The unique key for the item.
   */
  const getItemKey = (item, index) => {
    if (itemKey && item[itemKey] !== undefined) {
      return item[itemKey];
    }
    if (item.id !== undefined) return item.id;
    if (item.name !== undefined) return item.name;
    return index;
  };

  /**
   * Handles the reordering of an item within the list.
   * Calls the `onReorder` callback with the new array order.
   * @param {number} currentIndex - The current index of the item to move.
   * @param {number} direction - The direction to move the item (-1 for up, 1 for down).
   */
  const handleMove = (currentIndex, direction) => {
    if (!onReorder || !isReorderable) return;

    const newItems = [...items];
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < newItems.length) {
      const [movedItem] = newItems.splice(currentIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      onReorder(newItems);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      bg="white"
      p={0}
      {...rest}
    >
      <List aria-label={ariaLabel} spacing={0} role="listbox">
        {items.length === 0 ? (
          <Text p={4} color="gray.500" textAlign="center">
            No items to display.
          </Text>
        ) : (
          items.map((item, index) => (
            <ListItem
              key={getItemKey(item, index)}
              display="flex"
              alignItems="center"
              py={2}
              px={4}
              _hover={{ bg: 'gray.50' }}
              _notLast={{ borderBottom: '1px solid', borderColor: 'gray.100' }}
              cursor={onSelect ? 'pointer' : 'default'}
              onClick={onSelect ? () => onSelect(item) : undefined}
              role="option"
              aria-selected={false} // Assuming selection state is managed externally if needed
            >
              <Text flex="1" fontSize="md" color="gray.700" noOfLines={1}>
                {item.name || item.label || item.title || String(item)}
              </Text>
              {isReorderable && (
                <HStack spacing={1} ml={2}>
                  <IconButton
                    icon={<ChevronUpIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent ListItem onClick
                      handleMove(index, -1);
                    }}
                    isDisabled={index === 0}
                    aria-label={`Move ${item.name || item.label || item.title || String(item)} up`}
                  />
                  <IconButton
                    icon={<ChevronDownIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent ListItem onClick
                      handleMove(index, 1);
                    }}
                    isDisabled={index === items.length - 1}
                    aria-label={`Move ${item.name || item.label || item.title || String(item)} down`}
                  />
                </HStack>
              )}
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

LocationList.propTypes = {
  /**
   * Array of items to display in the list. Each item can be a string or an object.
   * If an object, it should ideally have 'name', 'label', or 'title' for display,
   * and 'id' for unique identification if `itemKey` is not specified.
   */
  items: PropTypes.array,
  /**
   * Callback function when an item is selected. Receives the selected item as an argument.
   */
  onSelect: PropTypes.func,
  /**
   * Key to uniquely identify list items. If not provided, 'id' or 'name' properties
   * of the item will be used, falling back to array index.
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
};

export default LocationList;