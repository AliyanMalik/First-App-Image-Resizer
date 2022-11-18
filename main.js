const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

// CREATE MAIN WINDOW HANDLER
const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
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

// Respond to the resize image event
ipcMain.on("image:resize", (e, options) => {
  // console.log(options);
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

// Resize and save image
async function resizeImage({ imgPath, height, width, dest }) {
  try {
    // console.log(imgPath, height, width, dest);

    // Resize image
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // Get filename
    const filename = path.basename(imgPath);

    // Create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write the file to the destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success to renderer
    mainWindow.webContents.send("image:done");

    // Open the folder in the file explorer
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

// QUIT APPLICATION IF ALL WINDOWS ARE CLOSED ON WINDOWS
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
