import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    // Always close the dialog after an action (confirm or cancel)
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent
        borderRadius="lg"
        boxShadow="xl"
        bg="white"
        maxW={{ base: "90%", md: "md" }}
        mx="auto"
      >
        <ModalHeader
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color="gray.800"
          pb={2}
          pt={4}
          px={6}
        >
          {title || "Confirmation"}
        </ModalHeader>

        <ModalBody py={2} px={6}>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            {message || "Are you sure you want to proceed with this action?"}
          </Text>
        </ModalBody>

        <ModalFooter pt={4} pb={4} px={6}>
          {onConfirm ? (
            <>
              <Button
                variant="ghost"
                onClick={onClose}
                mr={3}
                colorScheme="gray"
                size={{ base: "md", md: "lg" }}
                borderRadius="md"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirm}
                size={{ base: "md", md: "lg" }}
                borderRadius="md"
              >
                Confirm
              </Button>
            </>
          ) : (
            <Button
              colorScheme="blue"
              onClick={onClose}
              size={{ base: "md", md: "lg" }}
              borderRadius="md"
            >
              OK
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
   * Callback function when the dialog is closed (e.g., by clicking overlay, escape key, or cancel/OK button).
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Callback function when the confirm button is clicked. If not provided, the dialog will show a single "OK" button.
   */
  onConfirm: PropTypes.func,
  /**
   * Title of the confirmation dialog.
   */
  title: PropTypes.string,
  /**
   * Message content of the confirmation dialog.
   */
  message: PropTypes.string,
};