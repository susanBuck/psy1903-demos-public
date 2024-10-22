let querystring = require('querystring');
let https = require('https');

let host = 'survey.qualtrics.com';
let username = '';
let token = '';
let sessionId = null;
let survey_id = '';

function performRequest(endpoint, method, data, success) {
    let dataString = JSON.stringify(data);

    let headers = {};

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    }
    else {
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };
    }
    let options = {
        hostname: host,
        path: endpoint,
        method: method,
        headers: headers
    };

    let req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        let responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            console.log(responseString);
            let responseObject = JSON.parse(responseString);
            success(responseObject);
        });
    });

    req.write(dataString);
    req.end();
}

function getSurveyName() {
    performRequest('/WRAPI/ControlPanel/api.php', 'GET', {
        Request: 'getSurvey',
        SurveyID: survey_id,
        User: username,
        Token: token,
        Version: '2.3',
        Format: 'JSON'
    }, function (data) {
        console.log('Fetched ' + data.result);
    });
}

getSurveyName();