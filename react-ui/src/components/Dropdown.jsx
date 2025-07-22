
import React, { useState } from 'react';

export default function Dropdown({ label, options, selected }) {
  // State to manage the currently selected value within the dropdown.
  // It initializes with the 'selected' prop value.
  const [selectedValue, setSelectedValue] = useState(selected);

  // Event handler for when the dropdown's value changes.
  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
    // In a real application, you might want to pass this change
    // up to a parent component via an 'onChange' prop.
    // For this specific request, we only manage internal state.
  };

  // Generate a unique ID for the select element to link with its label.
  // This improves accessibility.
  const dropdownId = `dropdown-${label.replace(/\\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label htmlFor={dropdownId}>{label}</label>
      <select id={dropdownId} value={selectedValue} onChange={handleSelectChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
