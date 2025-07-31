import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, Flex, Text, IconButton, Tooltip, VStack, HStack } from '@chakra-ui/react';
import { AddIcon, MinusIcon, ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';

/**
 * InteractiveMap component displays a simulated interactive map area with pan and zoom capabilities.
 * It uses Chakra UI components to provide controls and a visual representation of the map.
 *
 * @param {object} props - The component props.
 * @param {string} props.src - Source identifier or data for the map. This is used as a label for the simulated map content.
 * @param {function} [props.onInteraction] - Callback function for user interactions like pan and zoom.
 *   It receives an object with the current `zoomLevel`, `offsetX`, and `offsetY`.
 */
const InteractiveMap = ({ src, onInteraction }) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Constants for zoom and pan steps and limits
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3.0;
  const PAN_STEP = 50; // Pixels for each pan movement

  // Callback to notify parent of interaction changes
  const triggerInteraction = useCallback(() => {
    if (onInteraction) {
      onInteraction({ zoomLevel, offsetX, offsetY });
    }
  }, [zoomLevel, offsetX, offsetY, onInteraction]);

  // Effect to trigger interaction whenever zoom or pan state changes
  useEffect(() => {
    triggerInteraction();
  }, [zoomLevel, offsetX, offsetY, triggerInteraction]);

  /**
   * Handles zooming in the map.
   */
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM));
  };

  /**
   * Handles zooming out the map.
   */
  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM));
  };

  /**
   * Handles panning the map in a specified direction.
   * @param {'up' | 'down' | 'left' | 'right'} direction - The direction to pan.
   */
  const handlePan = (direction) => {
    switch (direction) {
      case 'up':
        setOffsetY((prevY) => prevY + PAN_STEP);
        break;
      case 'down':
        setOffsetY((prevY) => prevY - PAN_STEP);
        break;
      case 'left':
        setOffsetX((prevX) => prevX + PAN_STEP);
        break;
      case 'right':
        setOffsetX((prevX) => prevX - PAN_STEP);
        break;
      default:
        break;
    }
  };

  // The content displayed within the simulated map area.
  // Since 'src' is described as a "Source URL or data" and the example is a string identifier,
  // we'll display a placeholder with the source name.
  const mapContent = (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="gray.100"
      color="gray.600"
      fontSize="xl"
      fontWeight="bold"
      borderRadius="md"
      border="2px dashed"
      borderColor="gray.300"
      textAlign="center"
      p={4}
      userSelect="none" // Prevent text selection on the map content
    >
      <Text>Map Content for:</Text>
      <Text color="blue.600" fontSize="2xl" mt={1}>{src || 'No Source Provided'}</Text>
      <Text fontSize="sm" mt={2} color="gray.500">
        (Simulated interactive map area)
      </Text>
    </Box>
  );

  return (
    <Box
      position="relative"
      width="100%"
      height={{ base: "300px", md: "500px", lg: "600px" }} // Responsive height
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden" // Essential for the pan/zoom effect
      bg="gray.50"
      boxShadow="lg"
      p={2}
      aria-label="Interactive Map Display"
      role="application" // Indicates a complex interactive component
    >
      {/* Map Area - This Box will be transformed for pan and zoom */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        transform={`scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`}
        transformOrigin="center center" // Ensures zooming happens from the center
        transition="transform 0.1s ease-out" // Smooth transition for visual feedback
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {mapContent}
      </Box>

      {/* Controls Overlay */}
      <Flex
        position="absolute"
        top={4}
        right={4}
        direction="column"
        gap={3} // Spacing between control groups
        zIndex="overlay" // Ensures controls are above the map content
      >
        {/* Zoom Controls */}
        <VStack spacing={1} bg="whiteAlpha.800" p={2} borderRadius="md" boxShadow="md">
          <Tooltip label="Zoom In" placement="left">
            <IconButton
              icon={<AddIcon />}
              onClick={handleZoomIn}
              aria-label="Zoom In"
              colorScheme="blue"
              size="sm"
              isRound
            />
          </Tooltip>
          <Tooltip label="Zoom Out" placement="left">
            <IconButton
              icon={<MinusIcon />}
              onClick={handleZoomOut}
              aria-label="Zoom Out"
              colorScheme="blue"
              size="sm"
              isRound
            />
          </Tooltip>
        </VStack>

        {/* Pan Controls */}
        <VStack spacing={1} bg="whiteAlpha.800" p={2} borderRadius="md" boxShadow="md">
          <Tooltip label="Pan Up" placement="left">
            <IconButton
              icon={<ArrowUpIcon />}
              onClick={() => handlePan('up')}
              aria-label="Pan Up"
              colorScheme="gray"
              size="sm"
              isRound
            />
          </Tooltip>
          <HStack spacing={1}>
            <Tooltip label="Pan Left" placement="left">
              <IconButton
                icon={<ArrowLeftIcon />}
                onClick={() => handlePan('left')}
                aria-label="Pan Left"
                colorScheme="gray"
                size="sm"
                isRound
              />
            </Tooltip>
            <Tooltip label="Pan Right" placement="right">
              <IconButton
                icon={<ArrowRightIcon />}
                onClick={() => handlePan('right')}
                aria-label="Pan Right"
                colorScheme="gray"
                size="sm"
                isRound
              />
            </Tooltip>
          </HStack>
          <Tooltip label="Pan Down" placement="left">
            <IconButton
              icon={<ArrowDownIcon />}
              onClick={() => handlePan('down')}
              aria-label="Pan Down"
              colorScheme="gray"
              size="sm"
              isRound
            />
          </Tooltip>
        </VStack>
      </Flex>
    </Box>
  );
};

InteractiveMap.propTypes = {
  /**
   * Source URL or data for the map. This is used as a label for the simulated map content.
   */
  src: PropTypes.string.isRequired,
  /**
   * Callback function for user interactions like pan and zoom.
   * It receives an object with the current `zoomLevel`, `offsetX`, and `offsetY`.
   */
  onInteraction: PropTypes.func,
};

InteractiveMap.defaultProps = {
  onInteraction: () => {}, // Default to a no-operation function
};

export default InteractiveMap;