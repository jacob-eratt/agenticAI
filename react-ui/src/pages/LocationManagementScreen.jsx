import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';

// Import custom components
import Button from '../components/Button';
import LocationList from '../components/LocationList'; // For search results
import ConfirmationDialog from '../components/ConfirmationDialog';
import TextInput from '../components/TextInput';
import IconButton from '../components/IconButton';

/**
 * LocationManagementScreen component for managing saved locations.
 * Allows users to search for new locations, save them, set a default location,
 * and delete locations. Note: Reordering functionality for saved locations is not
 * implemented directly within this screen due to limitations of the generic LocationList
 * component not supporting custom item rendering for actions like delete buttons
 * while also maintaining reorderability.
 */
export default function LocationManagementScreen() {
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration and initial load
  useEffect(() => {
    const storedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [
      { id: 's1', name: 'San Francisco, USA' },
      { id: 's2', name: 'Tokyo, Japan' },
    ];
    setSavedLocations(storedLocations);
  }, []);

  // Placeholder for actual search logic with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        // Simulate API call
        const mockResults = [
          { id: '1', name: 'New York, USA' },
          { id: '2', name: 'London, UK' },
          { id: '3', name: 'Paris, France' },
          { id: '4', name: 'Berlin, Germany' },
          { id: '5', name: 'Rome, Italy' },
        ].filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setSearchResults(mockResults);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  /**
   * Handles the selection of a search result.
   * @param {object} location - The selected location object.
   */
  const handleSearchResultSelect = useCallback((location) => {
    setSelectedSearchResult(location);
    setErrorMessage('');
  }, []);

  /**
   * Handles saving the selected location.
   */
  const handleSaveLocation = useCallback(() => {
    if (selectedSearchResult) {
      if (!savedLocations.some(loc => loc.id === selectedSearchResult.id)) {
        const newSavedLocations = [...savedLocations, selectedSearchResult];
        setSavedLocations(newSavedLocations);
        localStorage.setItem('savedLocations', JSON.stringify(newSavedLocations));
        setSelectedSearchResult(null);
        setSearchQuery('');
        setSearchResults([]);
        setErrorMessage('');
      } else {
        setErrorMessage('This location is already saved.');
      }
    } else {
      setErrorMessage('Please select a location to save.');
    }
  }, [selectedSearchResult, savedLocations]);

  /**
   * Sets a saved location as the default.
   * @param {object} location - The location to set as default.
   */
  const setAsDefaultLocation = useCallback((location) => {
    console.log('Setting as default:', location);
    localStorage.setItem('defaultLocation', JSON.stringify(location));
  }, []);

  /**
   * Navigates back to the Dashboard.
   */
  const navigateToDashboard = useCallback(() => {
    console.log('Navigating to Dashboard...');
    // In a real app, use react-router-dom's useNavigate hook
  }, []);

  /**
   * Opens the delete confirmation dialog.
   * @param {object} location - The location to be deleted.
   */
  const handleDeleteLocation = useCallback((location) => {
    setLocationToDelete(location);
    setIsDeleteConfirmationOpen(true);
  }, []);

  /**
   * Closes the delete confirmation dialog.
   */
  const handleCloseDeleteConfirmation = useCallback(() => {
    setIsDeleteConfirmationOpen(false);
    setLocationToDelete(null);
  }, []);

  /**
   * Confirms and performs the deletion of a location.
   */
  const confirmDeleteLocation = useCallback(() => {
    if (locationToDelete) {
      const updatedLocations = savedLocations.filter(loc => loc.id !== locationToDelete.id);
      setSavedLocations(updatedLocations);
      localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      setIsDeleteConfirmationOpen(false);
      setLocationToDelete(null);
    }
  }, [locationToDelete, savedLocations]);

  /**
   * Handles changes in the search input.
   * @param {string} value - The current value of the search input.
   */
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setErrorMessage('');
  }, []);

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      width="100%"
      bg="gray.50"
      px={{ base: 2, md: 4, lg: 8 }}
      py={{ base: 2, md: 4, lg: 8 }}
    >
      {errorMessage && (
        <Box
          bg="red.100"
          borderRadius="md"
          boxShadow="md"
          color="red.700"
          p={{ base: 4, md: 6 }}
          textAlign="center"
          width={{ base: "100%", md: "75%", lg: "50%" }}
          mb={4}
        >
          <Text>{errorMessage}</Text>
        </Box>
      )}

      <Flex
        direction={{ base: "column", md: "row" }}
        alignItems="stretch"
        gap={{ base: 4, md: 8 }}
        maxW={{ base: "100%", lg: "1200px" }}
        mx="auto"
        px={0}
        py={{ base: 2, md: 4 }}
        width="100%"
      >
        {/* Search and Add Location Section */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          display="flex"
          flex={1}
          flexDirection="column"
          gap={4}
          p={{ base: 4, md: 6 }}
          width="100%"
        >
          <Text fontSize="xl" fontWeight="bold">Search for Locations</Text>
          <TextInput
            ariaLabel="Location search input"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 ? (
            <LocationList
              ariaLabel="Location search results"
              itemKey="id"
              items={searchResults}
              maxH="300px"
              overflowY="auto"
              onSelect={handleSearchResultSelect}
              width="100%"
            />
          ) : (
            searchQuery.length > 2 && <Text color="gray.500">No results found</Text>
          )}
          <Button
            label="Save Location"
            onClick={handleSaveLocation}
            variant="solid"
            width="100%"
            isDisabled={!selectedSearchResult}
          />
        </Box>

        {/* Saved Locations Management Section */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="md"
          display="flex"
          flex={1}
          flexDirection="column"
          gap={4}
          p={{ base: 4, md: 6 }}
          width="100%"
        >
          <Text fontSize="xl" fontWeight="bold">Saved Locations</Text>
          {savedLocations.length > 0 ? (
            <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
              {savedLocations.map((location) => (
                <Flex
                  key={location.id}
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  justifyContent="space-between"
                  alignItems="center"
                  _hover={{ bg: "gray.50" }}
                  cursor="pointer"
                  onClick={() => setAsDefaultLocation(location)}
                >
                  <Text flex="1" mr={2}>{location.name}</Text>
                  <IconButton
                    icon="trash"
                    ariaLabel={`Delete ${location.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLocation(location);
                    }}
                  />
                </Flex>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No saved locations yet. Search and add some!</Text>
          )}
          <Button
            label="Set First Saved as Default"
            onClick={() => savedLocations.length > 0 && setAsDefaultLocation(savedLocations[0])}
            variant="solid"
            width="100%"
            isDisabled={savedLocations.length === 0}
          />
        </Box>
      </Flex>

      <Flex
        justifyContent="flex-end"
        maxW={{ base: "100%", lg: "1200px" }}
        mx="auto"
        px={0}
        py={{ base: 2, md: 4 }}
        width="100%"
      >
        <Button
          label="Done"
          onClick={navigateToDashboard}
          variant="outline"
        />
      </Flex>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={confirmDeleteLocation}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${locationToDelete?.name || 'this location'}"?`}
      />
    </Flex>
  );
}

LocationManagementScreen.propTypes = {
  // No direct props for the screen component based on the provided JSONs.
};