// ExplorerWindow.jsx
import React from 'react';

const ExplorerWindow = ({ windowData, isActive, onClick }) => {
  return (
    <div className={`explorer-window ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="window-header">
        <span className="window-icon">F</span>
        <span className="window-title">{windowData.title}</span>
        {isActive && <span className="active-badge">Active</span>}
      </div>
      <div className="window-path">{windowData.path}</div>
    </div>
  );
};

export default ExplorerWindow;