const remote = require("electron").remote;
const dialog = remote.dialog;
var _ = require('underscore');
const { ipcRenderer } = require('electron');

var Chart = require('chart.js');
var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(231,233,237)'
};

var color = Chart.helpers.color;

// globals
var sleepData, labels, weekdayCounts, weekdayData;
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var mainChart;

function dayFrequency(){
    // TODO make global
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: '# of Occurrences',
                data: weekdayCounts,
                // backgroundColor: 'rgba(147, 112, 219, 0.8)',
                backgroundColor: color(chartColors.red).alpha(0.8).rgbString(),
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    var chartTitle = document.getElementById('chartTitle');
    chartTitle.innerHTML = "Day of Week vs Frequency";
}

function dayQuality(){
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Avg Quality',
                // get index 3 of every day's aggregated data
                data: _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Sleep Quality')];
                }),
                // backgroundColor: 'rgba(147, 112, 219, 0.8)',
                backgroundColor: color(chartColors.red).alpha(0.8).rgbString(),
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    var chartTitle = document.getElementById('chartTitle');
    chartTitle.innerHTML = "Day of Week vs Sleep Quality";
}

function dayRegularity(){
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Avg Regularity',
                data: _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Regularity')];
                }),
                // backgroundColor: 'rgba(147, 112, 219, 0.8)',
                backgroundColor: color(chartColors.red).alpha(0.8).rgbString(),
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    var chartTitle = document.getElementById('chartTitle');
    chartTitle.innerHTML = "Day of Week vs Sleep Regularity";
}

function sleepQuality(){
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            // get only dates
            labels: _.map(sleepData[labels.indexOf('Start')], function(entry) {
                return entry[0]; 
            }),
            datasets: [{
                label: "Quality",
                data: sleepData[labels.indexOf('Sleep Quality')],
                backgroundColor: color(chartColors.red).alpha(0.8).rgbString(),
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    var chartTitle = document.getElementById('chartTitle');
    chartTitle.innerHTML = "Sleep Quality over Time";
}

function sleepRegularity(){
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            // get only dates
            labels: _.map(sleepData[labels.indexOf('Start')], function(entry) {
                return entry[0];
            }),
            datasets: [{
                label: "Regularity",
                data: sleepData[labels.indexOf('Regularity')],
                backgroundColor: color(chartColors.red).alpha(0.8).rgbString(),
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    var chartTitle = document.getElementById('chartTitle');
    chartTitle.innerHTML = "Sleep Regularity over Time";
}

function removeNaps(data, labels, threshold){
    let ri = labels.indexOf('Time in bed (seconds)');
    let naps = [];

    // find indices of naps
    for(var i = 0; i < data[ri].length; i++){
        if(data[ri][i] < threshold){
            naps.push(i);
        }
    }

    // deep copy
    let dataCopy = JSON.parse(JSON.stringify(data));

    // delete back to front
    naps.reverse();
    for(var j = 0; j < naps.length; j++){
        for(var i = 0; i < dataCopy.length; i++){
            dataCopy[i].splice(j, 1);
        }
    }
    return dataCopy;
}

function dateGreaterEqual(a, b){
    let aD = new Date(a);
    let bD = new Date(b);
    return aD >= bD;
}

function customDomain(data, start, end){
    // deep copy
    let dataCopy = JSON.parse(JSON.stringify(data));
    let startValid = -1;
    let endValid = 0;

    for(var i = 0; i < dataCopy[1].length; i++){
        if(dateGreaterEqual(dataCopy[1][i][0], start)){
            if(startValid == -1){
                startValid = i;
                endValid = i;
            }
            else if(dateGreaterEqual(end, dataCopy[1][i][0])){
                endValid++;
            }
        }
    }

    for(var i = 0; i < dataCopy.length; i++){
        dataCopy[i] = dataCopy[i].slice(startValid, endValid+1);
    }
    return dataCopy;
}

function dayOfWeekStats(days, data, labels){
    let numericalCols = ['Sleep Quality', 'Regularity', 'Heart rate (bpm)', 'Steps', 'Air Pressure (Pa)', 'Movements per hour', 'Time in bed (seconds)', 'Time asleep (seconds)', 'Time before sleep (seconds)', 'Snore time'];

    let numericalColIndices = [];
    
    for(var col of numericalCols){
        numericalColIndices.push(labels.indexOf(col));
    }

    // generate empty array of length days containing arrays of length labels filled with 0s
    let dayData = _.range(days.length).map(function () {
        return _.range(labels.length).map(function () { 
            return 0;
        });
    });

    let dayCounts = _.range(days.length).map(function () {return 0.0;})


    // calc sums of relevant cols
    for(var i = 0; i < data[0].length; i++){
        let curDay = data[0][i];
        let curDayIndex = days.indexOf(curDay);
        for(var contInd of numericalColIndices){
            dayData[curDayIndex][contInd] += data[contInd][i];
        }
        dayCounts[curDayIndex]++;
    }
    // calc avg
    dayData = _.map(dayData, function(day, dayInd) {
        return _.map(day, function (el, i) {
            return el/dayCounts[dayInd];
        });
    });

    return [dayCounts, dayData];

}

function getData() {
    let result = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        properties: ["openFile"],
        filters: [
            // TODO figure out if parsing xlsx is different
            {
                name: 'Spreadsheets',
                extensions: ['csv', 'xlsx']
            },
            {
                name: 'All Files',
                extensions: ['*']
            }
        ]
    })

    if (typeof result === "object") {
        let filePath = result[0];
        // TODO make replacement button same size
        // const browseBtn = document.getElementById("btnBrowse");
        // const spinBtn = document.createElement('a');
        // spinBtn.innerHTML = '<a class="button is-loading">Loading</a>';
        // browseBtn.parentNode.replaceChild(spinBtn, browseBtn);

        // TODO make async so spinny button renders
        [sleepData, labels] = ipcRenderer.sendSync('synchronous-message', filePath);

        const thresh = 60*120;
        let newData = removeNaps(sleepData, labels, thresh);

        [weekdayCounts, weekdayData] = dayOfWeekStats(days, removeNaps(sleepData, labels, thresh), labels);

        // remove overlay, switch to main view
        const modalOverlay = document.getElementById("overlay");
        modalOverlay.remove();

        dayFrequency();
        // TODO add all graphs
        // start date vs quality (and moving average or similar?)
        // same for regularity ^
        // duration vs quality
        // histogram of sleep duration
        // plot of time in bed - time asleep (or just two lines)
        // day of week vs quality/duration
        // day of week vs time before sleep

    }
}
