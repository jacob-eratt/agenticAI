import React, { useState } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import NotificationPreferenceSection from '../components/NotificationPreferenceSection';
import ToggleSwitch from '../components/ToggleSwitch';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

/**
 * SettingsScreen component displays various application settings,
 * including general preferences and notification settings.
 * It uses Chakra UI for layout and styling, and custom components
 * for specific setting controls.
 */
export default function SettingsScreen() {
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  /**
   * Handles the change event for the SMS notification toggle switch.
   * @param {boolean} isChecked - The new checked state of the toggle.
   */
  const handleSmsToggleChange = (isChecked) => {
    setIsSmsEnabled(isChecked);
    // In a real application, you would save this preference to a backend or local storage.
    console.log('SMS Notifications Enabled:', isChecked);
  };

  /**
   * Handles the change event for the phone number input field.
   * @param {Event} event - The input change event.
   */
  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  /**
   * Handles the click event for the Save Preferences button.
   * This function would typically send the updated preferences to a server.
   */
  const handleSaveSmsPreferences = () => {
    console.log('Saving SMS Preferences:', { isSmsEnabled, phoneNumber });
    // In a real application, you would make an API call here to save the preferences.
    alert('SMS Preferences Saved!');
  };

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
      {/* Header Section */}
      <Box
        width="100%"
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        px={{ base: 3, md: 6 }}
        py={6}
      >
        <Heading
          as="h1"
          size={{ base: 'xl', md: '2xl' }}
          color="gray.800"
          textAlign="center"
        >
          Settings
        </Heading>
      </Box>

      {/* Main Content Area */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        alignItems="flex-start"
        gap={{ base: 4, md: 8 }}
        flex={1}
        maxW={{ base: '100%', lg: '1200px' }}
        mx="auto"
        px={0}
        py={{ base: 2, md: 4 }}
        width="100%"
      >
        {/* Left Column: General Settings */}
        <Flex direction="column" flex={1} gap={4} width="100%">
          <Box
            width="100%"
            bg="white"
            borderRadius="md"
            boxShadow="md"
            p={{ base: 4, md: 6 }}
          >
            <Heading as="h2" size="lg" mb={4}>
              General Settings
            </Heading>
            {/* Add general settings components here */}
          </Box>
        </Flex>

        {/* Right Column: Notification Preferences */}
        <Box
          width="100%"
          bg="white"
          borderRadius="md"
          boxShadow="md"
          p={{ base: 4, md: 6 }}
        >
          <Heading as="h2" size="lg" mb={4}>
            Notification Preferences
          </Heading>
          <NotificationPreferenceSection
            title="SMS Notification Preferences"
            preferences={[]} // This prop is not used in the current layout, but kept for component consistency.
            width="100%"
          >
            <ToggleSwitch
              isChecked={isSmsEnabled}
              onChange={handleSmsToggleChange}
              label="Enable SMS Notifications"
              width="100%"
            />
            <TextInput
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter phone number"
              width="100%"
            />
            <Button
              label="Save Preferences"
              onClick={handleSaveSmsPreferences}
              mt={4}
              width="100%"
            />
          </NotificationPreferenceSection>
        </Box>
      </Flex>
    </Flex>
  );
}

SettingsScreen.propTypes = {
  // No props currently defined for the SettingsScreen component itself.
  // Add prop types here if the screen ever accepts props.
};
