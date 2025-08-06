import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Button, Stack, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} MapInteractionData
 * @property {number} zoomLevel - The current zoom level of the map.
 * @property {object} center - The current center coordinates of the map.
 * @property {number} center.lat - Latitude of the map center.
 * @property {number} center.lng - Longitude of the map center.
 * @property {string} action - The type of interaction (e.g., 'zoomIn', 'zoomOut', 'pan').
 */

/**
 * InteractiveMap component displays a conceptual interactive map with simulated pan and zoom capabilities.
 * It leverages Chakra UI for styling and provides callbacks for user interactions.
 *
 * Note: This component provides a conceptual representation of an interactive map.
 * For a fully functional map, integration with a dedicated map library (e.g., Leaflet, Mapbox GL JS, Google Maps API)
 * would be required, which is beyond the scope of this Chakra UI primitive-focused component.
 *
 * @param {object} props - The component props.
 * @param {string} props.src - Source URL or data identifier for the map content (e.g., 'real_time_radar_data_source').
 * @param {function(MapInteractionData): void} [props.onInteraction] - Callback function for user interactions like pan and zoom.
 *   It receives an object with `zoomLevel`, `center`, and `action` properties.
 * @param {string} [props.colorScheme='blue'] - The color scheme for interactive elements.
 * @param {string} [props.variant='solid'] - The variant for interactive elements.
 * @param {string} [props.size='md'] - The size of interactive elements.
 * @param {string | number | object} [props.padding=4] - Padding around the map container.
 * @param {string | number | object} [props.margin=0] - Margin around the map container.
 * @param {string | number} [props.borderRadius='md'] - Border radius of the map container.
 * @param {string} [props.background='gray.50'] - Background color of the map container.
 * @param {string | number | object} [props.minH='300px'] - Minimum height of the map container.
 * @param {string | number | object} [props.maxH='500px'] - Maximum height of the map container, enabling scroll if content exceeds.
 * @param {string} [props.overflowY='auto'] - Overflow behavior for the Y-axis.
 */
function InteractiveMap({
  src,
  onInteraction,
  colorScheme = 'blue',
  variant = 'solid',
  size = 'md',
  padding = 4,
  margin = 0,
  borderRadius = 'md',
  background = 'gray.50',
  minH = { base: '250px', md: '350px', lg: '450px' },
  maxH = '500px',
  overflowY = 'auto'
}) {
  const toast = useToast();
  const [zoomLevel, setZoomLevel] = useState(10); // Simulated zoom level
  const [centerCoords, setCenterCoords] = useState({ lat: 34.0522, lng: -118.2437 }); // Simulated center (Los Angeles)

  /**
   * Calls the onInteraction prop with current map state.
   * @param {string} action - The action performed (e.g., 'zoomIn', 'zoomOut', 'pan').
   */
  const triggerInteraction = useCallback((action) => {
    if (onInteraction) {
      onInteraction({
        zoomLevel: zoomLevel,
        center: centerCoords,
        action: action
      });
    } else {
      toast({
        title: 'Interaction detected',
        description: `Map ${action}. Zoom: ${zoomLevel}, Center: ${centerCoords.lat}, ${centerCoords.lng}`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      });
    }
  }, [onInteraction, zoomLevel, centerCoords, toast]);

  /**
   * Simulates zooming in on the map.
   */
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 1, 20)); // Max zoom 20
    triggerInteraction('zoomIn');
  }, [triggerInteraction]);

  /**
   * Simulates zooming out on the map.
   */
  const handleZoomOut = useCallback(() => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 1, 1)); // Min zoom 1
    triggerInteraction('zoomOut');
  }, [triggerInteraction]);

  /**
   * Simulates panning the map.
   */
  const handlePan = useCallback(() => {
    // Simulate a slight pan
    setCenterCoords((prevCenter) => ({
      lat: prevCenter.lat + (Math.random() - 0.5) * 0.1,
      lng: prevCenter.lng + (Math.random() - 0.5) * 0.1
    }));
    triggerInteraction('pan');
  }, [triggerInteraction]);

  useEffect(() => {
    if (!src) {
      console.warn('InteractiveMap: The "src" prop is highly recommended for map content.');
    }
  }, [src]);

  return (
    <Box
      p={padding}
      m={margin}
      borderWidth="1px"
      borderRadius={borderRadius}
      bg={background}
      minH={minH}
      maxH={maxH}
      overflowY={overflowY}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      aria-label="Interactive Map Container"
      role="region"
    >
      <Text
        fontSize="xl"
        fontWeight="bold"
        mb={4}
        color="gray.700"
        textAlign="center"
      >
        Interactive Map
      </Text>
      <Text fontSize="md" color="gray.600" mb={4} textAlign="center">
        Displaying: {src || 'No source provided'}
      </Text>
      <Text fontSize="sm" color="gray.500" mb={6} textAlign="center">
        Current Zoom: {zoomLevel} | Center: ({centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)})
      </Text>

      <Box
        width="100%"
        height="200px"
        bg="gray.200"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={6}
        position="relative"
        overflow="hidden"
        aria-label="Map View Area"
      >
        <Text fontSize="lg" color="gray.500" fontStyle="italic">
          Map Content Placeholder
        </Text>
        {/* This is where a real map library would render its content */}
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="transparent"
          cursor="grab"
          _active={{ cursor: 'grabbing' }}
          onMouseDown={handlePan} // Simulate pan on click/drag
          aria-label="Map interaction overlay"
        />
      </Box>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mt={4}>
        <Button
          onClick={handleZoomIn}
          colorScheme={colorScheme}
          variant={variant}
          size={size}
          aria-label="Zoom In"
        >
          Zoom In
        </Button>
        <Button
          onClick={handleZoomOut}
          colorScheme={colorScheme}
          variant={variant}
          size={size}
          aria-label="Zoom Out"
        >
          Zoom Out
        </Button>
        <Button
          onClick={handlePan}
          colorScheme={colorScheme}
          variant={variant}
          size={size}
          aria-label="Pan Map"
        >
          Pan Map
        </Button>
      </Stack>
    </Box>
  );
}

InteractiveMap.propTypes = {
  /**
   * Source URL or data identifier for the map content (e.g., 'real_time_radar_data_source').
   */
  src: PropTypes.string.isRequired,
  /**
   * Callback function for user interactions like pan and zoom.
   * It receives an object with `zoomLevel`, `center`, and `action` properties.
   */
  onInteraction: PropTypes.func,
  /**
   * The color scheme for interactive elements.
   */
  colorScheme: PropTypes.string,
  /**
   * The variant for interactive elements.
   */
  variant: PropTypes.string,
  /**
   * The size of interactive elements.
   */
  size: PropTypes.string,
  /**
   * Padding around the map container.
   */
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Margin around the map container.
   */
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Border radius of the map container.
   */
  borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * Background color of the map container.
   */
  background: PropTypes.string,
  /**
   * Minimum height of the map container. Supports responsive values.
   */
  minH: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Maximum height of the map container, enabling scroll if content exceeds.
   */
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  /**
   * Overflow behavior for the Y-axis.
   */
  overflowY: PropTypes.string
};

export default React.memo(InteractiveMap);