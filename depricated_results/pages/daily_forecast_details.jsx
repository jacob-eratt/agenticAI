import React from 'react';
import { Flex } from '@chakra-ui/react';
import DailyDetailsPanel from '../components/daily_details_panel';
import PropTypes from 'prop-types';

export default function DailyForecastDetails() {
  return (
    <Flex
      align="center"
      bg="gray.50"
      direction="column"
      justify="center"
      minH="100vh"
      p={4}
    >
      <DailyDetailsPanel
        date="2023-10-27"
        humidity="60%"
        precipitation="10%"
        temperature="25°C"
        wind="15 km/h NE"
      />
    </Flex>
  );
}

DailyForecastDetails.propTypes = {
  // No props for the screen itself, as per the layout JSON.
};
