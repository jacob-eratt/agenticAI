import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

import { DatePicker, Button, MultiSelect, HistoricalDataPanel, AlertList, AlertDetailsPanel } from '../components';


/**
 * @typedef {Object} HistoricalDataScreenProps
 */

/**
 * HistoricalDataScreen component displays historical weather data and weather alerts.
 * It allows users to select a date range, customize parameters, and view alert details.
 * @param {HistoricalDataScreenProps} props - Props for the HistoricalDataScreen component.
 * @returns {JSX.Element} The rendered HistoricalDataScreen component.
 */
export default function HistoricalDataScreen() {
  const toast = useToast();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showParameterSelection, setShowParameterSelection] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Selected Location"); // Placeholder for actual location

  /**
   * Handles the change event for the start date picker.
   * @param {string} date - The new start date.
   */
  const handleStartDateChange = useCallback((date) => {
    setStartDate(date);
  }, []);

  /**
   * Handles the change event for the end date picker.
   * @param {string} date - The new end date.
   */
  const handleEndDateChange = useCallback((date) => {
    setEndDate(date);
  }, []);

  /**
   * Handles the click event for the "Done" button.
   * Fetches historical data based on the selected date range and parameters.
   */
  const handleDoneClick = useCallback(() => {
    if (!startDate || !endDate) {
      toast({
        title: "Date selection required",
        description: "Please select both start and end dates.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Simulate fetching historical data
    console.log("Fetching historical data for:", { startDate, endDate, selectedParameters });
    setHistoricalData([
      { date: "2023-01-01", temperature: 10, humidity: 70, windSpeed: 5, precipitation: 0 },
      { date: "2023-01-02", temperature: 12, humidity: 65, windSpeed: 7, precipitation: 2 },
    ]);
    toast({
      title: "Data Updated",
      description: "Historical data has been updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [startDate, endDate, selectedParameters, toast]);

  /**
   * Handles the click event for the "Customize Parameters" button.
   * Toggles the visibility of the MultiSelect component.
   */
  const handleCustomizeParametersClick = useCallback(() => {
    setShowParameterSelection((prev) => !prev);
  }, []);

  /**
   * Handles the change event for the MultiSelect component.
   * @param {string[]} values - The newly selected parameters.
   */
  const handleParameterChange = useCallback((values) => {
    setSelectedParameters(values);
  }, []);

  /**
   * Handles the click event on an alert item in the AlertList.
   * Sets the selected alert to display its details.
   * @param {Object} alert - The alert object that was clicked.
   */
  const displayAlertDetails = useCallback((alert) => {
    setSelectedAlert(alert);
  }, []);

  useEffect(() => {
    // Simulate fetching initial alerts
    setAlerts([
      { id: "alert1", title: "Severe Thunderstorm Warning", date: "2023-07-15", description: "Strong winds and heavy rain expected." },
      { id: "alert2", title: "Flash Flood Watch", date: "2023-07-14", description: "Potential for rapid onset flooding." },
    ]);
  }, []);

  return (
    <Flex
      direction="column"
      gap={6}
      p={8}
      bg="white"
      width="100%"
      height="100vh"
      aria-label="Historical Data and Weather Alerts Screen"
    >
      <Tabs defaultIndex={0} variant="enclosed" colorScheme="blue" flex="1">
        <TabList>
          <Tab>Historical Data</Tab>
          <Tab>Weather Alerts</Tab>
        </TabList>

        <TabPanels flex="1" overflowY="auto">
          <TabPanel>
            <Flex direction="column" gap={4} mb={4}>
              <Flex align="flex-end" direction={{ base: "column", md: "row" }} gap={4} mb={4} wrap="wrap">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  aria-label="Select start date"
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  aria-label="Select end date"
                />
                <Button
                  label="Done"
                  onClick={handleDoneClick}
                  colorScheme="blue"
                  variant="solid"
                  aria-label="Confirm date range"
                />
              </Flex>

              <Flex direction="column" gap={4} mb={4}>
                <Button
                  label="Customize Parameters"
                  onClick={handleCustomizeParametersClick}
                  colorScheme="gray"
                  variant="outline"
                  aria-expanded={showParameterSelection}
                  aria-controls="parameter-selection"
                />
                {showParameterSelection && (
                  <Box id="parameter-selection" p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                    <MultiSelect
                      label="Select Parameters"
                      options={["Temperature", "Humidity", "Wind Speed", "Precipitation"]}
                      selectedValues={selectedParameters}
                      onChange={handleParameterChange}
                      aria-label="Select meteorological parameters"
                    />
                  </Box>
                )}
              </Flex>

              <HistoricalDataPanel
                data={historicalData}
                location={currentLocation}
                aria-live="polite"
                aria-atomic="true"
              />
            </Flex>
          </TabPanel>

          <TabPanel>
            <Flex direction="column" gap={4} flex="1" overflowY="auto">
              <AlertList
                alerts={alerts}
                onAlertClick={displayAlertDetails}
                aria-label="List of past weather alerts"
              />
              {selectedAlert && (
                <AlertDetailsPanel
                  alert={selectedAlert}
                  aria-live="polite"
                  aria-atomic="true"
                />
              )}
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

HistoricalDataScreen.propTypes = {};
