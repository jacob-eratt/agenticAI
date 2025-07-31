
import React from 'react';
import Card from './Card'; // Assuming Card component is in a separate file in the same directory

export default function ScrollableContainer() {
  return (
    <div className="hourly-forecast-timeline">
      <Card />
      <Card />
    </div>
  );
}
