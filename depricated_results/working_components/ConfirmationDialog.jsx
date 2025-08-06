import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';

/**
 * @typedef {object} ConfirmationDialogProps
 * @property {boolean} isOpen - Controls the visibility of the dialog.
 * @property {function} onClose - Callback function when the dialog is closed (e.g., by clicking overlay, escape key, or cancel button).
 * @property {function} [onConfirm] - Callback function when the confirm button is clicked. If not provided, the dialog acts as an alert with an "OK" button.
 * @property {string} title - Title of the confirmation dialog.
 * @property {string} message - Message content of the confirmation dialog.
 * @property {string} [confirmButtonText='Confirm'] - Text for the confirm button. If `onConfirm` is not provided, this defaults to "OK".
 * @property {string} [cancelButtonText='Cancel'] - Text for the cancel button. Only visible if `onConfirm` is provided.
 * @property {string} [confirmButtonColorScheme='blue'] - Color scheme for the confirm button.
 */

/**
 * A dialog box to confirm user actions or display important alerts.
 * It supports both a confirmation flow (with Confirm/Cancel buttons)
 * and an alert flow (with a single OK button).
 *
 * @param {ConfirmationDialogProps} props - The props for the ConfirmationDialog component.
 * @returns {JSX.Element} The ConfirmationDialog component.
 */
export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonColorScheme = 'blue',
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Determine button text and behavior based on whether onConfirm is provided
  const isConfirmationMode = typeof onConfirm === 'function';
  const finalConfirmButtonText = isConfirmationMode ? confirmButtonText : 'OK';

  const handleConfirm = () => {
    if (isConfirmationMode) {
      onConfirm();
    }
    onClose(); // Always close the dialog after action
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent
        borderRadius="lg"
        boxShadow="xl"
        maxW={{ base: '90%', md: 'md' }}
        mx="auto"
        my="auto"
        p={isMobile ? 2 : 4}
      >
        <ModalHeader
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="bold"
          color="gray.800"
          pb={2}
        >
          {title}
        </ModalHeader>

        <ModalBody pb={isMobile ? 2 : 4}>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
            {message}
          </Text>
        </ModalBody>

        <ModalFooter
          display="flex"
          flexDirection={{ base: 'column-reverse', md: 'row' }}
          justifyContent={isConfirmationMode ? 'space-between' : 'flex-end'}
          gap={isMobile ? 2 : 4}
          pt={isMobile ? 2 : 0}
        >
          {isConfirmationMode && (
            <Button
              variant="outline"
              onClick={onClose}
              colorScheme="gray"
              size={isMobile ? 'md' : 'lg'}
              width={isMobile ? 'full' : 'auto'}
            >
              {cancelButtonText}
            </Button>
          )}
          <Button
            colorScheme={confirmButtonColorScheme}
            onClick={handleConfirm}
            size={isMobile ? 'md' : 'lg'}
            width={isMobile ? 'full' : 'auto'}
          >
            {finalConfirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

ConfirmationDialog.propTypes = {
  /**
   * Controls the visibility of the dialog.
   */
  isOpen: PropTypes.bool.isRequired,
  /**
   * Callback function when the dialog is closed (e.g., by clicking overlay, escape key, or cancel button).
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Callback function when the confirm button is clicked. If not provided, the dialog acts as an alert with an "OK" button.
   */
  onConfirm: PropTypes.func,
  /**
   * Title of the confirmation dialog.
   */
  title: PropTypes.string.isRequired,
  /**
   * Message content of the confirmation dialog.
   */
  message: PropTypes.string.isRequired,
  /**
   * Text for the confirm button. If `onConfirm` is not provided, this defaults to "OK".
   */
  confirmButtonText: PropTypes.string,
  /**
   * Text for the cancel button. Only visible if `onConfirm` is provided.
   */
  cancelButtonText: PropTypes.string,
  /**
   * Color scheme for the confirm button.
   */
  confirmButtonColorScheme: PropTypes.string,
};