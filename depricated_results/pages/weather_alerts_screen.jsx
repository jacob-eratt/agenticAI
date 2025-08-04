import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import AlertList from '../components/alert_list';
import AlertDetailsPanel from '../components/alert_details_panel';

export default function WeatherAlertsScreen() {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
  };

  return (
    <Flex
      direction="row"
      alignItems="flex-start"
      gap={6}
      p={8}
      width="100%"
      height="100vh"
    >
      <Box flex="1">
        <AlertList alerts={[]} onAlertClick={handleAlertClick} />
      </Box>
      <Box flex="2">
        <AlertDetailsPanel alert={selectedAlert} />
      </Box>
    </Flex>
  );
}