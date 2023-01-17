//Import needed modules
const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    globalShortcut,
    systemPreferences,
} = require("electron");
const path = require("path");

//Import and start module for reloading UI on code change
require("electron-reload")(__dirname);

//Definition of needed variables
let window;

//Wait until app is ready
app.whenReady().then(() => {
    //Create new window, tray and system shortcut
    createWindow();
    createTray();
    createGlobalShortcut();
});

//Create icon in system tray
function createTray() {
    //Create tray with app icon
    const tray = new Tray("./src/assets/logo.png");

    //Display notification
    tray.displayBalloon({
        title: "WinMenu",
        content: "You can open this app through the tray icon.",
    });

    //Set tray title and tooltip
    tray.setTitle("WinMenu");
    tray.setToolTip("Click to open app");

    //Open window on icon click
    tray.on("click", (e) => {
        showWindow();
    });

    //Destroy tray before quiting
    app.on("before-quit", () => tray.destroy())
}

//Create system shortcut for opening app
function createGlobalShortcut() {
    globalShortcut.register("Control+Shift+F1", () => {
        showWindow();
    });
}

//Show window
function showWindow() {
    window.show();
}

//Hide window
function hideWindow() {
    window.hide();
}

//Function for creating new program window
function createWindow() {
    //Create new electron window and add config to it
    window = new BrowserWindow({
        resizable: false,
        transparent: true,
        frame: false,
        icon: "./assets/logo.png",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            allowRunningInsecureContent: true,
        },
    });

    //Maximize and hide the window
    window.maximize();
    hideWindow();

    //IPC for sending and receiving data from UI
    ipcMain.on("close_app", () => hideWindow());

    //Send variables on UI load
    ipcMain.on("load", () => {
        window.webContents.send("vars", {
            clr: {
                accent: "#" + systemPreferences.getAccentColor(),
            },
        });
    });

    //Hide window on minimize/close
    window.on("minimize", (e) => {
        e.preventDefault();
        hideWindow();
    });

    window.on("close", (e) => {
        e.preventDefault();
        hideWindow();
    });

    //Load UI
    window.loadFile(__dirname + "/ui/index.html");
}
