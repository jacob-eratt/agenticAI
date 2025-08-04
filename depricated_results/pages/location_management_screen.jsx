import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  VStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';

// Placeholder for LocationList component
const LocationList = ({ items, itemKey, onSelect, isReorderable, onReorder, ariaLabel, onDelete }) => {
  // In a real application, reorder and select logic would be more complex,
  // potentially involving drag-and-drop libraries or more sophisticated state management.
  return (
    <VStack spacing={2} align="stretch" borderWidth={1} borderRadius="md" p={4} aria-label={ariaLabel}>
      {items.length === 0 ? (
        <Text color="gray.500">No locations to display.</Text>
      ) : (
        items.map((item) => (
          <Flex
            key={item[itemKey]}
            p={2}
            borderWidth={1}
            borderRadius="md"
            justifyContent="space-between"
            alignItems="center"
            bg="white"
            _hover={{ bg: "gray.50" }}
          >
            <Text fontSize="md" fontWeight="medium" color="gray.700">{item.name}</Text>
            <Box>
              {onSelect && (
                <Button size="sm" onClick={() => onSelect(item)} mr={2} colorScheme="blue" variant="outline">Select</Button>
              )}
              {onDelete && (
                <IconButton
                  aria-label={`Delete ${item.name}`}
                  icon={<FaTrash />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => onDelete(item)}
                />
              )}
            </Box>
          </Flex>
        ))
      )}
    </VStack>
  );
};

LocationList.propTypes = {
  items: PropTypes.array.isRequired,
  itemKey: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  isReorderable: PropTypes.bool,
  onReorder: PropTypes.func,
  ariaLabel: PropTypes.string,
  onDelete: PropTypes.func,
};

// Placeholder for ConfirmationDialog component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  const cancelRef = React.useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="gray.800">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody color="gray.600">
            {message}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="outline" colorScheme="gray">
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Confirm
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
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default function LocationManagementScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [showError, setShowError] = useState(false);
  const toast = useToast();

  // Simulate fetching saved locations on component mount
  useEffect(() => {
    const storedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
    setSavedLocations(storedLocations);
  }, []);

  // Simulate location search
  useEffect(() => {
    if (searchTerm.length > 2) {
      // In a real app, this would be an API call
      const simulatedResults = [
        { id: '1', name: 'New York, USA' },
        { id: '2', name: 'London, UK' },
        { id: '3', name: 'Paris, France' },
      ].filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(simulatedResults);
      setShowNoResults(simulatedResults.length === 0);
    } else {
      setSearchResults([]);
      setShowNoResults(false);
    }
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedSearchResult(null); // Clear selection on new search
  };

  const handleSearchResultSelect = useCallback((location) => {
    setSelectedSearchResult(location);
  }, []);

  const handleSaveLocation = useCallback(() => {
    if (selectedSearchResult && !savedLocations.some(loc => loc.id === selectedSearchResult.id)) {
      const newSavedLocations = [...savedLocations, selectedSearchResult];
      setSavedLocations(newSavedLocations);
      localStorage.setItem('savedLocations', JSON.stringify(newSavedLocations));
      setSearchTerm('');
      setSelectedSearchResult(null);
      toast({
        title: 'Location saved.',
        description: `${selectedSearchResult.name} has been added to your saved locations.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setShowError(false);
    } else if (selectedSearchResult && savedLocations.some(loc => loc.id === selectedSearchResult.id)) {
      toast({
        title: 'Location already saved.',
        description: `${selectedSearchResult.name} is already in your saved locations.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setShowError(true);
      toast({
        title: 'Error saving location.',
        description: 'Please select a location to save.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedSearchResult, savedLocations, toast]);

  const setAsDefaultLocation = useCallback(() => {
    if (selectedSearchResult) {
      // In a real app, this would update user preferences
      localStorage.setItem('defaultLocation', JSON.stringify(selectedSearchResult));
      toast({
        title: 'Default location set.',
        description: `${selectedSearchResult.name} has been set as your default location.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'No location selected.',
        description: 'Please select a location to set as default.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedSearchResult, toast]);

  const handleLocationReorder = useCallback((newOrder) => {
    setSavedLocations(newOrder);
    // In a real app, you might save this order to a backend immediately or on 'Done'
  }, []);

  const handleOpenDeleteConfirmation = useCallback((location) => {
    setLocationToDelete(location);
    setIsDeleteConfirmationOpen(true);
  }, []);

  const handleCloseDeleteConfirmation = useCallback(() => {
    setIsDeleteConfirmationOpen(false);
    setLocationToDelete(null);
  }, []);

  const confirmDeleteLocation = useCallback(() => {
    if (locationToDelete) {
      const updatedLocations = savedLocations.filter(loc => loc.id !== locationToDelete.id);
      setSavedLocations(updatedLocations);
      localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      toast({
        title: 'Location deleted.',
        description: `${locationToDelete.name} has been removed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleCloseDeleteConfirmation();
    }
  }, [locationToDelete, savedLocations, toast, handleCloseDeleteConfirmation]);

  const saveLocationOrderAndNavigateToDashboard = useCallback(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    toast({
      title: 'Locations updated.',
      description: 'Your saved locations order has been updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    // In a real app, navigate to Dashboard
    console.log('Navigating to Dashboard and saving order:', savedLocations);
  }, [savedLocations, toast]);

  const navigateToDashboard = useCallback(() => {
    // In a real app, navigate to Dashboard without saving changes
    console.log('Navigating to Dashboard without saving changes.');
  }, []);

  return (
    <Flex direction="column" gap={6} maxWidth="container.md" mx="auto" p={6} width="100%" bg="gray.50" minH="100vh">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.800">Manage Locations</Text>
        <Input
          aria-label="Location search input"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="lg"
          variant="filled"
          borderRadius="md"
          focusBorderColor="blue.500"
        />
      </Box>

      {searchTerm.length > 2 && searchResults.length > 0 && (
        <LocationList
          ariaLabel="Location search results"
          itemKey="id"
          items={searchResults}
          onSelect={handleSearchResultSelect}
        />
      )}

      {showNoResults && searchTerm.length > 2 && searchResults.length === 0 && (
        <Text color="gray.500" fontSize="md" textAlign="center">No results found</Text>
      )}

      {showError && (
        <Text color="red.500" fontSize="md" textAlign="center">An error occurred during location addition.</Text>
      )}

      {selectedSearchResult && (
        <Flex direction="row" gap={4} justify="space-between" mt={4}>
          <Button
            label="Save Location"
            onClick={handleSaveLocation}
            variant="solid"
            colorScheme="green"
            size="md"
            flex="1"
          >
            Save Location
          </Button>
          <Button
            label="Set as Default"
            onClick={setAsDefaultLocation}
            variant="solid"
            colorScheme="purple"
            size="md"
            flex="1"
          >
            Set as Default
          </Button>
        </Flex>
      )}

      <Box>
        <Text fontSize="xl" fontWeight="semibold" mb={3} color="gray.700">Saved Locations</Text>
        <LocationList
          ariaLabel="List of saved locations"
          isReorderable={true}
          itemKey="id"
          items={savedLocations}
          onReorder={handleLocationReorder}
          onDelete={handleOpenDeleteConfirmation}
        />
      </Box>

      <Flex direction="row" gap={4} justify="flex-end" mt={8}>
        <Button
          label="Done"
          onClick={saveLocationOrderAndNavigateToDashboard}
          colorScheme="blue"
          size="lg"
        >
          Done
        </Button>
        <Button
          label="Cancel"
          onClick={navigateToDashboard}
          variant="outline"
          colorScheme="gray"
          size="lg"
        >
          Cancel
        </Button>
      </Flex>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        message={locationToDelete ? `Are you sure you want to delete ${locationToDelete.name}?` : "Are you sure you want to delete this location?"}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={confirmDeleteLocation}
        title="Confirm Deletion"
      />
    </Flex>
  );
}

LocationManagementScreen.propTypes = {
  // No props defined in the layout JSON for the screen itself,
  // but if there were, they would be defined here.
};
