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
var currentChart = "dayFrequency";
var mainChart;

// used by day of week stats function
var numericalCols = ['Sleep Quality', 'Regularity', 'Heart rate (bpm)', 'Steps', 'Air Pressure (Pa)', 'Movements per hour', 'Time in bed (seconds)', 'Time asleep (seconds)', 'Time before sleep (seconds)', 'Snore time'];

// all charts described by objects
var dayFrequency = {
    type            : "bar",
    title           : "Day of Week vs Frequency",
    dataDescription : "# of Occurences",
    xAxis           : days,
    data            : function() {
        return weekdayCounts;
    }
};

var dayQuality = {
    type            : "bar",
    title           : "Day of Week vs Sleep Quality",
    dataDescription : "Avg Quality",
    xAxis           : days,
    data            : function() {
        return _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Sleep Quality')];
                });
    }
};

var dayRegularity = {
    type            : "bar",
    title           : "Day of Week vs Sleep Regularity",
    dataDescription : "Avg Regularity",
    xAxis           : days,
    data            : function() {
        return _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Regularity')];
                });
    }
};

var dayTimeInBed = {
    type            : "bar",
    title           : "Day of Week vs Time in Bed",
    dataDescription : "Avg Time in Bed",
    xAxis           : days,
    data            : function() {
        return _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time in bed (seconds)')];
                });
    }
};

var dayTimeInBed = {
    type            : "bar",
    title           : "Day of Week vs Time in Bed",
    dataDescription : "Avg Time in Bed",
    xAxis           : days,
    data            : function() {
        return _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time in bed (seconds)')];
                });
    }
};

var dayTimeAsleep = {
    title           : "Day of Week vs Time Asleep",
    dataDescription : "Avg Time Asleep",
    xAxis           : days,
    data            : function() {
        return _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time asleep (seconds)')];
                });
    }
};

var dayTimeBeforeSleep = {
    type            : "bar",
    title           : "Day of Week vs Time Before Sleep",
    dataDescription : "Avg Time Before Sleep",
    xAxis           : days,
    data            : function() {
        return _.map(weekdayData, function(dayData) {
                    return dayData[labels.indexOf('Time before sleep (seconds)')];
                });
    }
};

var sleepQuality = {
    type            : "line",
    title           : "Sleep Quality over Time",
    dataDescription : "Quality",
    xAxis           : function() {
        return _.map(filteredData[labels.indexOf('Start')], function(entry) {
                    return entry[0]; 
                });
    },
    data            : function() {
        return filteredData[labels.indexOf('Sleep Quality')]
    }
};

var sleepRegularity = {
    type            : "line",
    title           : "Sleep Regularity over Time",
    dataDescription : "Regularity",
    xAxis           : function() {
        return _.map(filteredData[labels.indexOf('Start')], function(entry) {
                    return entry[0];
                });
    },
    data            : function() {
        return filteredData[labels.indexOf('Regularity')]
    }
};

// used to find correct chart object and to set current chart for reload
var charts = {
    "dayFrequency": dayFrequency,
    "dayQuality": dayQuality,
    "dayRegularity": dayRegularity,
    "dayTimeInBed": dayTimeInBed,
    "dayTimeAsleep": dayTimeAsleep,
    "dayTimeBeforeSleep": dayTimeBeforeSleep,
    "sleepQuality": sleepQuality,
    "sleepRegularity": sleepRegularity
}

function barGraph(name){
    currentChart = name;
    // retrieve fields
    chartObj = charts[name];
    let title = chartObj.title;
    let description = chartObj.dataDescription;
    let xLabels = chartObj.xAxis;
    let chartData = chartObj.data();

    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: xLabels,
            datasets: [{
                label: description,
                data: chartData,
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
    chartTitle.innerHTML = title;
}

function lineGraph(name){
    currentChart = name;
    // retrieve fields
    chartObj = charts[name];
    let title = chartObj.title;
    let description = chartObj.dataDescription;
    let xLabels = chartObj.xAxis();
    let chartData = chartObj.data();

    var ctx = document.getElementById('mainChart').getContext('2d');
    // reset canvas
    if (mainChart != null){
        mainChart.destroy();
    }
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            // get only dates
            labels: xLabels,
            datasets: [{
                label: description,
                data: chartData,
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
    chartTitle.innerHTML = title;
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
    let type = charts[currentChart].type;
    if(type == "bar"){    
        barGraph(currentChart);
    }
    else if(type == "line"){
        lineGraph(currentChart);
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
            // TODO parse xlsx as well
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
