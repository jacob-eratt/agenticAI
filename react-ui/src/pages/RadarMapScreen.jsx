import React from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import InteractiveMap from '../components/InteractiveMap';

/**
 * RadarMapScreen component displays an interactive radar map with a time-lapse playback button.
 * It fills the entire viewport, providing a full-screen map experience.
 */
export default function RadarMapScreen() {
  /**
   * Handles map pan and zoom interactions.
   * @param {object} event - The interaction event object.
   */
  const handle_map_pan_zoom = (event) => {
    console.log('Map interacted:', event);
    // Implement map pan/zoom logic here
  };

  /**
   * Initiates the time-lapse playback.
   */
  const initiateTimeLapsePlayback = () => {
    console.log('Initiating time-lapse playback');
    // Implement time-lapse playback logic here
  };

  return (
    <Flex
      direction="column"
      gap={0}
      minH="100vh"
      px={{ base: 0 }}
      py={{ base: 0 }}
      width="100%"
      bg="gray.50"
    >
      <Box
        flex={1}
        height="100vh"
        overflow="hidden"
        position="relative"
        width="100%"
      >
        <InteractiveMap
          height="100%"
          onInteraction={handle_map_pan_zoom}
          src="real_time_radar_data_source"
          width="100%"
        />
        <Box
          position="absolute"
          bottom={{ base: "4", md: "8" }}
          right={{ base: "4", md: "8" }}
          zIndex={10}
          bg="whiteAlpha.800"
          borderRadius="md"
          boxShadow="lg"
          p={{ base: 2, md: 4 }}
        >
          <Button
            aria-label="Play Time-lapse"
            colorScheme="blue"
            size={{ base: "md", md: "lg" }}
            onClick={initiateTimeLapsePlayback}
          >
            Play Time-lapse
          </Button>
        </Box>
      </Box>
    </Flex>
  );
}

RadarMapScreen.propTypes = {
  // No specific props for the screen itself based on the layout,
  // but PropTypes can be added here if the screen were to accept any.
};
