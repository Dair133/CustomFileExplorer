// renderer.js
const { ipcRenderer } = require('electron');

// Start monitoring when the page loads
document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('start-explorer-monitoring');
    setupExplorerMonitoring();
});

function setupExplorerMonitoring() {
    const explorerContainer = document.getElementById('explorer-windows');
    
    // Listen for updates from main process
    // this is where the data sent from 'mainWindow.webContents.send('explorer-paths-update', data);' is being recieved
    ipcRenderer.on('explorer-paths-update', (event, data) => {
        updateExplorerDisplay(data);
    });

    ipcRenderer.on('explorer-paths-error', (event, error) => {
        explorerContainer.innerHTML = `
            <div class="error-message">
                Error connecting to file monitor: ${error}
            </div>
        `;
    });
}

function updateExplorerDisplay(data) {
    const explorerContainer = document.getElementById('explorer-windows');
    
    if (!data.windows || data.windows.length === 0) {
        explorerContainer.innerHTML = `
            <div class="no-windows">
                No Explorer windows currently open
            </div>
        `;
        return;
    }
    console.log(data)
    const windowsHtml = data.windows.map(window => {
        const filesHtml = window.files.map(file =>`
            <div class="file-name">
                ${file.isFolder ? 'F' : 'NF'} ${file.name}
            </div>
        `).join('');

        return `
            <div class="explorer-window ${window.is_active ? 'active' : ''}">
                <div class="window-header">
                    <span class="window-icon">F</span>
                    <span class="window-title">${window.title}</span>
                    ${window.is_active ? '<span class="active-badge">Active</span>' : ''}
                </div>
                <div class="window-path">${window.path}</div>
                <div class="window-files">${filesHtml}</div>
            </div>
        `;
    }).join('');

    explorerContainer.innerHTML = windowsHtml;
}