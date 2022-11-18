const { app, BrowserWindow } = require("electron");
const path = require("path");

// CREATE MAIN WINDOW HANDLER
const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 500,
    height: 600,
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
};

// RENDER MAIN WINDOW WHEN APP IS LOADED
app.whenReady().then(() => {
  createMainWindow();
});
