const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

var sleepData = [];
var labels = ['Start', 'End', 'Sleep Quality', 'Regularity', 'Mood', 'Heart rate (bpm)', 'Steps', 'Alarm mode', 'Air Pressure (Pa)', 'City', 'Movements per hour', 'Time in bed (seconds)', 'Time asleep (seconds)', 'Time before sleep (seconds)', 'Window start', 'Window stop', 'Did snore', 'Snore time', 'Weather temperature (¬∞F)', 'Weather type', 'Notes'];

function parseCSV(filename) {
    const fs = require('fs');

    const data = fs.readFileSync(filename, {encoding:'utf8', flag:'r'});
    var fileEntries = data.split("\n");
    // get rid of labels
    // TODO assign labels array based on this instead of hardcoding
    fileEntries.shift();

    for(var i = 0; i < fileEntries.length; i++){
        fileEntries[i] = fileEntries[i].split(";");
        sleepData.push([]);
    }

    for(var i = 0; i < fileEntries.length; i++){
        for(var j = 0; j < fileEntries[i].length; j++){
            sleepData[j].push(fileEntries[i][j]);
        }
    }

    // entry for day of week
    sleepData.unshift([]);
    labels.unshift('Day of Week');

    // TODO create day of week data from start and end

    console.log(sleepData[0]);
    console.log(sleepData[1]);
    console.log(sleepData.length);

    return sleepData[0];
}

const { ipcMain } = require('electron');
ipcMain.on('synchronous-message', (event, arg) => {
    console.log("from main: " + arg);
    event.returnValue = parseCSV(arg);
})
