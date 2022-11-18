const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

// CREATE MAIN WINDOW HANDLER
const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
  });

  // OPEN DEV TOOLS IF APP IS IN DEV
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
};

// CREATE ABOUT WINDOW
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
};

// RENDER MAIN WINDOW WHEN APP IS LOADED
app.whenReady().then(() => {
  createMainWindow();

  // IMPLEMENT MENU
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// MENU TEMPLATE
const menu = [
  ...(isMac
    ? [
        {
          label: "About",
          click: createAboutWindow,
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  // {
  //   label: "File",
  //   submenu: [
  //     {
  //       label: "Quit",
  //       click: () => app.quit(),
  //       accelerator: "CmdOrCtrl+W",
  //     },
  //   ],
  // }
];

// QUIT APPLICATION IF ALL WINDOWS ARE CLOSED ON WINDOWS
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
