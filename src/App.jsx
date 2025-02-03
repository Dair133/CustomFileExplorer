// src/App.jsx
import React, { useState, useEffect } from 'react';

// Access Electron's ipcRenderer. (Using window.require because nodeIntegration is enabled.)
const { ipcRenderer } = window.require('electron');

const App = () => {
  const [explorerData, setExplorerData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tell the main process to start monitoring
    ipcRenderer.send('start-explorer-monitoring');

    // Define listeners for IPC events
    const onUpdate = (event, data) => {
      console.log(data)
      setExplorerData(data);
    };

    const onError = (event, errorMsg) => {
      setError(errorMsg);
    };
    // When we receive explorer data from the main.js call the onUpdate and then setExplorerData
    ipcRenderer.on('explorer-paths-update', onUpdate);
    ipcRenderer.on('explorer-paths-error', onError);

    // Cleanup listeners when the component unmounts
    return () => {
      ipcRenderer.removeListener('explorer-paths-update', onUpdate);
      ipcRenderer.removeListener('explorer-paths-error', onError);
    };
  }, []);

  if (error) {
      console.log("Error Connecting")
      return <div className="error-message">Error connecting to file monitor: {error}</div>;
  }

  if (!explorerData) {
    return <div>Loading...</div>;
  }

  if (!explorerData.windows || explorerData.windows.length === 0) {
    return <div className="no-windows">No Explorer windows currently open</div>;
  }

  return (
    <div>
      {explorerData.windows.map((windowData, index) => (
        <ExplorerWindow key={index} windowData={windowData} />
      ))}
    </div>
  );
};

const ExplorerWindow = ({ windowData }) => {
  return (
    <div className={`explorer-window ${windowData.is_active ? 'active' : ''}`}>
      <div className="window-header">
        <span className="window-icon">F</span>
        <span className="window-title">{windowData.title}</span>
        {windowData.is_active && <span className="active-badge">Active</span>}
      </div>
      <div className="window-path">{windowData.path}</div>
      {/* If you want to display files in the window, you can add another component or mapping here */}
    </div>
  );
};

export default App;
