import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  RadioGroup,
  Radio,
  Stack,
  Flex,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Input,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Assuming these components exist in the components folder
// import NotificationPreferenceSection from '../../components/notification_preference_section';
// import MultiSelect from '../../components/multi_select';
// import ToggleSwitch from '../../components/toggle_switch';
// import TextInput from '../../components/text_input';
// import ConfirmationDialog from '../../components/confirmation_dialog';

// Placeholder components for now, as I cannot verify their existence or content
const NotificationPreferenceSection = ({ title, children }) => (
  <Box p={4} borderWidth={1} borderRadius="md" bg="white" maxW="sm" mx="auto">
    <Text fontSize="lg" mb={2} color="gray.700" fontWeight="bold">{title}</Text>
    {children}
  </Box>
);

NotificationPreferenceSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const MultiSelect = ({ options, value, onChange, placeholder }) => (
  <Box>
    <Text mb={2}>{placeholder}</Text>
    <Input placeholder={placeholder} value={value} onChange={onChange} />
  </Box>
);

MultiSelect.propTypes = {
  options: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

const ToggleSwitch = ({ label, isChecked, onChange }) => (
  <FormControl display="flex" alignItems="center">
    <FormLabel htmlFor="toggle-switch" mb="0">
      {label}
    </FormLabel>
    <Switch id="toggle-switch" isChecked={isChecked} onChange={onChange} />
  </FormControl>
);

ToggleSwitch.propTypes = {
  label: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const TextInput = ({ label, value, onChange, placeholder, type = "text" }) => (
  <FormControl>
    <FormLabel>{label}</FormLabel>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </FormControl>
);

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
};

const ConfirmationDialog = ({ isOpen, onClose, header, body, confirmButtonText, onConfirm }) => {
  const cancelRef = useRef();
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {header}
          </AlertDialogHeader>

          <AlertDialogBody>
            {body}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onConfirm} ml={3}>
              {confirmButtonText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  confirmButtonText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
};


export default function SettingsScreen() {
  const toast = useToast();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(localStorage.getItem('unit') || 'metric');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    JSON.parse(localStorage.getItem('emailNotificationsEnabled')) || false
  );
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(
    JSON.parse(localStorage.getItem('smsNotificationsEnabled')) || false
  );
  const [emailAddress, setEmailAddress] = useState(localStorage.getItem('emailAddress') || '');
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [selectedNotificationParameters, setSelectedNotificationParameters] = useState(
    localStorage.getItem('selectedNotificationParameters') || ''
  );

  useEffect(() => {
    localStorage.setItem('unit', unit);
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('emailNotificationsEnabled', JSON.stringify(emailNotificationsEnabled));
    localStorage.setItem('smsNotificationsEnabled', JSON.stringify(smsNotificationsEnabled));
    localStorage.setItem('emailAddress', emailAddress);
    localStorage.setItem('phoneNumber', phoneNumber);
    localStorage.setItem('selectedNotificationParameters', selectedNotificationParameters);
  }, [
    unit,
    theme,
    fontSize,
    emailNotificationsEnabled,
    smsNotificationsEnabled,
    emailAddress,
    phoneNumber,
    selectedNotificationParameters,
  ]);

  const handleSavePreferences = () => {
    setShowConfirmationDialog(true);
  };

  const confirmSavePreferences = () => {
    toast({
      title: 'Preferences saved.',
      description: 'Your settings have been successfully updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setShowConfirmationDialog(false);
  };

  return (
    <Flex bg="gray.50" direction="column" gap={6} minH="100vh" p={8}>
      <Flex justifyContent="flex-start" mb={4}>
        <Button
          onClick={() => navigate('/dashboard')}
          colorScheme="blue"
          variant="outline"
          size="md"
          borderRadius="md"
          boxShadow="sm"
        >
          Back to Dashboard
        </Button>
      </Flex>

      <Flex
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        direction="column"
        gap={8}
        maxW="xl"
        mx="auto"
        p={6}
        w="full"
      >
        <Flex direction="column" gap={4}>
          <Box p={4} borderWidth={1} borderRadius="md" bg="white">
            <Text fontSize="lg" mb={2} color="gray.700" fontWeight="bold">Units of Measurement</Text>
            <RadioGroup value={unit} onChange={setUnit}>
              <Stack direction="row" spacing={5}>
                <Radio value="metric" colorScheme="blue" size="md">Metric</Radio>
                <Radio value="imperial" colorScheme="blue" size="md">Imperial</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          <Box p={4} borderWidth={1} borderRadius="md" bg="white">
            <Text fontSize="lg" mb={2} color="gray.700" fontWeight="bold">Application Theme</Text>
            <RadioGroup value={theme} onChange={setTheme}>
              <Stack direction="row" spacing={5}>
                <Radio value="light" colorScheme="blue" size="md">Light</Radio>
                <Radio value="dark" colorScheme="blue" size="md">Dark</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          <Box p={4} borderWidth={1} borderRadius="md" bg="white">
            <Text fontSize="lg" mb={2} color="gray.700" fontWeight="bold">Font Size</Text>
            <RadioGroup value={fontSize} onChange={setFontSize}>
              <Stack direction="row" spacing={5}>
                <Radio value="small" colorScheme="blue" size="md">Small</Radio>
                <Radio value="medium" colorScheme="blue" size="md">Medium</Radio>
                <Radio value="large" colorScheme="blue" size="md">Large</Radio>
              </Stack>
            </RadioGroup>
          </Box>
        </Flex>

        <NotificationPreferenceSection title="General Notification Preferences">
          <Flex direction="column" gap={4}>
            <Button
              colorScheme="teal"
              variant="solid"
              size="md"
              borderRadius="md"
              boxShadow="sm"
              onClick={() => console.log('Customize Notifications')}
            >
              Customize Notification Options
            </Button>
            <MultiSelect
              placeholder="Select notification parameters"
              options={['Email', 'SMS', 'Push']}
              value={selectedNotificationParameters}
              onChange={(e) => setSelectedNotificationParameters(e.target.value)}
            />
          </Flex>
        </NotificationPreferenceSection>

        <NotificationPreferenceSection title="Email Notification Preferences">
          <ToggleSwitch
            label="Enable Email Notifications"
            isChecked={emailNotificationsEnabled}
            onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
          />
          <TextInput
            label="Email Address"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="Enter your email address"
            type="email"
          />
          <Button
            colorScheme="blue"
            variant="solid"
            size="md"
            borderRadius="md"
            boxShadow="sm"
            onClick={handleSavePreferences}
          >
            Save Email Preferences
          </Button>
        </NotificationPreferenceSection>

        <NotificationPreferenceSection title="SMS Notification Preferences">
          <ToggleSwitch
            label="Enable SMS Notifications"
            isChecked={smsNotificationsEnabled}
            onChange={(e) => setSmsNotificationsEnabled(e.target.checked)}
          />
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            type="tel"
          />
          <Button
            colorScheme="blue"
            variant="solid"
            size="md"
            borderRadius="md"
            boxShadow="sm"
            onClick={handleSavePreferences}
          >
            Save SMS Preferences
          </Button>
        </NotificationPreferenceSection>
      </Flex>

      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        header="Confirm Save"
        body="Are you sure you want to save these preferences?"
        confirmButtonText="Save"
        onConfirm={confirmSavePreferences}
      />
    </Flex>
  );
}

SettingsScreen.propTypes = {};
