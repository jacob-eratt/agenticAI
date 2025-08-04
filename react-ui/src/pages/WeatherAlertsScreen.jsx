import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { AlertList, AlertDetailsPanel } from '../components';

/**
 * WeatherAlertsScreen component displays a list of weather alerts and their details.
 * It manages the selection of an alert to display its details.
 */
export default function WeatherAlertsScreen() {
  const [selectedAlert, setSelectedAlert] = useState(null);

  /**
   * Handles the click event on an alert item in the AlertList.
   * Sets the selected alert to display its details in the AlertDetailsPanel.
   * @param {object} alert - The alert object that was clicked.
   */
  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
  };

  // Dummy alerts data for demonstration. In a real application, this would come from an API.
  const alerts = [
    {
      id: '1',
      title: 'High Wind Advisory',
      description: 'Expect strong winds up to 40 mph from 3 PM to 9 PM.',
      severity: 'Moderate',
      area: 'Central Plains',
      issued: '2023-10-26T14:00:00Z',
      expires: '2023-10-26T21:00:00Z',
    },
    {
      id: '2',
      title: 'Dense Fog Warning',
      description: 'Visibility reduced to less than a quarter mile. Drive with caution.',
      severity: 'Minor',
      area: 'Coastal Regions',
      issued: '2023-10-26T06:00:00Z',
      expires: '2023-10-26T10:00:00Z',
    },
    {
      id: '3',
      title: 'Air Quality Alert',
      description: 'Unhealthy air for sensitive groups due to high ozone levels.',
      severity: 'Moderate',
      area: 'Urban Areas',
      issued: '2023-10-26T09:00:00Z',
      expires: '2023-10-26T18:00:00Z',
    },
  ];

  return (
    <Flex
      direction="row"
      gap={4}
      height="100vh"
      p={4}
      width="100%"
      bg="gray.50"
      alignItems="flex-start"
    >
      <AlertList
        alerts={alerts}
        onAlertClick={handleAlertClick}
        flex="1"
        maxW="30%"
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p={4}
        bg="white"
        boxShadow="sm"
      />
      <AlertDetailsPanel
        alert={selectedAlert}
        flex="2"
        maxW="70%"
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p={4}
        bg="white"
        boxShadow="sm"
      />
    </Flex>
  );
}

WeatherAlertsScreen.propTypes = {
  // No props are expected for the screen component itself, as it manages its own state.
  // However, if it were to receive props (e.g., initial alerts), they would be defined here.
};
