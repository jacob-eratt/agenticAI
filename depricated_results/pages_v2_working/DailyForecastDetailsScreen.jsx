import React from 'react';
import { Flex } from '@chakra-ui/react';
import DailyDetailsPanel from '../components/DailyDetailsPanel';
import PropTypes from 'prop-types';

/**
 * DailyForecastDetailsScreen component displays detailed weather information for a specific day.
 * It uses a DailyDetailsPanel to present the forecast.
 */
export default function DailyForecastDetailsScreen() {
  return (
    <Flex
      direction="column"
      alignItems="center"
      gap={6}
      p={{ base: 4, md: 8 }}
      bg="gray.50"
      minHeight="100vh"
      width="100vw"
    >
      <DailyDetailsPanel
        component_instance_id="82455772-5477-4a9d-8915-8afea7c3d08f"
        notes="Main panel displaying comprehensive daily weather details. Placed at the top of the screen, centered, and responsive to different screen sizes. This serves as the primary information display for the selected day."
        alignSelf="center"
        borderRadius="xl"
        colorScheme="blue"
        date="2023-10-27"
        humidity="60%"
        maxWidth="900px"
        precipitation="10%"
        size="lg"
        temperature="25°C"
        variant="elevated"
        width={{ base: "100%", lg: "60%", md: "80%" }}
        wind="15 km/h NE"
      />
    </Flex>
  );
}

DailyForecastDetailsScreen.propTypes = {};
