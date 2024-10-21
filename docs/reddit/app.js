let resultsEl = document.getElementById('results')
let loaderEl = document.getElementById('loader');
let inputForm = document.getElementById('inputForm');

let colors = {
    '-5': 'scale-minus-5',
    '-4': 'scale-minus-4',
    '-3': 'scale-minus-3',
    '-2': 'scale-minus-2',
    '-1': 'scale-minus-1',
    '0': 'scale-0',
    '1': 'scale-plus-1',
    '2': 'scale-plus-2',
    '3': 'scale-plus-3',
    '4': 'scale-plus-4',
    '5': 'scale-plus-5',
}

document.getElementById('searchButton').addEventListener('click', function (event) {

    event.preventDefault();

    loaderEl.style.display = 'block';

    fetch('/query-reddit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({
            limit: inputForm['limit'].value,
            query: inputForm['query'].value,
            subreddit: inputForm['subreddit'].value,
        }),
    })
        .then(response => {
            return response.json();
        }).then(data => {

            resultsEl.innerHTML = '';
            loaderEl.style.display = 'none';
            resultsEl.style.display = 'block';

            let content = `<div id='sentimentMean'>Sentiment Mean for all Posts: ${data.sentimentMean}</div>`;

            content += `Raw Data: <textarea>${JSON.stringify(data)}</textarea>`;

            data.postsData.forEach(function (data) {

                let calculations = data.sentimentResults.calculation.reduce((acc, obj) => {
                    const key = Object.keys(obj)[0];  // Get the key from the object (e.g., "help")
                    acc[key] = obj[key];              // Set key and corresponding value in accumulator object
                    return acc;                       // Return accumulator for the next iteration
                }, {});

                content += `
                    <div class='post'>
                    <div>Sentiment score: ${data.sentimentResults.score}</div>
                    <a href='${data.url}'>${data.title}</a>
                    <p>
                `;

                data.sentimentResults.tokens.forEach(function (word) {
                    if (data.sentimentResults.positive.includes(word)) {
                        content += `<span class='word ${colors[calculations[word]]}'>${word} <sup>${calculations[word]}</sup></span> `;
                    } else if (data.sentimentResults.negative.includes(word)) {
                        content += `<span class='word ${colors[calculations[word]]}'>${word} <sup>${calculations[word]}</sup></span> `;
                    } else {
                        // content += word + ' ';
                    }

                });

                content += `</p>
                    </div>`

            })

            resultsEl.innerHTML += content;

        })
});



function jsonToCSV(jsonArray) {
    // Step 1: Check if input is an array of objects
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
        return '';
    }

    // Step 2: Extract the headers (keys) from the first object in the array
    const headers = Object.keys(jsonArray[0]);

    // Step 3: Create the CSV header row by joining the headers with commas
    const csvRows = [headers.join(",")];

    // Step 4: Loop through each object and create a CSV row
    jsonArray.forEach(obj => {
        const values = headers.map(header => {
            const value = obj[header];
            // Escape any commas, quotes, or newlines in values by wrapping them in quotes
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvRows.push(values.join(","));
    });

    // Step 5: Combine all rows into a single CSV string, separated by newlines
    return csvRows.join("\n");
}