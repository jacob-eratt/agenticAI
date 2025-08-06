import React, { useState, useCallback } from 'react';
import { Box, Flex, Heading, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import DatePicker from '../components/DatePicker';
import Button from '../components/Button';
import MultiSelect from '../components/MultiSelect';
import Tabs from '../components/Tabs';
import HistoricalDataPanel from '../components/HistoricalDataPanel';
import AlertList from '../components/AlertList';
import AlertDetailsPanel from '../components/AlertDetailsPanel';

/**
 * HistoricalDataScreen component displays historical weather data and alerts.
 * It allows users to select a date range, customize meteorological parameters,
 * and view historical data or severe weather alerts in a tabbed interface.
 */
export default function HistoricalDataScreen() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const toast = useToast();

  /**
   * Handles the change event for the start date picker.
   * @param {string} date - The selected start date.
   */
  const handleStartDateChange = useCallback((date) => {
    setStartDate(date);
  }, []);

  /**
   * Handles the change event for the end date picker.
   * @param {string} date - The selected end date.
   */
  const handleEndDateChange = useCallback((date) => {
    setEndDate(date);
  }, []);

  /**
   * Handles the click event for the 'Done' button.
   * This function would typically trigger data fetching based on the selected dates and parameters.
   */
  const handleDoneClick = useCallback(() => {
    if (!startDate || !endDate) {
      toast({
        title: 'Date Range Required',
        description: 'Please select both a start and an end date.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Placeholder for fetching historical data and alerts
    console.log('Fetching data for:', { startDate, endDate, selectedParameters });
    // Simulate data fetch
    setHistoricalData([{ date: '2023-01-01', temperature: 25, humidity: 60 }]);
    setAlerts([{ id: '1', title: 'Severe Thunderstorm Warning', date: '2023-01-05', description: 'Heavy rain and strong winds expected.' }]);
    toast({
      title: 'Data Updated',
      description: 'Historical data and alerts have been refreshed.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [startDate, endDate, selectedParameters, toast]);

  /**
   * Handles the click event for the 'Customize Parameters' button.
   * This function could open a modal or navigate to a different section for parameter customization.
   */
  const handleCustomizeParametersClick = useCallback(() => {
    toast({
      title: 'Customize Parameters',
      description: 'This feature is under development.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Handles the change event for the MultiSelect component.
   * @param {string[]} values - An array of selected meteorological parameters.
   */
  const handleParameterChange = useCallback((values) => {
    setSelectedParameters(values);
  }, []);

  /**
   * Displays details of a selected alert.
   * @param {object} alert - The alert object to display.
   */
  const displayAlertDetails = useCallback((alert) => {
    setSelectedAlert(alert);
  }, []);

  /**
   * Handles the change event for the Tabs component.
   * @param {number} index - The index of the newly selected tab.
   */
  const handleTabChange = useCallback((index) => {
    setActiveTabIndex(index);
  }, []);

  return (
    <Flex
      direction="column"
      gap={4}
      minH="100vh"
      px={{ base: 2, md: 4, lg: 8 }}
      py={{ base: 2, md: 4, lg: 8 }}
      width="100%"
      bg="gray.50"
    >
      {/* Full-width top header bar for screen title. */}
      <Box
        width="100%"
        bg="white"
        py={6}
        px={{ base: 3, md: 6 }}
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
      >
        {/* Screen title, full width header with padding. */}
        <Heading
          as="h1"
          size={{ base: 'xl', md: '2xl' }}
          color="gray.800"
          textAlign="center"
        >
          Historical Data
        </Heading>
      </Box>

      {/* Container for date range selection, 'Done' button, and 'Customize Parameters' button. */}
      <Flex
        width="100%"
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        alignItems={{ base: 'stretch', md: 'flex-end' }}
      >
        {/* Date picker for selecting the start date of historical data. */}
        <DatePicker
          label="Start Date"
          onChange={handleStartDateChange}
          value={startDate}
          flex={1}
          width="100%"
        />
        {/* Date picker for selecting the end date of historical data. */}
        <DatePicker
          label="End Date"
          onChange={handleEndDateChange}
          value={endDate}
          flex={1}
          width="100%"
        />
        {/* Button to confirm the selected date range. */}
        <Button
          label="Done"
          onClick={handleDoneClick}
          variant="solid"
          width={{ base: '100%', md: 'auto' }}
          colorScheme="blue"
          size="md"
        />
        {/* Button to open the meteorological parameter selection interface. */}
        <Button
          label="Customize Parameters"
          onClick={handleCustomizeParametersClick}
          width={{ base: '100%', md: 'auto' }}
          colorScheme="teal"
          variant="outline"
          size="md"
        />
      </Flex>

      {/* Container for the Multi-select component. */}
      <Box
        width="100%"
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
      >
        {/* Multi-select component for choosing meteorological parameters. */}
        <MultiSelect
          options={[
            { label: 'Temperature', value: 'Temperature' },
            { label: 'Humidity', value: 'Humidity' },
            { label: 'Wind Speed', value: 'Wind Speed' },
            { label: 'Precipitation', value: 'Precipitation' },
          ]}
          selectedValues={selectedParameters}
          onChange={handleParameterChange}
          width="100%"
          label="Select Parameters"
        />
      </Box>

      {/* Tabs for navigating between different historical data views. */}
      <Tabs
        defaultIndex={0}
        onChange={handleTabChange}
        width="100%"
        p={4}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        tabs={[
          { title: 'Historical Data', content: (
            <HistoricalDataPanel
              data={historicalData}
              location="Selected Location" // This should be dynamic based on user input or context
              width="100%"
              minH="300px"
              p={{ base: 4, md: 6 }}
              bg="white"
              borderRadius="md"
              boxShadow="md"
              flex={1}
            />
          )},
          { title: 'Alerts', content: (
            <Flex direction="column" gap={4} width="100%" flex={1}>
              <AlertList
                alerts={alerts}
                onAlertClick={displayAlertDetails}
                width="100%"
                minH="300px"
                p={{ base: 4, md: 6 }}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                flex={1}
              />
              <AlertDetailsPanel
                alert={selectedAlert}
                width="100%"
                minH="200px"
                p={{ base: 4, md: 6 }}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                flex={1}
              />
            </Flex>
          )},
        ]}
      />
    </Flex>
  );
}

HistoricalDataScreen.propTypes = {
  // No direct props for the screen component, state is managed internally.
};
