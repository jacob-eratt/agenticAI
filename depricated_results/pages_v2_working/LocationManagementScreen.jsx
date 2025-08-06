import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex,
  Box,
  Text,
  useToast,
  VStack,
  HStack,
  Heading,
  Spacer,
  Container,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';

import Button from '../components/Button';
import ConfirmationDialog from '../components/ConfirmationDialog';
import IconButton from '../components/IconButton'; // Assuming IconButton is used for delete
import LocationList from '../components/LocationList';
import TextInput from '../components/TextInput';

/**
 * @typedef {Object} Location
 * @property {string} id - Unique identifier for the location.
 * @property {string} name - Name of the location.
 * @property {string} [description] - Optional description of the location.
 */

/**
 * LocationManagementScreen component for managing saved locations.
 * Allows users to search for new locations, save them, reorder existing locations,
 * set a default location, and delete locations.
 * Optimized for a full-size display with a clean, UI-oriented design.
 */
export default function LocationManagementScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const storedLocations = localStorage.getItem('savedLocations');
      return storedLocations ? JSON.parse(storedLocations) : [];
    } catch (error) {
      console.error("Failed to parse saved locations from localStorage:", error);
      return [];
    }
  });
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [selectedSavedLocation, setSelectedSavedLocation] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [noResultsMessage, setNoResultsMessage] = useState('');

  const toast = useToast();

  // Persist saved locations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    } catch (error) {
      console.error("Failed to save locations to localStorage:", error);
      toast({
        title: "Error saving locations",
        description: "Could not save your changes to local storage.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [savedLocations, toast]);

  /**
   * Handles changes in the search input field.
   * @param {string} value - The current value of the search input.
   */
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setNoResultsMessage('');
    setErrorMessage('');
    if (value.length > 2) {
      // Simulate API call for search results
      const mockResults = [
        { id: '1', name: 'New York, USA' },
        { id: '2', name: 'London, UK' },
        { id: '3', name: 'Paris, France' },
        { id: '4', name: 'Tokyo, Japan' },
        { id: '5', name: 'Sydney, Australia' },
        { id: '6', name: 'Berlin, Germany' },
        { id: '7', name: 'Rome, Italy' },
        { id: '8', name: 'Cairo, Egypt' },
        { id: '9', name: 'Rio de Janeiro, Brazil' },
        { id: '10', name: 'Beijing, China' },
      ].filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(mockResults);
      if (mockResults.length === 0) {
        setNoResultsMessage('No results found for your search.');
      }
    } else {
      setSearchResults([]);
      setSelectedSearchResult(null);
    }
  }, []);

  /**
   * Handles selection of a location from the search results list.
   * @param {Location} location - The selected location object.
   */
  const handleSearchResultSelect = useCallback((location) => {
    setSelectedSearchResult(location);
    toast({
      title: "Location Selected",
      description: `${location.name} selected for saving.`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Handles saving the selected location to the saved locations list.
   */
  const handleSaveLocation = useCallback(() => {
    if (selectedSearchResult) {
      if (!savedLocations.some(loc => loc.id === selectedSearchResult.id)) {
        setSavedLocations(prev => [...prev, selectedSearchResult]);
        setSearchTerm('');
        setSearchResults([]);
        setSelectedSearchResult(null);
        toast({
          title: "Location Saved",
          description: `${selectedSearchResult.name} has been added to your saved locations.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setErrorMessage('This location is already saved.');
        toast({
          title: "Already Saved",
          description: `${selectedSearchResult.name} is already in your saved locations.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      setErrorMessage('No location selected to save.');
      toast({
        title: "No Location Selected",
        description: "Please select a location from the search results to save.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedSearchResult, savedLocations, toast]);

  /**
   * Handles selection of a location from the main saved locations list.
   * @param {Location} location - The selected location object.
   */
  const handleLocationSelect = useCallback((location) => {
    setSelectedSavedLocation(location);
    toast({
      title: "Location Selected",
      description: `${location.name} selected for actions.`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Initiates the delete confirmation dialog for a saved location.
   * @param {Location} location - The location object to be deleted.
   */
  const handleDeleteLocation = useCallback((location) => {
    setLocationToDelete(location);
    setIsDeleteConfirmationOpen(true);
  }, []);

  /**
   * Confirms and performs the deletion of a saved location.
   */
  const confirmDeleteLocation = useCallback(() => {
    if (locationToDelete) {
      setSavedLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
      if (selectedSavedLocation && selectedSavedLocation.id === locationToDelete.id) {
        setSelectedSavedLocation(null);
      }
      toast({
        title: "Location Deleted",
        description: `${locationToDelete.name} has been removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setLocationToDelete(null);
      setIsDeleteConfirmationOpen(false);
    }
  }, [locationToDelete, selectedSavedLocation, toast]);

  /**
   * Closes the delete confirmation dialog.
   */
  const handleCloseDeleteConfirmation = useCallback(() => {
    setIsDeleteConfirmationOpen(false);
    setLocationToDelete(null);
  }, []);

  /**
   * Handles reordering of locations in the main saved locations list.
   * @param {Location[]} newOrder - The new ordered array of locations.
   */
  const handleLocationReorder = useCallback((newOrder) => {
    setSavedLocations(newOrder);
    toast({
      title: "Locations Reordered",
      description: "Your saved locations have been reordered.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  /**
   * Sets the selected saved location as the default location.
   */
  const setAsDefaultLocation = useCallback(() => {
    if (selectedSavedLocation) {
      // In a real app, this would update a user preference in a backend or global state.
      // For this example, we'll just show a toast.
      toast({
        title: "Default Location Set",
        description: `${selectedSavedLocation.name} has been set as your default location.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "No Location Selected",
        description: "Please select a saved location to set as default.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedSavedLocation, toast]);

  /**
   * Saves the current order of locations and navigates to the Dashboard.
   * (Simulated navigation)
   */
  const saveLocationOrderAndNavigateToDashboard = useCallback(() => {
    // In a real app, you'd save the order to a backend here.
    toast({
      title: "Locations Saved",
      description: "Your location order has been saved. Navigating to Dashboard...",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    console.log("Navigating to Dashboard with saved order:", savedLocations);
    // Simulate navigation
    // navigate('/dashboard');
  }, [savedLocations, toast]);

  /**
   * Navigates directly to the Dashboard without saving order changes.
   * (Simulated navigation)
   */
  const navigateToDashboard = useCallback(() => {
    toast({
      title: "Navigating",
      description: "Navigating to Dashboard...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    console.log("Navigating to Dashboard.");
    // Simulate navigation
    // navigate('/dashboard');
  }, [toast]);

  // ...state and callbacks exactly as your code (not shown here for brevity, use same as before)...

  // ... all your state and handlers from above code, unchanged ...

  // THE ONLY MEANINGFUL CHANGES ARE TO THE LAYOUT/CONTAINER PROPS BELOW

  return (
    <Flex
      direction="column"
      minH="100vh"
      width="100vw"
      bg="gray.50"
      overflow="auto"
      aria-label="Location Management Screen"
    >
      {/* Heading bar: full width */}
      <Box
        width="100%"
        px={{ base: 4, md: 10 }}
        py={8}
        bg="white"
        boxShadow="sm"
      >
        <Heading as="h1" size="2xl" color="gray.800" textAlign="left">
          Manage Locations
        </Heading>
      </Box>

      {/* Main content area: full width, fills available vertical space */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        flex="1"
        width="100%"
        px={{ base: 0, md: 10 }}
        py={{ base: 4, md: 8 }}
        gap={8}
        alignItems="stretch"
      >
        {/* Left/Top Column: Search and Add */}
        <Box
          flex="1"
          minW={0}
          p={6}
          bg="white"
          borderRadius="none"
          boxShadow="md"
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <Heading as="h2" size="lg" mb={2} color="gray.700">
            Search and Add New Location
          </Heading>
          <TextInput
            ariaLabel="Location search input"
            placeholder="Search for a city or region..."
            value={searchTerm}
            onChange={handleSearchChange}
            mb={2}
            size="lg"
            variant="filled"
            width="100%"
          />

          {searchResults.length > 0 && (
            <Box
              maxH="250px"
              overflowY="auto"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
              mb={2}
              width="100%"
            >
              <LocationList
                ariaLabel="Location search results"
                itemKey="id"
                items={searchResults}
                onSelect={handleSearchResultSelect}
                selectedItem={selectedSearchResult}
              />
            </Box>
          )}

          {noResultsMessage && (
            <Alert status="info" mb={2} borderRadius="md">
              <AlertIcon />
              <Text fontSize="md" aria-live="polite">{noResultsMessage}</Text>
            </Alert>
          )}
          {errorMessage && (
            <Alert status="error" mb={2} borderRadius="md">
              <AlertIcon />
              <Text fontSize="md" aria-live="assertive">{errorMessage}</Text>
            </Alert>
          )}

          {selectedSearchResult && (
            <Button
              label={`Add "${selectedSearchResult.name}"`}
              onClick={handleSaveLocation}
              colorScheme="green"
              variant="solid"
              size="lg"
              width="100%"
              aria-label={`Add ${selectedSearchResult.name} to saved locations`}
            />
          )}
        </Box>

        {/* Right/Bottom Column: Saved Locations */}
        <Box
          flex="2"
          minW={0}
          p={6}
          bg="white"
          borderRadius="none"
          boxShadow="md"
          display="flex"
          flexDirection="column"
          gap={4}
        >
          <Heading as="h2" size="lg" mb={2} color="gray.700">
            Your Saved Locations
          </Heading>
          {savedLocations.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              You haven't saved any locations yet. Search above to add some!
            </Text>
          ) : (
            <Box
              maxH="350px"
              overflowY="auto"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
              mb={2}
              width="100%"
            >
              <LocationList
                ariaLabel="List of saved locations"
                itemKey="id"
                items={savedLocations}
                onSelect={handleLocationSelect}
                onReorder={handleLocationReorder}
                isReorderable={true}
                onDeleteItem={handleDeleteLocation}
                selectedItem={selectedSavedLocation}
              />
            </Box>
          )}

          {selectedSavedLocation && (
            <Button
              label={`Set "${selectedSavedLocation.name}" as Default`}
              onClick={setAsDefaultLocation}
              colorScheme="blue"
              variant="outline"
              size="md"
              width="100%"
              mt={2}
              aria-label={`Set ${selectedSavedLocation.name} as default location`}
            />
          )}

          {/* Action Buttons always at the end of the main section */}
          <HStack
            spacing={4}
            mt={6}
            width="100%"
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            <Button
              label="Save Order & Go to Dashboard"
              onClick={saveLocationOrderAndNavigateToDashboard}
              colorScheme="teal"
              size="lg"
              flexGrow={1}
              minW="200px"
              aria-label="Save location order and go to Dashboard"
            />
            <Button
              label="Go to Dashboard (Discard Changes)"
              onClick={navigateToDashboard}
              size="lg"
              variant="ghost"
              colorScheme="gray"
              flexGrow={1}
              minW="200px"
              aria-label="Go to Dashboard without saving changes"
            />
          </HStack>
        </Box>
      </Flex>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={confirmDeleteLocation}
        title="Confirm Deletion"
        message={
          locationToDelete
            ? `Are you sure you want to delete "${locationToDelete.name}" from your saved locations? This action cannot be undone.`
            : "Are you sure you want to delete this location? This action cannot be undone."
        }
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        aria-label="Delete confirmation dialog"
      />
    </Flex>
  );
}


//   return (
//     <Container
//       maxW="container.xl"
//       p={{ base: 4, md: 8 }}
//       minH="100vh"
//       bg="gray.50"
//       display="flex"
//       flexDirection="column"
//       alignItems="center"
//       justifyContent="center"
//       aria-label="Location Management Screen"
//     >
//       <Heading as="h1" size="xl" mb={8} color="gray.800" textAlign="center">
//         Manage Locations
//       </Heading>

//       <VStack spacing={6} width="100%" maxW="3xl">
//         {/* Search Section */}
//         <Box
//           width="100%"
//           p={6}
//           bg="white"
//           borderRadius="lg"
//           boxShadow="lg"
//           aria-labelledby="search-location-heading"
//         >
//           <Heading as="h2" size="md" mb={4} id="search-location-heading" color="gray.700">
//             Search and Add New Location
//           </Heading>
//           <TextInput
//             ariaLabel="Location search input"
//             placeholder="Search for a city or region..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             mb={4}
//             size="lg"
//             variant="filled"
//             width={{ base: "100%", lg: "60%", md: "80%" }}
//           />

//           {searchResults.length > 0 && (
//             <Box
//               maxH="200px"
//               overflowY="auto"
//               borderWidth="1px"
//               borderColor="gray.200"
//               borderRadius="md"
//               mb={4}
//               width={{ base: "100%", lg: "60%", md: "80%" }}
//             >
//               <LocationList
//                 ariaLabel="Location search results"
//                 itemKey="id"
//                 items={searchResults}
//                 onSelect={handleSearchResultSelect}
//                 // Assuming LocationList can take a prop to highlight selected item
//                 selectedItem={selectedSearchResult}
//               />
//             </Box>
//           )}

//           {noResultsMessage && (
//             <Alert status="info" mb={4} borderRadius="md">
//               <AlertIcon />
//               <Text fontSize="md" aria-live="polite">{noResultsMessage}</Text>
//             </Alert>
//           )}

//           {errorMessage && (
//             <Alert status="error" mb={4} borderRadius="md">
//               <AlertIcon />
//               <Text fontSize="md" aria-live="assertive">{errorMessage}</Text>
//             </Alert>
//           )}

//           {selectedSearchResult && (
//             <Button
//               label={`Add "${selectedSearchResult.name}"`}
//               onClick={handleSaveLocation}
//               colorScheme="green"
//               variant="solid"
//               size="lg"
//               width={{ base: "100%", md: "auto" }}
//               aria-label={`Add ${selectedSearchResult.name} to saved locations`}
//             />
//           )}
//         </Box>

//         {/* Saved Locations Section */}
//         <Box
//           width="100%"
//           p={6}
//           bg="white"
//           borderRadius="lg"
//           boxShadow="lg"
//           aria-labelledby="saved-locations-heading"
//         >
//           <Heading as="h2" size="md" mb={4} id="saved-locations-heading" color="gray.700">
//             Your Saved Locations
//           </Heading>
//           {savedLocations.length === 0 ? (
//             <Text color="gray.500" textAlign="center" py={4}>
//               You haven't saved any locations yet. Search above to add some!
//             </Text>
//           ) : (
//             <Box
//               maxH="300px"
//               overflowY="auto"
//               borderWidth="1px"
//               borderColor="gray.200"
//               borderRadius="md"
//               mb={4}
//               width={{ base: "100%", lg: "60%", md: "80%" }}
//             >
//               <LocationList
//                 ariaLabel="List of saved locations"
//                 itemKey="id"
//                 items={savedLocations}
//                 onSelect={handleLocationSelect}
//                 onReorder={handleLocationReorder}
//                 isReorderable={true}
//                 onDeleteItem={handleDeleteLocation} // Pass the delete handler
//                 selectedItem={selectedSavedLocation}
//               />
//             </Box>
//           )}

//           {selectedSavedLocation && (
//             <Button
//               label={`Set "${selectedSavedLocation.name}" as Default`}
//               onClick={setAsDefaultLocation}
//               colorScheme="blue"
//               variant="outline"
//               size="md"
//               width={{ base: "100%", md: "auto" }}
//               mt={2}
//               aria-label={`Set ${selectedSavedLocation.name} as default location`}
//             />
//           )}
//         </Box>

//         {/* Action Buttons */}
//         <HStack
//           spacing={4}
//           justifyContent="center"
//           width={{ base: "100%", md: "auto" }}
//           mt={4}
//           flexWrap="wrap" // Allow buttons to wrap on smaller screens
//         >
//           <Button
//             label="Save Order & Go to Dashboard"
//             onClick={saveLocationOrderAndNavigateToDashboard}
//             colorScheme="teal"
//             size="lg"
//             flexGrow={1}
//             minW="200px" // Ensure buttons don't get too small
//             aria-label="Save location order and go to Dashboard"
//           />
//           <Button
//             label="Go to Dashboard (Discard Changes)"
//             onClick={navigateToDashboard}
//             size="lg"
//             variant="ghost"
//             colorScheme="gray"
//             flexGrow={1}
//             minW="200px"
//             aria-label="Go to Dashboard without saving changes"
//           />
//         </HStack>
//       </VStack>

//       <ConfirmationDialog
//         isOpen={isDeleteConfirmationOpen}
//         onClose={handleCloseDeleteConfirmation}
//         onConfirm={confirmDeleteLocation}
//         title="Confirm Deletion"
//         message={locationToDelete ? `Are you sure you want to delete "${locationToDelete.name}" from your saved locations? This action cannot be undone.` : "Are you sure you want to delete this location? This action cannot be undone."}
//         confirmButtonText="Delete"
//         cancelButtonText="Cancel"
//         aria-label="Delete confirmation dialog"
//       />
//     </Container>
//   );
// }

// LocationManagementScreen.propTypes = {
//   // No props are passed to the screen component itself,
//   // but internal components receive props.
// };