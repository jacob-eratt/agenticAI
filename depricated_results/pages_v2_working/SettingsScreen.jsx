import React, { useState, useCallback } from 'react';
import { Box, Flex, Text, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Button from '../components/Button';
import RadioGroup from '../components/RadioGroup';
import NotificationPreferenceSection from '../components/NotificationPreferenceSection';
import ToggleSwitch from '../components/ToggleSwitch';
import TextInput from '../components/TextInput';
import ConfirmationDialog from '../components/ConfirmationDialog';

/**
 * SettingsScreen component displays various application settings,
 * including unit preferences, theme selection, font size, and notification preferences.
 * It allows users to customize their experience within the application.
 */
export default function SettingsScreen() {
  const [unit, setUnit] = useState('Metric');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');
  const [dailyWeatherSummary, setDailyWeatherSummary] = useState(true);
  const [severeWeatherAlerts, setSevereWeatherAlerts] = useState(true);
  const [immediateWeatherAlerts, setImmediateWeatherAlerts] = useState(false);
  const [precipitationReminders, setPrecipitationReminders] = useState(false);
  const [alertType, setAlertType] = useState(['Push Notification']);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [enableSmsNotifications, setEnableSmsNotifications] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEmailConfirmationOpen, setIsEmailConfirmationOpen] = useState(false);

  /**
   * Handles the change in unit selection.
   * @param {string} value - The selected unit (Metric or Imperial).
   */
  const handleUnitChange = useCallback((value) => {
    setUnit(value);
    // In a real application, you would save this preference, e.g., to localStorage or a backend.
    console.log('Unit changed to:', value);
  }, []);

  /**
   * Handles the change in theme selection.
   * @param {string} value - The selected theme (light or dark).
   */
  const handleThemeChange = useCallback((value) => {
    setTheme(value);
    // In a real application, you would apply the theme and save the preference.
    console.log('Theme changed to:', value);
  }, []);

  /**
   * Handles the change in font size selection.
   * @param {string} value - The selected font size (small, medium, or large).
   */
  const handleFontSizeChange = useCallback((value) => {
    setFontSize(value);
    // In a real application, you would apply the font size and save the preference.
    console.log('Font size changed to:', value);
  }, []);

  /**
   * Toggles the daily weather summary notification.
   */
  const handleDailyWeatherSummaryToggle = useCallback(() => {
    setDailyWeatherSummary((prev) => !prev);
  }, []);

  /**
   * Toggles the severe weather alerts notification.
   */
  const handleSevereWeatherAlertsToggle = useCallback(() => {
    setSevereWeatherAlerts((prev) => !prev);
  }, []);

  /**
   * Toggles the immediate weather alerts notification.
   */
  const handleImmediateWeatherAlertsToggle = useCallback(() => {
    setImmediateWeatherAlerts((prev) => !prev);
  }, []);

  /**
   * Toggles the precipitation reminders notification.
   */
  const handlePrecipitationRemindersToggle = useCallback(() => {
    setPrecipitationReminders((prev) => !prev);
  }, []);

  /**
   * Handles the change in alert type selection.
   * @param {string[]} value - The selected alert types.
   */
  const handleAlertTypeChange = useCallback((value) => {
    setAlertType(value);
  }, []);

  /**
   * Handles the toggle for enabling/disabling email notifications.
   */
  const handleEnableEmailNotificationsToggle = useCallback(() => {
    setEnableEmailNotifications((prev) => !prev);
  }, []);

  /**
   * Handles the change in email address input.
   * @param {object} event - The change event from the input field.
   */
  const handleEmailAddressChange = useCallback((event) => {
    setEmailAddress(event.target.value);
  }, []);

  /**
   * Saves email notification preferences.
   */
  const saveEmailPreferences = useCallback(() => {
    console.log('Saving email preferences:', { enableEmailNotifications, emailAddress });
    setIsEmailConfirmationOpen(true);
    // In a real application, you would send this data to a backend.
  }, [enableEmailNotifications, emailAddress]);

  /**
   * Handles the toggle for enabling/disabling SMS notifications.
   */
  const handleSmsToggleChange = useCallback(() => {
    setEnableSmsNotifications((prev) => !prev);
  }, []);

  /**
   * Handles the change in phone number input.
   * @param {object} event - The change event from the input field.
   */
  const handlePhoneNumberChange = useCallback((event) => {
    setPhoneNumber(event.target.value);
  }, []);

  /**
   * Saves SMS notification preferences.
   */
  const handleSaveSmsPreferences = useCallback(() => {
    console.log('Saving SMS preferences:', { enableSmsNotifications, phoneNumber });
    // In a real application, you would send this data to a backend.
  }, [enableSmsNotifications, phoneNumber]);

  /**
   * Navigates back to the dashboard.
   */
  const navigateBackToDashboard = useCallback(() => {
    // In a real application, this would use react-router-dom's useNavigate hook.
    console.log('Navigating back to dashboard');
    alert('Navigating back to dashboard (functionality not implemented in this demo)');
  }, []);

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={{ base: 4, md: 8 }}
      width="100%"
    >
      <Flex direction="column" gap={6} width="100%" maxWidth="600px" margin="0 auto">
        {/* Header section */}
        <Flex direction="row" justifyContent="center" pb={4} width="100%">
          <Button
            label="Back"
            onClick={navigateBackToDashboard}
            size="md"
            variant="ghost"
            colorScheme="gray"
          />
        </Flex>

        {/* Units of Measurement */}
        <RadioGroup
          colorScheme="blue"
          direction={{ base: 'column', md: 'row' }}
          label="Units of Measurement"
          onChange={handleUnitChange}
          options={['Metric', 'Imperial']}
          size="md"
          spacing={{ base: 4, md: 8 }}
          value={unit}
          width={{ base: '100%', md: 'auto' }}
          alignSelf="center"
        />

        {/* Select Theme */}
        <RadioGroup
          colorScheme="purple"
          direction={{ base: 'column', md: 'row' }}
          label="Select Theme"
          onChange={handleThemeChange}
          options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
          size="md"
          spacing={{ base: 4, md: 8 }}
          value={theme}
          width={{ base: '100%', md: 'auto' }}
          alignSelf="center"
        />

        {/* Select Font Size */}
        <RadioGroup
          colorScheme="teal"
          direction={{ base: 'column', md: 'row' }}
          label="Select Font Size"
          onChange={handleFontSizeChange}
          options={[{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }]}
          size="md"
          spacing={{ base: 4, md: 8 }}
          value={fontSize}
          width={{ base: '100%', md: 'auto' }}
          alignSelf="center"
        />

        {/* Notification Preferences */}
        <NotificationPreferenceSection
          alignSelf="center"
          background="white"
          borderRadius="md"
          colorScheme="blue"
          margin={0}
          maxW={{ base: '100%', md: 'lg' }}
          padding={6}
          preferences={[
            { isChecked: dailyWeatherSummary, label: 'Daily Weather Summary', onChange: handleDailyWeatherSummaryToggle, type: 'toggle' },
            { isChecked: severeWeatherAlerts, label: 'Severe Weather Alerts', onChange: handleSevereWeatherAlertsToggle, type: 'toggle' },
            { isChecked: immediateWeatherAlerts, label: 'Immediate Weather Alerts', onChange: handleImmediateWeatherAlertsToggle, type: 'toggle' },
            { isChecked: precipitationReminders, label: 'Precipitation Reminders', onChange: handlePrecipitationRemindersToggle, type: 'toggle' },
            { label: 'Alert Type', onChange: handleAlertTypeChange, options: ['Email', 'SMS', 'Push Notification'], type: 'selector', value: alertType }
          ]}
          size="md"
          title="Notification Preferences"
          variant="outline"
        />

        {/* Email Notifications Section */}
        <NotificationPreferenceSection
          alignSelf="center"
          background="white"
          borderRadius="md"
          colorScheme="blue"
          margin={0}
          maxW={{ base: '100%', md: 'lg' }}
          padding={6}
          preferences={[]} // No direct preferences here, children handle it
          size="md"
          title="Email Notifications"
          variant="outline"
        >
          <Flex alignSelf="center" borderColor="gray.200" borderRadius="md" borderWidth="1px" direction="column" gap={4} maxW={{ base: '100%', md: 'lg' }} p={6}>
            <ToggleSwitch
              isChecked={enableEmailNotifications}
              label="Enable Email Notifications"
              onChange={handleEnableEmailNotificationsToggle}
            />
            <TextInput
              ariaLabel="Email address input"
              placeholder="Enter your email"
              width="100%"
              value={emailAddress}
              onChange={handleEmailAddressChange}
            />
            <Button
              label="Save Preferences"
              onClick={saveEmailPreferences}
              variant="solid"
              width="100%"
              colorScheme="blue"
            />
          </Flex>
        </NotificationPreferenceSection>

        {/* SMS Notifications Section */}
        <NotificationPreferenceSection
          alignSelf="center"
          background="white"
          borderRadius="md"
          colorScheme="blue"
          margin={0}
          maxW={{ base: '100%', md: 'lg' }}
          padding={6}
          preferences={[]} // No direct preferences here, children handle it
          size="md"
          title="SMS Notifications"
          variant="outline"
        >
          <Flex alignSelf="center" borderColor="gray.200" borderRadius="md" borderWidth="1px" direction="column" gap={4} maxW={{ base: '100%', md: 'lg' }} p={6}>
            <ToggleSwitch
              isChecked={enableSmsNotifications}
              label="Enable SMS Notifications"
              onChange={handleSmsToggleChange}
            />
            <TextInput
              onChange={handlePhoneNumberChange}
              placeholder="Enter phone number"
              value={phoneNumber}
              width="100%"
              ariaLabel="Phone number input"
            />
            <Button
              label="Save Preferences"
              onClick={handleSaveSmsPreferences}
              variant="solid"
              width="100%"
              colorScheme="blue"
            />
          </Flex>
        </NotificationPreferenceSection>
      </Flex>

      {/* Confirmation Dialog for Email Preferences */}
      <ConfirmationDialog
        isOpen={isEmailConfirmationOpen}
        onClose={() => setIsEmailConfirmationOpen(false)}
        message="Your email notification preferences have been saved successfully."
        title="Preferences Saved"
      />
    </Flex>
  );
}

SettingsScreen.propTypes = {
  // No props are passed to the SettingsScreen component directly,
  // as it manages its own state and interactions.
};