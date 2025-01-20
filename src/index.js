
try {
  require('electron-reloader')(module)
} catch (_) {}
const { app, BrowserWindow } = require('electron');
const path = require('path');









try {
  console.log('About to require the module...');
  const { FileOps } = require('bindings')('file_ops');
  console.log('Module loaded successfully!');
  
  // Test the module
  const fileOps = new FileOps();
  const files = fileOps.listDirectory('C:\\');


  console.log('Files in current directory:', files);
} catch (error) {
  console.error('Failed to load module:', error);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});