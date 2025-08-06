import React, { useState, useEffect } from 'react';
import { Box, Flex, Tabs, TabList, TabPanels, TabPanel, Tab, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import DatePicker from '../components/DatePicker';
import Button from '../components/Button';
import HistoricalDataPanel from '../components/HistoricalDataPanel';
import AlertList from '../components/AlertList';
import AlertDetailsPanel from '../components/AlertDetailsPanel';
import MultiSelect from '../components/MultiSelect';

/**
 * @typedef {object} HistoricalDataScreenProps
 */

/**
 * HistoricalDataScreen component displays historical weather data, allows date range selection,
 * parameter customization, and shows severe weather alerts with details.
 * @param {HistoricalDataScreenProps} props - Props for the HistoricalDataScreen component.
 * @returns {JSX.Element} The rendered HistoricalDataScreen component.
 */
export default function HistoricalDataScreen() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  /**
   * Handles the change event for the start date picker.
   * @param {string} date - The selected start date.
   */
  const handleStartDateChange = (date) => {
    setStartDate(date);
    // console.log('Start Date:', date);
  };

  /**
   * Handles the change event for the end date picker.
   * @param {string} date - The selected end date.
   */
  const handleEndDateChange = (date) => {
    setEndDate(date);
    // console.log('End Date:', date);
  };

  /**
   * Handles the click event for the "Done" button.
   * This function would typically trigger data fetching based on the selected date range.
   */
  const handleDoneClick = () => {
    // console.log('Done clicked. Fetch data for:', startDate, 'to', endDate);
    // Placeholder for fetching historical data
    setHistoricalData([
      { date: '2023-01-01', temperature: 10, humidity: 70, windSpeed: 15, precipitation: 5 },
      { date: '2023-01-02', temperature: 12, humidity: 65, windSpeed: 10, precipitation: 2 },
    ]);
    setAlerts([
      { id: '1', date: '2023-01-01', type: 'Flood Warning', description: 'River levels rising.' },
      { id: '2', date: '2023-01-05', type: 'Severe Thunderstorm', description: 'High winds and hail expected.' },
    ]);
  };

  /**
   * Handles the click event for the "Customize Parameters" button.
   * Opens the modal for parameter selection.
   */
  const handleCustomizeParametersClick = () => {
    onOpen();
  };

  /**
   * Handles the change event for the MultiSelect component.
   * @param {string[]} values - The array of selected parameter values.
   */
  const handleParameterChange = (values) => {
    setSelectedParameters(values);
    // console.log('Selected Parameters:', values);
  };

  /**
   * Displays details of a selected alert.
   * @param {object} alert - The alert object to display.
   */
  const displayAlertDetails = (alert) => {
    setSelectedAlert(alert);
  };

  const parameterOptions = [
    { label: 'Temperature', value: 'Temperature' },
    { label: 'Humidity', value: 'Humidity' },
    { label: 'Wind Speed', value: 'Wind Speed' },
    { label: 'Precipitation', value: 'Precipitation' },
  ];

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
      p={{ base: 4, md: 8 }}
      bg="gray.50"
      width="100%"
    >
      {/* Date Range Selection */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="center"
        gap={4}
        mb={8}
        width={{ base: '100%', md: 'auto' }}
      >
        <DatePicker
          label="Start Date"
          onChange={handleStartDateChange}
          width={{ base: '100%', md: '200px' }}
        />
        <DatePicker
          label="End Date"
          onChange={handleEndDateChange}
          width={{ base: '100%', md: '200px' }}
        />
        <Button
          label="Done"
          onClick={handleDoneClick}
          variant="solid"
          width={{ base: '100%', md: 'auto' }}
          colorScheme="blue"
          size="md"
        />
      </Flex>

      {/* Customize Parameters Button */}
      <Button
        label="Customize Parameters"
        onClick={handleCustomizeParametersClick}
        mt={4}
        mb={8}
        width={{ base: '100%', md: '250px' }}
        colorScheme="teal"
        size="md"
      />

      {/* Parameter Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Customize Meteorological Parameters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <MultiSelect
              options={parameterOptions}
              value={selectedParameters}
              onChange={handleParameterChange}
              label="Select Parameters"
            />
          </ModalBody>
          <ModalFooter>
            <Button label="Close" onClick={onClose} colorScheme="blue" size="md" />
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Historical Data Tabs */}
      <Tabs colorScheme="blue" defaultIndex={0} variant="enclosed" width="100%">
        <TabList>
          <Tab>Historical Data</Tab>
          <Tab>Alerts</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {/* Main Historical Data Display and Alerts */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="flex-start"
              justify="center"
              gap={8}
              width="100%"
            >
              <HistoricalDataPanel
                data={historicalData}
                location="Selected Location"
                maxW={{ base: '100%', md: 'xl', lg: '2xl' }}
                width="100%"
                colorScheme="blue"
                size="lg"
                variant="elevated"
              />
              <AlertList
                alerts={alerts}
                onAlertClick={displayAlertDetails}
                width={{ base: '100%', md: '400px' }}
                colorScheme="red"
                variant="outline"
              />
              {selectedAlert && (
                <AlertDetailsPanel
                  alert={selectedAlert}
                  width={{ base: '100%', md: '400px' }}
                  colorScheme="red"
                  variant="subtle"
                />
              )}
            </Flex>
          </TabPanel>
          <TabPanel>
            <Box>
              {/* Content for the Alerts tab, could be a more detailed alerts view */}
              <AlertList
                alerts={alerts}
                onAlertClick={displayAlertDetails}
                width="100%"
                colorScheme="red"
                variant="outline"
              />
              {selectedAlert && (
                <AlertDetailsPanel
                  alert={selectedAlert}
                  width="100%"
                  colorScheme="red"
                  variant="subtle"
                />
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

HistoricalDataScreen.propTypes = {
  // No props defined for the screen component itself based on the provided JSONs.
  // Add any screen-level props here if they become necessary.
};
