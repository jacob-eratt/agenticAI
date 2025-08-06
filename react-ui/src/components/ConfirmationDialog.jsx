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
 * @property {function} onClose - Callback function when the dialog is closed (e.g., by clicking outside, pressing Escape, or clicking Cancel/OK).
 * @property {function} [onConfirm] - Callback function when the confirm button is clicked. If provided, the dialog acts as a confirmation; otherwise, it acts as an informational dialog with an "OK" button.
 * @property {string} title - Title of the confirmation dialog.
 * @property {string} message - Message content of the confirmation dialog.
 * @property {string} [confirmButtonText='Confirm' | 'OK'] - Text for the confirm/OK button. Defaults to 'Confirm' if `onConfirm` is provided, otherwise 'OK'.
 * @property {string} [cancelButtonText='Cancel'] - Text for the cancel button. Only visible if `onConfirm` is provided. Defaults to 'Cancel'.
 * @property {string} [confirmButtonColorScheme='blue'] - Chakra UI color scheme for the confirm/OK button.
 * @property {string} [cancelButtonColorScheme='gray'] - Chakra UI color scheme for the cancel button.
 */

/**
 * A versatile dialog component for confirming user actions or displaying important information.
 * It can function as a confirmation dialog (with Confirm/Cancel buttons) or an informational dialog (with an OK button).
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
  confirmButtonText,
  cancelButtonText,
  confirmButtonColorScheme = 'blue',
  cancelButtonColorScheme = 'gray',
}) {
  // Determine modal size based on breakpoint for responsiveness
  const modalSize = useBreakpointValue({ base: 'xs', sm: 'md', md: 'lg' });

  // Default button texts based on whether onConfirm is provided
  const defaultConfirmText = onConfirm ? 'Confirm' : 'OK';
  const finalConfirmButtonText = confirmButtonText || defaultConfirmText;
  const finalCancelButtonText = cancelButtonText || 'Cancel';

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
      <ModalOverlay />
      <ModalContent borderRadius="md" overflow="hidden">
        <ModalHeader
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          color="gray.700"
          pb={2}
          pt={4}
          px={6}
        >
          {title}
        </ModalHeader>

        <ModalBody
          fontSize={{ base: 'sm', md: 'md' }}
          color="gray.600"
          py={2}
          px={6}
        >
          <Text>{message}</Text>
        </ModalBody>

        <ModalFooter
          pt={4}
          pb={4}
          px={6}
          borderTopWidth="1px"
          borderColor="gray.100"
          display="flex"
          justifyContent={onConfirm ? 'flex-end' : 'center'}
          gap={3}
        >
          {onConfirm ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                colorScheme={cancelButtonColorScheme}
                size="md"
                aria-label={finalCancelButtonText}
              >
                {finalCancelButtonText}
              </Button>
              <Button
                colorScheme={confirmButtonColorScheme}
                onClick={() => {
                  onConfirm();
                  onClose(); // Close dialog after confirmation
                }}
                size="md"
                aria-label={finalConfirmButtonText}
              >
                {finalConfirmButtonText}
              </Button>
            </>
          ) : (
            <Button
              colorScheme={confirmButtonColorScheme}
              onClick={onClose}
              size="md"
              aria-label={finalConfirmButtonText}
            >
              {finalConfirmButtonText}
            </Button>
          )}
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
   * Callback function when the dialog is closed (e.g., by clicking outside, pressing Escape, or clicking Cancel/OK).
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Callback function when the confirm button is clicked. If provided, the dialog acts as a confirmation; otherwise, it acts as an informational dialog with an "OK" button.
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
   * Text for the confirm/OK button. Defaults to 'Confirm' if `onConfirm` is provided, otherwise 'OK'.
   */
  confirmButtonText: PropTypes.string,
  /**
   * Text for the cancel button. Only visible if `onConfirm` is provided. Defaults to 'Cancel'.
   */
  cancelButtonText: PropTypes.string,
  /**
   * Chakra UI color scheme for the confirm/OK button.
   */
  confirmButtonColorScheme: PropTypes.string,
  /**
   * Chakra UI color scheme for the cancel button.
   */
  cancelButtonColorScheme: PropTypes.string,
};