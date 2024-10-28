// https://api.qualtrics.com/1179a68b7183c-retrieve-a-survey-response
// https://harvard.pdx1.qualtrics.com/admin/account-settings-portal/user-settings

import { config } from 'dotenv';
config();

import https from 'https';

let token = process.env.QUALTRICS_API_TOKEN;
let surveyId = 'SV_ekV0pVH9xqAoOb4';
let responseId = 'R_11tSkZCCYy776iq';

let headers = {
    'Content-Type': 'application/json',
    'X-API-TOKEN': token,
};

let options = {
    hostname: 'pdx1.qualtrics.com',
    path: '/API/v3/surveys/' + surveyId + '/responses/' + responseId,
    method: 'GET',
    headers: headers
};

console.log('options:', options);

let data = JSON.stringify({
    surveyId: surveyId,
    // Add other data fields here
});

let req = https.request(options, function (res) {
    res.setEncoding('utf-8');

    let responseString = '';

    res.on('data', function (data) {
        responseString += data;
    });

    res.on('end', function () {
        let responseObject = JSON.parse(responseString);
        console.log('Response:', responseObject);

    });
});

req.write(data);
req.end();

