function getData() {
    const remote = require("electron").remote;
    const dialog = remote.dialog;
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
        const { ipcRenderer } = require('electron');
        let filePath = result[0];
        console.log("from renderer: " + filePath);

        // TODO make replacement button same size
        const browseBtn = document.getElementById("btnBrowse");
        const spinBtn = document.createElement('a');
        spinBtn.innerHTML = '<a class="button is-loading">Loading</a>';
        browseBtn.parentNode.replaceChild(spinBtn, browseBtn);

        // TODO make async so spinny button renders
        let t = ipcRenderer.sendSync('synchronous-message', filePath);
        document.getElementById("test").innerHTML = t;

    }
}

// document.querySelector('#btnBrowse').addEventListener('click', () => {
//     getData();
// })
