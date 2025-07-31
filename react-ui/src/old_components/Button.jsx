
import React from 'react';

export default function Button({ label, onClick }) {
  return (
    <button
      className="secondary-button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
