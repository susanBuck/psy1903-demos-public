/**
 * 
 */
async function saveResults(fileName, data, config) {

    // Dynamically determine if the experiment is currently running locally or on production
    let isLocalHost = window.location.href.includes('localhost');

    let destination = '/save';
    if (!isLocalHost || config.forceOSFSave) {
        destination = 'https://pipe.jspsych.org/api/data/';
    }

    // Send the results to our saving end point
    fetch(destination, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({
            experimentID: config.dataPipeExperimentId,
            filename: fileName,
            data: data,
        }),
    }).then(data => {
        return true;
    })
}

/**
 * 
 */
function getCurrentTimestamp() {
    return new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '-');
}

/**
 * 
 */
function objectArrayToCSV(data) {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => obj[header]).join(","));
    return [headers.join(","), ...rows].join("\n");
}

/**
 * 
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
