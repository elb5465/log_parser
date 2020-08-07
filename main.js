const electron = require('electron')
    // Module to control application life.
const app = electron.app
    // Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', createWindow) //TK - Original setup 

// ------------ ATTEMPT AT CREATING A SPLASH SCREEN ----------------
// let splash

// app.on('ready', () => {
//   // create main browser window
//   mainWindow = new BrowserWindow({
//     //   titleBarStyle: 'hidden',
//       width: 1920,
//       height: 1080,
//       show: false // don't show the main window
//   });
//   // create a new `splash`-Window 
//   splash = new BrowserWindow({width: 810, height: 610, transparent: false, frame: true, alwaysOnTop: false});
//   splash.loadURL(`./splash.html`);
//   mainWindow.loadURL(`./index.html`);

//   // if main window is ready to show, then destroy the splash window and show up the main window
//   mainWindow.once('ready-to-show', () => {
//     splash.destroy();
//     createWindow();
//     mainWindow.show();
//   });
// });
//-----------------------------------------------------------------

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// process.on('uncaughtException', function (error) {
//     // Handle the error
//     console.log(error);
// });
