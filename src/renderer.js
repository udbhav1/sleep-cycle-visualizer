const remote = require("electron").remote;
const dialog = remote.dialog;
var Chart = require('chart.js');
var _ = require('underscore');
const { ipcRenderer } = require('electron');

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
    console.log(startValid, endValid);
    return dataCopy;
}

// TODO write func to get average day of week data
function dayOfWeekStats(days, data, labels){
    let numericalCols = ['Sleep Quality', 'Regularity', 'Heart rate (bpm)', 'Steps', 'Air Pressure (Pa)', 'Movements per hour', 'Time in bed (seconds)', 'Time asleep (seconds)', 'Time before sleep (seconds)', 'Snore time'];

    let numericalColIndices = [];
    
    for(var col of numericalCols){
        numericalColIndices.push(labels.indexOf(col));
    }

    console.log(numericalColIndices);
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
    console.log("called");

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
        console.log("from renderer: " + filePath);

        // TODO make replacement button same size
        // const browseBtn = document.getElementById("btnBrowse");
        // const spinBtn = document.createElement('a');
        // spinBtn.innerHTML = '<a class="button is-loading">Loading</a>';
        // browseBtn.parentNode.replaceChild(spinBtn, browseBtn);

        // TODO make async so spinny button renders
        let labels, sleepData;
        [sleepData, labels] = ipcRenderer.sendSync('synchronous-message', filePath);
        console.log(sleepData[0]);
        console.log(sleepData[1]);
        console.log(labels);
        document.getElementById("test").innerHTML = "a";

        const thresh = 60*120;
        let newData = removeNaps(sleepData, labels, thresh);
        console.log(sleepData[0].length);
        console.log(newData[0].length);

        let d1 = "05-20-2019";
        let d3 = "06-01-2020";
        let customData = customDomain(sleepData, d1, d3);
        console.log(sleepData[0].length);
        console.log(customData[0].length);

        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayCounts = [];
        [dayCounts, customData] = dayOfWeekStats(days, sleepData, labels);

        console.log(dayCounts);
        console.log(customData);
        // console.log("Date test:");
        // let d1 = "05-20-2019";
        // let d2 = "05-23-2019";
        // let d3 = "06-01-2020";
        // console.log(dateGreaterEqual(d1, d2));
        // console.log(dateGreaterEqual(d1, d3));
        // console.log(dateGreaterEqual(d2, d3));
        // console.log(dateGreaterEqual(d2, d1));
        // console.log(dateGreaterEqual(d3, d1));
        // console.log(dateGreaterEqual(d3, d2));

        // console.log(dateGreaterEqual(d1, d1));
        // console.log(dateGreaterEqual(d2, d2));
        // console.log(dateGreaterEqual(d3, d3));

        // TODO add all graphs
        // start date vs quality
        // duration vs quality
        // histogram of sleep duration
        // plot of time in bed - time asleep (or just two lines)
        // day of week vs quality/duration
        // day of week vs time before sleep

        var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: '# of Occurrences',
                    data: dayCounts,
                    backgroundColor: _.range(dayCounts.length).map(function () {return 'rgba(147, 112, 219, 0.8)'}),
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

    }
}
