import React from 'react';
import { Flex, VStack } from '@chakra-ui/react';
import InteractiveMap from '../components/InteractiveMap';
import IconButton from '../components/IconButton';
import PropTypes from 'prop-types';

/**
 * RadarMapScreen component displays an interactive radar map and controls for time-lapse playback.
 * It is designed to fill the screen and provide an immersive experience.
 */
export default function RadarMapScreen() {
  /**
   * Handles map pan and zoom interactions.
   * @param {Event} event - The interaction event.
   */
  const handleMapPanZoom = (event) => {
    // Placeholder for map interaction logic
    console.log('Map interacted:', event);
  };

  /**
   * Initiates time-lapse playback of radar data.
   */
  const initiateTimeLapsePlayback = () => {
    // Placeholder for time-lapse playback logic
    console.log('Initiating time-lapse playback');
  };

  return (
    <VStack
      align="stretch"
      bg="gray.50"
      height="100vh"
      p={0}
      spacing={0}
      width="100vw"
      overflow="hidden"
    >
      <InteractiveMap
        component_instance_id="8e9d05d0-3899-4098-83d8-312ec454128b"
        background="white"
        onInteraction={handleMapPanZoom}
        src="real_time_radar_data_source"
        width="100%"
        height="100%"
        flexGrow={1}
      />
      <Flex
        component_instance_id="control-bar-container"
        align="center"
        direction="row"
        justify="center"
        p={4}
        width="100%"
        bg="gray.100"
      >
        <IconButton
          component_instance_id="3228d5b9-9db7-428c-a0de-632f9e5cca57"
          ariaLabel="Play Time-lapse"
          colorScheme="blue"
          icon="play"
          onClick={initiateTimeLapsePlayback}
          size="lg"
        />
      </Flex>
    </VStack>
  );
}

RadarMapScreen.propTypes = {
  // No specific props defined for RadarMapScreen in the layout, but good to have for future expansion.
};