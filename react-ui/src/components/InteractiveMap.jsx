import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Text, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} InteractiveMapProps
 * @property {string} [src] - Source URL for the map's background image. This acts as the base layer.
 * @property {(interactionData: { scale: number; offsetX: number; offsetY: number; }) => void} [onInteraction] - Callback function for user interactions like pan and zoom.
 */

/**
 * InteractiveMap component to display a map-like interface with basic pan and zoom capabilities.
 * This component simulates map functionality using CSS transforms on a background image
 * and is designed to be a container for more advanced map libraries or custom overlays if needed.
 *
 * @param {InteractiveMapProps} props - The props for the InteractiveMap component.
 */
export default function InteractiveMap({ src, onInteraction }) {
  const mapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragX, setStartDragX] = useState(0);
  const [startDragY, setStartDragY] = useState(0);
  const toast = useToast();

  // Warn if src is missing, as it's crucial for visual representation
  useEffect(() => {
    if (!src) {
      toast({
        title: "Map Source Missing",
        description: "The 'src' prop is recommended for InteractiveMap to display content.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [src, toast]);

  // Callback for interaction changes
  useEffect(() => {
    if (onInteraction) {
      onInteraction({ scale, offsetX, offsetY });
    }
  }, [scale, offsetX, offsetY, onInteraction]);

  /**
   * Handles the mouse down event to start dragging.
   * @param {React.MouseEvent} e - The mouse event.
   */
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartDragX(e.clientX - offsetX);
    setStartDragY(e.clientY - offsetY);
    e.preventDefault(); // Prevent default drag behavior (e.g., image dragging)
  }, [offsetX, offsetY]);

  /**
   * Handles the mouse move event for panning.
   * @param {React.MouseEvent} e - The mouse event.
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - startDragX);
    setOffsetY(e.clientY - startDragY);
  }, [isDragging, startDragX, startDragY]);

  /**
   * Handles the mouse up event to stop dragging.
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handles the mouse leave event to stop dragging if the cursor leaves the map area.
   */
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  /**
   * Handles the mouse wheel event for zooming.
   * @param {React.WheelEvent} e - The wheel event.
   */
  const handleWheel = useCallback((e) => {
    e.preventDefault(); // Prevent page scrolling
    const scaleAmount = 0.1;
    const newScale = e.deltaY < 0 ? scale * (1 + scaleAmount) : scale / (1 + scaleAmount);

    // Clamp scale to reasonable limits to prevent extreme zoom
    const clampedScale = Math.max(0.5, Math.min(5, newScale));

    // Calculate zoom point relative to mouse cursor
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Adjust offset to zoom towards the mouse cursor
      const newOffsetX = offsetX - (mouseX / scale) * (clampedScale - scale);
      const newOffsetY = offsetY - (mouseY / scale) * (clampedScale - scale);

      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);
    }
    setScale(clampedScale);
  }, [scale, offsetX, offsetY]);

  return (
    <Box
      ref={mapRef}
      position="relative"
      width="100%"
      height={{ base: "300px", md: "500px", lg: "600px" }} // Responsive height
      overflow="hidden"
      borderWidth="1px"
      borderRadius="md"
      boxShadow="lg"
      bg="gray.100"
      cursor={isDragging ? 'grabbing' : 'grab'}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      aria-label="Interactive Map with Pan and Zoom"
      role="img" // Role 'img' for a static image with interaction, 'application' for complex interactive controls
    >
      {src ? (
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bgImage={`url(${src})`}
          bgSize="cover" // Adjust as needed: 'contain', '100% 100%', etc.
          bgRepeat="no-repeat"
          bgPosition="center"
          transform={`translate(${offsetX}px, ${offsetY}px) scale(${scale})`}
          transformOrigin="0 0" // Important for correct pan/zoom behavior
          transition="transform 0.05s ease-out" // Smooth transition for pan/zoom
          willChange="transform" // Optimize for animation
          aria-hidden="true" // Content is visual, interactions are on parent
        />
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          color="gray.500"
          fontSize="xl"
          fontWeight="semibold"
          textAlign="center"
          p={4}
        >
          <Text>No map source provided. Pan and zoom still active on this placeholder area.</Text>
        </Box>
      )}
      {/* This is where real-time data overlays or more complex map layers could be rendered.
          For example, using SVG, Canvas, or a dedicated map library component.
          These overlays would typically have `pointerEvents="none"` to allow mouse events
          to pass through to the underlying map container for pan/zoom. */}
      {/* <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        pointerEvents="none"
      >
        <Text color="red.500" fontSize="sm" p={2}>Simulated Real-time Data Overlay</Text>
      </Box> */}
    </Box>
  );
}

InteractiveMap.propTypes = {
  /**
   * Source URL for the map's background image. This acts as the base layer.
   * If not provided, a placeholder message will be displayed.
   */
  src: PropTypes.string,
  /**
   * Callback function for user interactions like pan and zoom.
   * Receives an object with current `scale`, `offsetX`, and `offsetY`.
   */
  onInteraction: PropTypes.func,
};