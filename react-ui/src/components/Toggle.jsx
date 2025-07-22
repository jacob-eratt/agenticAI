
import React, { useState } from 'react';

export default function Toggle({ label, checked }) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggleChange = () => {
    setIsChecked(!isChecked);
    // In a real application, you would likely call a prop function here
    // to notify the parent component about the change, e.g., onToggle(label, !isChecked);
  };

  return (
    <label>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggleChange}
      />
      {label}
    </label>
  );
}
