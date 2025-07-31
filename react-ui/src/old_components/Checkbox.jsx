
import React from 'react';

export default function Checkbox({ label, checked }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        // This component is controlled by the 'checked' prop.
        // If interaction is desired, an 'onChange' prop would typically be passed from the parent.
        // As no 'onChange' or 'Interaction' was specified, it acts as a display-only checkbox.
      />
      {label}
    </label>
  );
}
