
import React from 'react';
import Text from './Text'; // Assuming Text component is in the same directory or a common components folder
import Button from './Button'; // Assuming Button component is in the same directory or a common components folder

export default function Panel() {
  return (
    <div
      className="detailed-alert-view"
      style={{
        display: "none"
      }}
    >
      <Text />
      <Text />
      <Text />
      <Text />
      <Text />
      <Button />
    </div>
  );
}
