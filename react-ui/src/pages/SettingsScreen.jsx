import React, { useState, useCallback } from 'react';
import { Box, Flex, Stack, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {
  RadioGroup,
  NotificationPreferenceSection,
  Button,
  MultiSelect,
  ToggleSwitch,
  TextInput,
  ConfirmationDialog
} from '../components';

/**
 * @typedef {object} SettingsScreenProps
 */

/**
 * SettingsScreen component for managing application settings and preferences.
 * Allows users to configure units of measurement, theme, font size, and notification preferences.
 * @param {SettingsScreenProps} props - Props for the SettingsScreen component.
 * @returns {JSX.Element} The rendered SettingsScreen component.
 */
export default function SettingsScreen() {
  const toast = useToast();

  // State for general settings
  const [unit, setUnit] = useState('Metric');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  // State for notification preferences
  const [dailyWeatherSummaryEnabled, setDailyWeatherSummaryEnabled] = useState(true);
  const [severeWeatherAlertsEnabled, setSevereWeatherAlertsEnabled] = useState(true);
  const [immediateWeatherAlertsEnabled, setImmediateWeatherAlertsEnabled] = useState(false);
  const [precipitationRemindersEnabled, setPrecipitationRemindersEnabled] = useState(false);
  const [alertType, setAlertType] = useState(['Push Notification']);
  const [notificationParameters, setNotificationParameters] = useState([]);

  // State for email notifications
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // State for SMS notifications
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // State for confirmation dialog
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  // Handlers for general settings
  const handleUnitChange = useCallback((value) => {
    setUnit(value);
    toast({
      title: "Unit changed.",
      description: `Units set to ${value}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleThemeChange = useCallback((value) => {
    setTheme(value);
    toast({
      title: "Theme changed.",
      description: `Application theme set to ${value}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleFontSizeChange = useCallback((value) => {
    setFontSize(value);
    toast({
      title: "Font size changed.",
      description: `Font size set to ${value}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Handlers for notification preferences
  const expandNotificationCustomization = useCallback(() => {
    toast({
      title: "Customize Parameters",
      description: "Expanding notification customization options.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleNotificationParameterChange = useCallback((values) => {
    setNotificationParameters(values);
    toast({
      title: "Notification parameters updated.",
      description: `Selected parameters: ${values.join(', ')}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleDailyWeatherSummaryToggle = useCallback(() => {
    setDailyWeatherSummaryEnabled(prev => !prev);
    toast({
      title: "Preference updated.",
      description: `Daily Weather Summary notifications ${dailyWeatherSummaryEnabled ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [dailyWeatherSummaryEnabled, toast]);

  const handleSevereWeatherAlertsToggle = useCallback(() => {
    setSevereWeatherAlertsEnabled(prev => !prev);
    toast({
      title: "Preference updated.",
      description: `Severe Weather Alerts notifications ${severeWeatherAlertsEnabled ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [severeWeatherAlertsEnabled, toast]);

  const handleImmediateWeatherAlertsToggle = useCallback(() => {
    setImmediateWeatherAlertsEnabled(prev => !prev);
    toast({
      title: "Preference updated.",
      description: `Immediate Weather Alerts notifications ${immediateWeatherAlertsEnabled ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [immediateWeatherAlertsEnabled, toast]);

  const handlePrecipitationRemindersToggle = useCallback(() => {
    setPrecipitationRemindersEnabled(prev => !prev);
    toast({
      title: "Preference updated.",
      description: `Precipitation Reminders notifications ${precipitationRemindersEnabled ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [precipitationRemindersEnabled, toast]);

  const handleAlertTypeChange = useCallback((value) => {
    setAlertType(value);
    toast({
      title: "Alert type updated.",
      description: `Alert type set to ${value}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Handlers for email notifications
  const handleEmailNotificationsToggle = useCallback(() => {
    setEmailNotificationsEnabled(prev => !prev);
    toast({
      title: "Email notifications.",
      description: `Email notifications ${emailNotificationsEnabled ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [emailNotificationsEnabled, toast]);

  const handleEmailAddressChange = useCallback((e) => {
    setEmailAddress(e.target.value);
  }, []);

  const saveEmailPreferences = useCallback(() => {
    // In a real app, you would send this data to a backend
    console.log("Saving email preferences:", { emailNotificationsEnabled, emailAddress });
    setIsConfirmationDialogOpen(true);
    toast({
      title: "Email Preferences Saved.",
      description: "Your email notification preferences have been saved successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [emailNotificationsEnabled, emailAddress, toast]);

  // Handlers for SMS notifications
  const handleSmsToggleChange = useCallback(() => {
    setSmsNotificationsEnabled(prev => !prev);
    toast({
      title: "SMS notifications.",
      description: `SMS notifications ${smsNotificationsEnabled ? 'disabled' : 'enabled'}.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [smsNotificationsEnabled, toast]);

  const handlePhoneNumberChange = useCallback((e) => {
    setPhoneNumber(e.target.value);
  }, []);

  const handleSaveSmsPreferences = useCallback(() => {
    // In a real app, you would send this data to a backend
    console.log("Saving SMS preferences:", { smsNotificationsEnabled, phoneNumber });
    toast({
      title: "SMS Preferences Saved.",
      description: "Your SMS notification preferences have been saved successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [smsNotificationsEnabled, phoneNumber, toast]);

  // Handler for navigation
  const navigateBackToDashboard = useCallback(() => {
    toast({
      title: "Navigation",
      description: "Navigating back to Dashboard.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    // In a real app, you would use react-router-dom's useNavigate hook here
    // navigate('/dashboard');
  }, [toast]);

  const closeConfirmationDialog = useCallback(() => {
    setIsConfirmationDialogOpen(false);
  }, []);

  return (
    <Flex
      direction="column"
      gap={8}
      maxWidth="800px"
      mx="auto"
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      aria-label="Settings Screen"
    >
      {/* General Settings */}
      <Flex direction="column" gap={4} mb={6}>
        <RadioGroup
          label="Units of Measurement"
          onChange={handleUnitChange}
          options={["Metric", "Imperial"]}
          selectedValue={unit}
          aria-label="Select units of measurement"
        />
        <RadioGroup
          label="Application Theme"
          onChange={handleThemeChange}
          options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }]}
          selectedValue={theme}
          aria-label="Select application theme"
        />
        <RadioGroup
          label="Font Size"
          onChange={handleFontSizeChange}
          options={[{ label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" }]}
          selectedValue={fontSize}
          aria-label="Select font size"
        />
      </Flex>

      {/* Notification Preferences Section */}
      <NotificationPreferenceSection
        title="Notification Preferences"
        preferences={[
          {
            isChecked: dailyWeatherSummaryEnabled,
            label: "Daily Weather Summary",
            onChange: handleDailyWeatherSummaryToggle,
            type: "toggle",
            ariaLabel: "Toggle daily weather summary notifications"
          },
          {
            isChecked: severeWeatherAlertsEnabled,
            label: "Severe Weather Alerts",
            onChange: handleSevereWeatherAlertsToggle,
            type: "toggle",
            ariaLabel: "Toggle severe weather alerts"
          },
          {
            isChecked: immediateWeatherAlertsEnabled,
            label: "Immediate Weather Alerts",
            onChange: handleImmediateWeatherAlertsToggle,
            type: "toggle",
            ariaLabel: "Toggle immediate weather alerts"
          },
          {
            isChecked: precipitationRemindersEnabled,
            label: "Precipitation Reminders",
            onChange: handlePrecipitationRemindersToggle,
            type: "toggle",
            ariaLabel: "Toggle precipitation reminders"
          },
          {
            label: "Alert Type",
            onChange: handleAlertTypeChange,
            options: ["Email", "SMS", "Push Notification"],
            type: "selector",
            value: alertType,
            ariaLabel: "Select alert type"
          }
        ]}
        aria-label="General notification preferences"
      >
        <Flex direction="column" gap={3} mt={4}>
          <Button
            label="Customize Parameters"
            onClick={expandNotificationCustomization}
            colorScheme="blue"
            variant="outline"
            size="md"
            aria-label="Customize notification parameters"
          />
          <MultiSelect
            onChange={handleNotificationParameterChange}
            options={["Time", "Conditions", "Frequency"]}
            selectedValues={notificationParameters}
            placeholder="Select notification parameters"
            aria-label="Select notification parameters"
          />
        </Flex>
      </NotificationPreferenceSection>

      {/* Email Notifications Section */}
      <NotificationPreferenceSection
        title="Email Notifications"
        aria-label="Email notification settings"
      >
        <Flex direction="column" gap={3} mt={4}>
          <ToggleSwitch
            isChecked={emailNotificationsEnabled}
            label="Enable Email Notifications"
            onChange={handleEmailNotificationsToggle}
            aria-label="Enable or disable email notifications"
          />
          <TextInput
            ariaLabel="Email address input"
            placeholder="Enter your email"
            value={emailAddress}
            onChange={handleEmailAddressChange}
            isDisabled={!emailNotificationsEnabled}
          />
          <Button
            label="Save Preferences"
            onClick={saveEmailPreferences}
            variant="solid"
            colorScheme="green"
            size="md"
            aria-label="Save email notification preferences"
          />
        </Flex>
      </NotificationPreferenceSection>

      {/* SMS Notification Preferences Section */}
      <NotificationPreferenceSection
        title="SMS Notification Preferences"
        aria-label="SMS notification settings"
      >
        <Flex direction="column" gap={3} mt={4}>
          <ToggleSwitch
            isChecked={smsNotificationsEnabled}
            label="Enable SMS Notifications"
            onChange={handleSmsToggleChange}
            aria-label="Enable or disable SMS notifications"
          />
          <TextInput
            onChange={handlePhoneNumberChange}
            placeholder="Enter phone number"
            value={phoneNumber}
            isDisabled={!smsNotificationsEnabled}
            aria-label="Phone number input for SMS notifications"
          />
          <Button
            label="Save Preferences"
            onClick={handleSaveSmsPreferences}
            colorScheme="green"
            variant="solid"
            size="md"
            aria-label="Save SMS notification preferences"
          />
        </Flex>
      </NotificationPreferenceSection>

      {/* Back to Dashboard Button */}
      <Button
        label="Back to Dashboard"
        onClick={navigateBackToDashboard}
        variant="ghost"
        colorScheme="gray"
        size="md"
        alignSelf="flex-start"
        aria-label="Navigate back to dashboard"
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={closeConfirmationDialog}
        message="Your email notification preferences have been saved successfully."
        title="Preferences Saved"
        aria-label="Email preferences saved confirmation"
      />
    </Flex>
  );
}

SettingsScreen.propTypes = {
  // No props defined for the screen itself based on the layout JSON,
  // but included for completeness.
};
