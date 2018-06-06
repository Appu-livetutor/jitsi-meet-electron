/* global __dirname, process */

const electron = require('electron');
const APP = electron.app;
const BrowserWindow = electron.BrowserWindow;
const vectorMenu = require('./menu');


const isDev = require('electron-is-dev');

const {
    setupAlwaysOnTopMain
} = require('jitsi-meet-electron-utils');

const path = require('path');
const URL = require('url');


/**
 * Path to root directory
 */
const basePath = isDev ? __dirname : electron.app.getAppPath();

/**
 * URL for index.html which will be our entry point.
 */
const indexURL = URL.format({
    pathname: path.resolve(basePath, './build/index.html'),
    protocol: 'file:',
    slashes: true
});

/**
 * The window object that will load the iframe with Jitsi Meet.
 * IMPORTANT: Must be defined as global in order to not be garbage collected
 * acidentally.
 */
let jitsiMeetWindow = null;

/**
 * Options used when creating the main Jitsi Meet window.
 */
const jitsiMeetWindowOptions = {
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
	titleBarStyle: 'hidden',
    webPreferences: {
        nativeWindowOpen: true
    }
};
    electron.Menu.setApplicationMenu(vectorMenu);

/**
 * Sets the APP object listeners.
 */
function setAPPListeners() {
    APP.on('ready', createJitsiMeetWindow);
    APP.on('window-all-closed', () => {
        // Don't quit the application for macOS.
        if (process.platform !== 'darwin') {
            APP.quit();
        }
    });
    APP.on('activate', () => {
        if (jitsiMeetWindow === null) {
            createJitsiMeetWindow();
        }
    });
	electron.app.setAsDefaultProtocolClient('kaaryin-meet')

	// Protocol handler for osx
APP.on('open-url', function (event, url) {
  event.preventDefault();
  log("open-url event: " + url)

  dialog.showErrorBox('open-url', `You arrived from: ${url}`)
});

APP.on('before-quit', () => {
    global.appQuitting = true;
    if (mainWindow) {
        mainWindow.webContents.send('before-quit');
    }
});
    APP.on('certificate-error',
        // eslint-disable-next-line max-params
        (event, webContents, url, error, certificate, callback) => {
            if (url.startsWith('https://localhost')) {
                event.preventDefault();
                callback(true);
            } else {
                callback(false);
            }
        }
    );
}

/**
 * Opens new window with index.html(Jitsi Meet is loaded in iframe there).
 */
function createJitsiMeetWindow() {
    jitsiMeetWindow = new BrowserWindow(jitsiMeetWindowOptions);
    jitsiMeetWindow.loadURL(indexURL);

    jitsiMeetWindow.webContents.on('new-window', (event, url, frameName) => {
        if (frameName !== 'AlwaysOnTop') {
            event.preventDefault();
            electron.shell.openExternal(url);
        }
    });

    setupAlwaysOnTopMain(jitsiMeetWindow);

    jitsiMeetWindow.on('closed', () => {
        jitsiMeetWindow = null;
    });
}

//  Start the application:
setAPPListeners();
