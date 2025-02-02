// main.js
// A Main Process script that uses IPC to communicate with the Renderer Process
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');  // You'll need to npm install node-fetch

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false  // Note: In production, you might want to use contextIsolation
        }
    });

    // Use path.join to create absolute path to index.html
    const indexPath = path.join(__dirname, 'index.html');
    mainWindow.loadFile(indexPath);

    // Optional: Open DevTools
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Set up IPC communication to fetch explorer paths
async function fetchExplorerPaths() {
    try {
        const response = await fetch('http://localhost:8000/explorer-paths');
        const data = await response.json();
        mainWindow.webContents.send('explorer-paths-update', data);
    } catch (error) {
        console.error('Error fetching explorer paths:', error);
        mainWindow.webContents.send('explorer-paths-error', error.message);
    }
}

// Start polling when requested by the renderer
ipcMain.on('start-explorer-monitoring', () => {
    // Poll every second
    const interval = setInterval(fetchExplorerPaths, 1000);
    
    // Clean up interval when window is closed
    mainWindow.on('closed', () => clearInterval(interval));
});