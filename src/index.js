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
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function rearrangeDate(dateStr){
    // sleep cycle formats as yyyy-mm-dd, but js works with mm-dd-yyyy
    dateStr = dateStr.substr(5) + "-" + dateStr.substr(0, 4);
    return dateStr;
}
function dayOfWeek(dateStr){
    let d = new Date(dateStr);
    return days[d.getDay()];
}

function parseCSV(filename) {
    const fs = require('fs');

    const data = fs.readFileSync(filename, {encoding:'utf8', flag:'r'});
    let fileEntries = data.split("\n");
    // get rid of labels
    // TODO assign labels array based on this instead of hardcoding
    fileEntries.shift();

    for(var i = 0; i < fileEntries.length; i++){
        fileEntries[i] = fileEntries[i].split(";");
        sleepData.push([]);
    }

    // turn data from split rows to lists of each column
    for(var i = 0; i < fileEntries.length; i++){
        for(var j = 0; j < fileEntries[i].length; j++){
            sleepData[j].push(fileEntries[i][j]);
        }
    }

    // split up Start and End into [date, time] and rearrange dates
    for(var i = 0; i < sleepData[0].length; i++){
        sleepData[0][i] = sleepData[0][i].split(" ");
        sleepData[0][i][0] = rearrangeDate(sleepData[0][i][0]);
        sleepData[1][i] = sleepData[1][i].split(" ");
        sleepData[1][i][0] = rearrangeDate(sleepData[1][i][0]);
    }

    // create day of week data from start date
    sleepData.unshift([]);
    labels.unshift('Day of Week');

    for(var i = 0; i < sleepData[1].length; i++){
        sleepData[0].push(dayOfWeek(sleepData[1][i][0]));
    }

    // turn relevant cols into numbers
    // TODO read this from an external file so only have to change once
    // ^ same with every reference to a specific column
    let intCols = ['Sleep Quality', 'Regularity', 'Heart rate (bpm)', 'Steps'];

    let floatCols = ['Air Pressure (Pa)', 'Movements per hour', 'Time in bed (seconds)', 'Time asleep (seconds)', 'Time before sleep (seconds)', 'Snore time'];

    for(var col of intCols){
        let ri = labels.indexOf(col);
        if(ri > -1){
            for(var i = 0; i < sleepData[ri].length; i++){
                sleepData[ri][i] = parseInt(sleepData[ri][i]);
            }
        }
    }

    for(var col of floatCols){
        let ri = labels.indexOf(col);
        if(ri > -1){
            for(var i = 0; i < sleepData[ri].length; i++){
                sleepData[ri][i] = parseFloat(sleepData[ri][i]);
            }
        }
    }

    // TODO turn time in bed and time asleep into minutes/hours

    console.log(labels);
    return [sleepData, labels];
}

const { ipcMain } = require('electron');
ipcMain.on('synchronous-message', (event, arg) => {
    console.log("from main: " + arg);
    event.returnValue = parseCSV(arg);
})
