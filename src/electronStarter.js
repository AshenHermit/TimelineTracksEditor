const electron = require('electron');
const fs = require('fs');
const { ipcMain, dialog } = require('electron')
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');




var settingsPath = "settings.json"
var defaultSettings = {
    locale: "en",
    openDevTools: false
}
var settings = Object.assign({}, defaultSettings)
if(fs.existsSync(settingsPath)){
    try{
        settings = Object.assign(settings, JSON.parse(fs.readFileSync(settingsPath, "utf8")))
    }catch(err){
        
    }
}else{
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
}
function applySettings(){
    ipcMain.emit("applySettings", settings)
}

ipcMain.on("appIsReady", (event)=>{
    console.log("ready")
    event.reply("applySettings", settings)
})




// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule:true,
            contextIsolation: false,
        }
    })

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    // and load the index.html of the app.
    mainWindow.loadURL(startUrl);

    // Open the DevTools.
    if(settings.openDevTools) mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});