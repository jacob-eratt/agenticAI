import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import DatePicker from '../components/date_picker';
import MultiSelect from '../../components/multi_select';
import HistoricalDataPanel from '../../components/historical_data_panel';
import AlertList from '../../components/alert_list';
import AlertDetailsPanel from '../../components/alert_details_panel';

export default function HistoricalDataScreen() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showParameterSelection, setShowParameterSelection] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleDoneClick = () => {
    // Logic to fetch historical data based on selected dates and parameters
    console.log('Fetching historical data for:', { startDate, endDate, selectedParameters });
    // Placeholder for fetching data
    setHistoricalData([{ date: '2023-01-01', temperature: 25, humidity: 60 }]);
  };

  const handleCustomizeParametersClick = () => {
    setShowParameterSelection(!showParameterSelection);
  };

  const handleParameterChange = (values) => {
    setSelectedParameters(values);
  };

  const displayAlertDetails = (alert) => {
    setSelectedAlert(alert);
  };

  useEffect(() => {
    // Placeholder for fetching alerts
    setAlerts([
      { id: 1, title: 'Severe Thunderstorm Warning', date: '2023-07-20', details: 'Expect heavy rain and strong winds.' },
      { id: 2, title: 'Flash Flood Watch', date: '2023-07-21', details: 'Area prone to flash flooding due to recent rains.' },
    ]);
  }, []);

  return (
    <Flex bg="gray.50" direction="column" gap={6} minH="100vh" p={8}>
      <Tabs defaultIndex={0} variant="enclosed">
        <TabList>
          <Tab>Historical Data</Tab>
          <Tab>Severe Weather Alerts</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex align="flex-start" direction="row" gap={4} mb={4}>
              <DatePicker label="Start Date" onChange={handleStartDateChange} />
              <DatePicker label="End Date" onChange={handleEndDateChange} />
              <Button colorScheme="blue" onClick={handleDoneClick} variant="solid">
                Done
              </Button>
            </Flex>
            <Flex direction="column" gap={4} mb={6}>
              <Button
                colorScheme="teal"
                onClick={handleCustomizeParametersClick}
                variant="outline"
              >
                Customize Parameters
              </Button>
              {showParameterSelection && (
                <MultiSelect
                  label="Select Parameters"
                  onChange={handleParameterChange}
                  options={["Temperature", "Humidity", "Wind Speed", "Precipitation"]}
                  selectedValues={selectedParameters}
                />
              )}
            </Flex>
            <HistoricalDataPanel data={historicalData} location="Your Location" />
          </TabPanel>
          <TabPanel>
            <Grid gap={6} minH="60vh" templateColumns="1fr 2fr">
              <AlertList alerts={alerts} onAlertClick={displayAlertDetails} />
              <AlertDetailsPanel alert={selectedAlert} />
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

HistoricalDataScreen.propTypes = {
  // No props for the screen component itself, as it manages its own state.
};