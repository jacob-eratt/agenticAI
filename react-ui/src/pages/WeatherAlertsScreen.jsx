import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import AlertList from '../components/AlertList';
import AlertDetailsPanel from '../components/AlertDetailsPanel';
import PropTypes from 'prop-types';

export default function WeatherAlertsScreen() {
  const [selectedAlert, setSelectedAlert] = useState(null);

  return (
    <Flex
      bg="gray.50"
      direction="column"
      gap={4}
      minH="100vh"
      px={{ base: 2, md: 4, lg: 8 }}
      py={{ base: 2, md: 4, lg: 8 }}
      width="100%"
    >
      <Flex
        alignItems="stretch"
        direction={{ base: "column", md: "row" }}
        flex={1}
        gap={{ base: 4, md: 8 }}
        maxW={{ base: "100%", lg: "1200px" }}
        mx="auto"
        px={0}
        py={{ base: 2, md: 4 }}
        width="100%"
      >
        {/* Left Panel for AlertList */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          display="flex"
          flex={1}
          flexDirection="column"
          gap={4}
          p={{ base: 4, md: 6 }}
          width="100%"
        >
          {/* Placeholder for the WeatherAlertList component. This container will hold the list of active non-severe weather alerts. */}
          <AlertList onSelectAlert={setSelectedAlert} />
        </Box>

        {/* Right Panel for AlertDetailsPanel */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          display="flex"
          flex={1}
          flexDirection="column"
          gap={4}
          p={{ base: 4, md: 6 }}
          width="100%"
        >
          {/* Container for the WeatherAlertDetailPanel component. This flexible container will display the details of a selected alert. */}
          <AlertDetailsPanel alert={selectedAlert} />
        </Box>
      </Flex>
    </Flex>
  );
}

WeatherAlertsScreen.propTypes = {
  // No specific props for the screen itself, but good practice to include propTypes.
};