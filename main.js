// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fetch = require('node-fetch');


let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,  // Make sure this is enabled to allow access to ipcRenderer via window.require
      contextIsolation: false,
    }
  });

  // Load the HTML file built by webpack from the "dist" folder.
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

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

ipcMain.on('start-explorer-monitoring', () => {
  console.log('Sarting monitoring')
  const interval = setInterval(fetchExplorerPaths, 1000);
  mainWindow.on('closed', () => clearInterval(interval));
});
