document.getElementById('searchButton').addEventListener('click', function () {

    fetch('/query-reddit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({
            foo: 1
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Access the returned data here
        })
        .catch(error => {
            console.error('Error:', error);
        });
});