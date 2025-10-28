import React from 'react';

function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{error}</span>
      <button className="error-close" onClick={onDismiss}>×</button>
    </div>
  );
}

export default ErrorMessage;
