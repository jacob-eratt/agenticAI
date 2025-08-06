import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import AlertList from '../components/AlertList';
import AlertDetailsPanel from '../components/AlertDetailsPanel';

/**
 * WeatherAlertsScreen component displays a list of active non-severe weather alerts
 * and a panel to show detailed information for a selected alert.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.alerts - An array of alert objects to display in the AlertList.
 */
export default function WeatherAlertsScreen({ alerts = [] }) {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
  };

  return (
    <Flex
      bg="gray.50"
      direction={{ base: "column", md: "row" }}
      gap={6}
      height="100vh"
      p={4}
      width="100vw"
    >
      <AlertList
        alerts={alerts}
        onAlertClick={handleAlertClick}
        alignSelf="flex-start"
        flexShrink={0}
        maxW={{ base: "100%", md: "400px" }}
        width={{ base: "100%", lg: "30%", md: "40%" }}
      />
      <AlertDetailsPanel
        alert={selectedAlert}
        flex={1}
        overflowY="auto"
        width={{ base: "100%", md: "auto" }}
      />
    </Flex>
  );
}

WeatherAlertsScreen.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.object),
};
