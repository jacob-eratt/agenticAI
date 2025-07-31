
import React from 'react';

export default function Banner({ type, content }) {
  const handleClick = () => {
    alert(`Alert Details: ${content}`);
  };

  // Determine class based on type, if needed for more complex styling
  const bannerClass = `severe-alert-banner ${type === 'warning' ? 'banner-warning' : ''}`;

  return (
    <div className={bannerClass} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <p>{content}</p>
    </div>
  );
}
