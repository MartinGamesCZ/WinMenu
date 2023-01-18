//Import needed modules
const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    globalShortcut,
    systemPreferences,
    Menu,
    screen,
} = require("electron");
const path = require("path");

//Import and start module for reloading UI on code change
require("electron-reload")(__dirname);

//Definition of needed variables
let window,
    mode = "normal";
let pin = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
};

//Wait until app is ready
app.whenReady().then(() => {
    //Create new window, tray and system shortcut
    createWindow();
    createTray();
    createGlobalShortcut();
    attachToStartup();
});

//Create icon in system tray
function createTray() {
    //Create tray with app icon
    const tray = new Tray(path.join(__dirname, "../assets/logo.png"));

    //Display notification
    tray.displayBalloon({
        title: "WinMenu",
        content: "You can open this app through the tray icon.",
    });

    //Set tray title and tooltip
    tray.setTitle("WinMenu");
    tray.setToolTip("Click to open app");

    //Create tray context menu
    tray.setContextMenu(
        Menu.buildFromTemplate([
            { label: "Exit", type: "normal", click: () => app.quit() },
            {
                label: "Pin",
                type: "checkbox",
                checked: mode == "pin",
                click: () => {
                    if (mode == "pin") unpinWindow();
                    else pinWindow();
                },
            },
        ])
    );

    //Open window on icon click
    tray.on("click", (e) => {
        showWindow();
    });

    //Destroy tray before quiting
    app.on("before-quit", () => tray.destroy());
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

//Pin window
function pinWindow() {
    mode = "pin";
    window.setFullScreen(false)
    window.setAlwaysOnTop(true);
    window.setSize(Math.round(pin.w), Math.round(pin.h));
    window.setPosition(Math.round(pin.x), Math.round(pin.y));
    window.reload();
    showWindow()
}

//UnPin window
function unpinWindow() {
    mode = "normal";
    window.maximize();
    window.setAlwaysOnTop(false);
    window.reload();
}

//Function for creating new program window
function createWindow() {
    //Create new electron window and add config to it
    window = new BrowserWindow({
        resizable: false,
        transparent: true,
        frame: false,
        icon: "../assets/logo.png",
        width: 50,
        height: 50,
        minHeight: 50,
        maxHeight: 400,
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
            mode: mode,
            clr: {
                accent: "#" + systemPreferences.getAccentColor(),
            },
        });

        if (mode != "pin") window.webContents.send("get_vars");
    });

    //Receive variables from UI
    ipcMain.on("vars", (e, d) => {
        pin = d.pin;
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
    window.loadFile("./src/ui/index.html");
}

//Attach app to open on computer start
function attachToStartup() {
    app.setLoginItemSettings({
        openAtLogin: true
    })
}