import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, useToast } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {
  TextInput,
  LocationList,
  TextDisplay,
  Button,
  ConfirmationDialog,
  IconButton
} from '../components';

/**
 * @typedef {object} Location
 * @property {string} id - Unique identifier for the location.
 * @property {string} name - Name of the location.
 * @property {string} [address] - Optional address of the location.
 */

/**
 * LocationManagementScreen component for managing saved locations and searching for new ones.
 * Allows users to search, save, set as default, reorder, and delete locations.
 */
export default function LocationManagementScreen() {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [locationAddError, setLocationAddError] = useState(false);
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const storedLocations = localStorage.getItem('savedLocations');
      return storedLocations ? JSON.parse(storedLocations) : [];
    } catch (error) {
      console.error("Failed to parse saved locations from localStorage", error);
      return [];
    }
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // For location selected from search results

  useEffect(() => {
    try {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    } catch (error) {
      console.error("Failed to save locations to localStorage", error);
    }
  }, [savedLocations]);

  /**
   * Handles changes in the search input field.
   * @param {string} value - The current value of the search input.
   */
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setNoResultsFound(false);
    // Simulate API call for search results
    if (value.length > 2) {
      const mockResults = [
        { id: '1', name: 'New York, USA' },
        { id: '2', name: 'London, UK' },
        { id: '3', name: 'Paris, France' },
      ].filter(loc => loc.name.toLowerCase().includes(value.toLowerCase()));
      setSearchResults(mockResults);
      setNoResultsFound(mockResults.length === 0);
    } else {
      setSearchResults([]);
      setNoResultsFound(false);
    }
  }, []);

  /**
   * Handles selection of a location from search results.
   * @param {Location} location - The selected location object.
   */
  const handleSearchResultSelect = useCallback((location) => {
    setSelectedLocation(location);
    setSearchTerm(location.name);
    setSearchResults([]); // Clear search results after selection
  }, []);

  /**
   * Handles saving the selected location to the list of saved locations.
   */
  const handleSaveLocation = useCallback(() => {
    if (selectedLocation && !savedLocations.some(loc => loc.id === selectedLocation.id)) {
      setSavedLocations(prev => [...prev, selectedLocation]);
      setSelectedLocation(null);
      setSearchTerm('');
      setLocationAddError(false);
      toast({
        title: "Location saved.",
        description: `${selectedLocation.name} has been added to your saved locations.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else if (selectedLocation && savedLocations.some(loc => loc.id === selectedLocation.id)) {
      toast({
        title: "Location already saved.",
        description: `${selectedLocation.name} is already in your saved locations.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      setLocationAddError(true);
      toast({
        title: "Error saving location.",
        description: "Please select a location to save.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedLocation, savedLocations, toast]);

  /**
   * Sets a selected saved location as the default.
   * @param {Location} location - The location to set as default.
   */
  const setAsDefaultLocation = useCallback(() => {
    if (selectedLocation && savedLocations.some(loc => loc.id === selectedLocation.id)) {
      // Logic to set as default (e.g., move to top, store in separate state/localStorage)
      const updatedLocations = [
        selectedLocation,
        ...savedLocations.filter(loc => loc.id !== selectedLocation.id)
      ];
      setSavedLocations(updatedLocations);
      toast({
        title: "Default location set.",
        description: `${selectedLocation.name} has been set as your default location.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Cannot set as default.",
        description: "Please select a saved location to set as default.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedLocation, savedLocations, toast]);

  /**
   * Handles reordering of saved locations.
   * @param {Location[]} newOrder - The new ordered array of locations.
   */
  const handleLocationReorder = useCallback((newOrder) => {
    setSavedLocations(newOrder);
  }, []);

  /**
   * Handles selection of a saved location.
   * @param {Location} location - The selected saved location.
   */
  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
    toast({
      title: "Location selected.",
      description: `${location.name} is now selected.`,
      status: "info",
      duration: 1500,
      isClosable: true,
    });
    // In a real app, this might navigate to a dashboard or set active location
  }, [toast]);

  /**
   * Opens the delete confirmation dialog for a specific location.
   * @param {Location} location - The location to be deleted.
   */
  const handleDeleteLocation = useCallback((location) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * Closes the delete confirmation dialog.
   */
  const handleCloseDeleteConfirmation = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setLocationToDelete(null);
  }, []);

  /**
   * Confirms and performs the deletion of the selected location.
   */
  const confirmDeleteLocation = useCallback(() => {
    if (locationToDelete) {
      setSavedLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
      handleCloseDeleteConfirmation();
      toast({
        title: "Location deleted.",
        description: `${locationToDelete.name} has been removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (selectedLocation && selectedLocation.id === locationToDelete.id) {
        setSelectedLocation(null); // Clear selected if it was the one deleted
      }
    }
  }, [locationToDelete, handleCloseDeleteConfirmation, selectedLocation, toast]);

  /**
   * Saves the current order of locations and navigates to the Dashboard.
   */
  const saveLocationOrderAndNavigateToDashboard = useCallback(() => {
    // In a real application, this would save the order to a backend
    toast({
      title: "Locations order saved.",
      description: "Navigating to Dashboard...",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    // Simulate navigation
    console.log("Navigating to Dashboard with saved order:", savedLocations);
  }, [savedLocations, toast]);

  /**
   * Navigates back to the Dashboard Screen without saving order.
   */
  const navigateToDashboard = useCallback(() => {
    toast({
      title: "Navigation.",
      description: "Navigating to Dashboard...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    // Simulate navigation
    console.log("Navigating to Dashboard.");
  }, [toast]);

  return (
    <Flex direction="column" gap={6} height="100vh" p={4} width="100%" bg="gray.50">
      <Box>
        <TextInput
          ariaLabel="Location search input"
          placeholder="Search for a location..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchResults.length > 0 && (
          <LocationList
            ariaLabel="Location search results"
            itemKey="id"
            items={searchResults}
            onSelect={handleSearchResultSelect}
            mt={2}
            maxH="200px"
            overflowY="auto"
            borderWidth={1}
            borderRadius="md"
            borderColor="gray.200"
            bg="white"
          />
        )}
        {noResultsFound && (
          <TextDisplay
            text="No results found"
            mt={2}
            color="gray.500"
            fontSize="sm"
            textAlign="center"
          />
        )}
        {locationAddError && (
          <TextDisplay
            text="An error occurred during location addition."
            mt={2}
            color="red.500"
            fontSize="sm"
            textAlign="center"
          />
        )}
      </Box>

      <Flex gap={4} justifyContent="space-around" mt={4}>
        <Button
          label="Save Location"
          onClick={handleSaveLocation}
          variant="solid"
          colorScheme="blue"
          isDisabled={!selectedLocation || savedLocations.some(loc => loc.id === selectedLocation.id)}
        />
        <Button
          label="Set as Default"
          onClick={setAsDefaultLocation}
          variant="solid"
          colorScheme="green"
          isDisabled={!selectedLocation || !savedLocations.some(loc => loc.id === selectedLocation.id)}
        />
      </Flex>

      <Box flex={1} overflowY="auto">
        <LocationList
          ariaLabel="List of saved locations"
          isReorderable={true}
          itemKey="id"
          items={savedLocations}
          onReorder={handleLocationReorder}
          onSelect={handleLocationSelect}
          renderItemActions={(location) => (
            <IconButton
              ariaLabel="Delete location"
              icon="trash"
              onClick={() => handleDeleteLocation(location)}
              colorScheme="red"
              size="sm"
              variant="ghost"
            />
          )}
          borderWidth={1}
          borderRadius="md"
          borderColor="gray.200"
          bg="white"
          p={2}
        />
      </Box>

      <Flex gap={4} justifyContent="flex-end" mt="auto">
        <Button
          label="Done"
          onClick={saveLocationOrderAndNavigateToDashboard}
          colorScheme="blue"
          variant="solid"
        />
        <Button
          label="Done"
          onClick={navigateToDashboard}
          variant="outline"
          colorScheme="gray"
        />
      </Flex>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={confirmDeleteLocation}
        title="Confirm Deletion"
        message={locationToDelete ? `Are you sure you want to delete "${locationToDelete.name}"?` : "Are you sure you want to delete this location?"}
      />
    </Flex>
  );
}

LocationManagementScreen.propTypes = {
  // No props defined for the screen itself based on the provided JSONs,
  // but individual components within it have props.
};
