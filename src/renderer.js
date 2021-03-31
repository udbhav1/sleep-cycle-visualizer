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
var sleepData, filteredData, labels, weekdayCounts, weekdayData;
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var currentGraph;
var mainChart;

function dayFrequency(){
    currentGraph = "dayFrequency";
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
    currentGraph = "dayQuality";
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
    currentGraph = "dayRegularity";
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

function dayTimeInBed(){
    currentGraph = "dayTimeInBed";
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
                label: 'Avg Time in Bed',
                data: _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time in bed (seconds)')];
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
    chartTitle.innerHTML = "Day of Week vs Time in Bed";
}

function dayTimeAsleep(){
    currentGraph = "dayTimeAsleep";
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
                label: 'Avg Time Asleep',
                data: _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time asleep (seconds)')];
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
    chartTitle.innerHTML = "Day of Week vs Time Asleep";
}

function dayTimeBeforeSleep(){
    currentGraph = "dayTimeBeforeSleep";
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
                label: 'Avg Time Before Sleep',
                data: _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time before sleep (seconds)')];
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
    chartTitle.innerHTML = "Day of Week vs Time Before Sleep";
}

function sleepQuality(){
    currentGraph = "sleepQuality";
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            // get only dates
            labels: _.map(filteredData[labels.indexOf('Start')], function(entry) {
                return entry[0]; 
            }),
            datasets: [{
                label: "Quality",
                data: filteredData[labels.indexOf('Sleep Quality')],
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
    currentGraph = "sleepRegularity";
    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            // get only dates
            labels: _.map(filteredData[labels.indexOf('Start')], function(entry) {
                return entry[0];
            }),
            datasets: [{
                label: "Regularity",
                data: filteredData[labels.indexOf('Regularity')],
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

function removeNaps(data, threshold){
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

function dayOfWeekStats(days, data){
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

function reloadGraph(){
    switch(currentGraph){
        case "dayFrequency":
            dayFrequency();
            break;
        case "dayQuality":
            dayQuality();
            break;
        case "dayRegularity":
            dayRegularity();
            break;
        case "dayTimeInBed":
            dayTimeInBed();
            break;
        case "dayTimeAsleep":
            dayTimeAsleep();
            break;
        case "dayTimeBeforeSleep":
            dayTimeBeforeSleep();
            break;
        case "sleepQuality":
            sleepQuality();
            break;
        case "sleepRegularity":
            sleepRegularity();
            break;
        default:
            dayFrequency();
    }
}

function updateData(napThreshold){
    const startDateBox = document.getElementById("startDate");
    const endDateBox = document.getElementById("endDate");

    let startDate = startDateBox.value;
    let endDate = endDateBox.value;
    if(startDate == ""){
        startDate = startDateBox.placeholder;
    }
    if(endDate == ""){
        endDate = endDateBox.placeholder;
    }
    // TODO make entered dates work with / as well as -

    filteredData = removeNaps(customDomain(sleepData, startDate, endDate), napThreshold);

    [weekdayCounts, weekdayData] = dayOfWeekStats(days, filteredData);

    reloadGraph();
}

function getData(){
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
        // TODO make replacement button the same size
        // const browseBtn = document.getElementById("btnBrowse");
        // const spinBtn = document.createElement('a');
        // spinBtn.innerHTML = '<a class="button is-loading">Loading</a>';
        // browseBtn.parentNode.replaceChild(spinBtn, browseBtn);

        // TODO make async so loading button renders
        [sleepData, labels] = ipcRenderer.sendSync('synchronous-message', filePath);

        // get first and last date of data
        const firstDate = sleepData[1][0][0];
        const lastDate = sleepData[1][sleepData[1].length-1][0];

        const startDateBox = document.getElementById("startDate");
        const endDateBox = document.getElementById("endDate");

        startDateBox.placeholder = firstDate;
        endDateBox.placeholder = lastDate;
        startDateBox.value = firstDate;
        endDateBox.value = lastDate;

        // nap threshold
        const thresh = 2;
        updateData(thresh);

        // remove overlay, switch to main view
        const modalOverlay = document.getElementById("overlay");
        modalOverlay.remove();

        // TODO add all graphs
        // start date vs quality (and moving average or similar?)
        // same for regularity ^
        // duration vs quality
        // histogram of sleep duration
        // plot of time in bed - time asleep (or just two lines)
        // day of week vs quality/duration
        // day of week vs time in bed/asleep (stacked bar graphs?)
    }
}
