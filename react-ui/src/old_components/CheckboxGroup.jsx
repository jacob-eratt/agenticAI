
import React from 'react';

// Placeholder Checkbox component as it's a child component
// In a real application, this would be imported from its own file.
function Checkbox({ label, checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

export default function CheckboxGroup({ label }) {
  // In a real scenario, you would manage the state of each checkbox here
  // or lift it up to a parent component. For this example, we'll just render them.
  return (
    <div className="metric-customization">
      <h3>{label}</h3>
      <div>
        <Checkbox label="Temperature" checked={true} onChange={() => {}} />
        <Checkbox label="Humidity" checked={false} onChange={() => {}} />
        <Checkbox label="Wind Speed" checked={true} onChange={() => {}} />
      </div>
    </div>
  );
}
