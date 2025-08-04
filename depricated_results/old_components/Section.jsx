
import React from 'react';
import Input from './Input'; // Assuming Input component is in the same directory or a common components folder
import Button from './Button'; // Assuming Button component is in the same directory or a common components folder

export default function Section() {
  return (
    <section className="location-search-bar">
      <Input />
      <Button />
      <Button />
      <Button />
    </section>
  );
}
