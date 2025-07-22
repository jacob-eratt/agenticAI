
import React from 'react';

export default function Message({ type, content }) {
  const messageStyle = {
    marginTop: '10px',
    backgroundColor: '#fff3cd',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ffeeba',
    color: '#664d03'
  };

  // You could extend this to handle different types with different styles
  // For now, it's hardcoded to the warning style provided in the prompt.
  // if (type === 'error') {
  //   messageStyle.backgroundColor = '#f8d7da';
  //   messageStyle.borderColor = '#f5c2c7';
  //   messageStyle.color = '#842029';
  // } else if (type === 'success') {
  //   messageStyle.backgroundColor = '#d1e7dd';
  //   messageStyle.borderColor = '#badbcc';
  //   messageStyle.color = '#0f5132';
  // }

  return (
    <div style={messageStyle}>
      {content}
    </div>
  );
}
