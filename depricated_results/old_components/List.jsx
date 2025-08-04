
import React, { useState, useRef } from 'react';

// Placeholder components for demonstration purposes.
// In a real application, these would typically be imported from separate files
// or a shared UI library (e.g., import Text from './Text';).
function Text({ content }) {
  return <span>{content}</span>;
}

function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

function Icon({ type }) {
  // A simple visual representation for an icon
  const iconMap = {
    drag: '☰', // Hamburger icon for drag handle
    star: '⭐', // Example star icon
    // Add more icon types as needed
  };
  return <span style={{ marginLeft: '8px', cursor: 'grab' }}>{iconMap[type] || ''}</span>;
}

export default function List({ title, draggable }) {
  // Initial state for list items. In a real app, this might come from props or an API.
  const [items, setItems] = useState([
    'Location A',
    'Location B',
    'Location C',
    'Location D',
  ]);

  // Refs to keep track of the item being dragged and the item being dragged over
  const dragItem = useRef(null); // Index of the item being dragged
  const dragOverItem = useRef(null); // Index of the item currently being dragged over

  // Handler for when a drag operation starts
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move'; // Visual feedback for allowed drag effect
    // Add a class to the dragged item for visual feedback
    e.currentTarget.classList.add('dragging');
  };

  // Handler for when a dragged item enters a droppable area
  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    // Add a class to the item being dragged over for visual feedback
    e.currentTarget.classList.add('drag-over');
  };

  // Handler for when a dragged item leaves a droppable area
  const handleDragLeave = (e) => {
    // Remove the drag-over class when the item leaves
    e.currentTarget.classList.remove('drag-over');
  };

  // Handler for when the drag operation ends (item is dropped)
  const handleDragEnd = (e) => {
    // Clean up visual feedback classes from all list items
    const listItems = e.currentTarget.parentNode.children;
    for (let i = 0; i < listItems.length; i++) {
      listItems[i].classList.remove('dragging', 'drag-over');
    }

    // If no valid drag operation occurred, reset refs and return
    if (dragItem.current === null || dragOverItem.current === null) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    // Create a new array to avoid direct state mutation
    const newItems = [...items];
    // Remove the dragged item from its original position
    const [reorderedItem] = newItems.splice(dragItem.current, 1);
    // Insert the dragged item into its new position
    newItems.splice(dragOverItem.current, 0, reorderedItem);

    // Update the state with the new order
    setItems(newItems);

    // Reset refs after the drag operation is complete
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Handler to allow dropping. Necessary to prevent default browser behavior.
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Example handler for removing an item
  const handleRemoveItem = (index) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  // Example handler for editing an item
  const handleEditItem = (index) => {
    // In a real application, this would open a modal or navigate to an edit page
    alert(`Editing: ${items[index]}`);
  };

  return (
    <section className="saved-locations-list">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li
            key={item} // Using item content as key. For unique items, a stable ID is preferred.
            draggable={draggable} // Enable drag if the prop is true
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver} // Allow dropping
          >
            <Text content={item} />
            <Button label="Edit" onClick={() => handleEditItem(index)} />
            <Button label="Remove" onClick={() => handleRemoveItem(index)} />
            {draggable && <Icon type="drag" />} {/* Show drag handle if draggable */}
          </li>
        ))}
      </ul>
    </section>
  );
}
