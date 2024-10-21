let jsPsych = initJsPsych();
let timeline = [];



/**
 * Conditions
 */
let colors = ['blue', 'orange'];
conditions = initJsPsych().randomization.repeat(colors, 1);



/**
 * Welcome trial
 */
let welcomeTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Welcome to the Response Time Task!</h1>
    <p>In this experiment, you will see a blue or orange circle on the screen.</p>
    <p>If you see a blue circle, press the F key.</p>
    <p>If you see a orange circle, press the J key.</p>
    <p>Press the <span class='key'>SPACE</span> key to begin.</p>
    `,
    choices: [' ']
}
timeline.push(welcomeTrial);


/**
 * Conditions loop
 */
for (let condition of conditions) {

    let conditionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<img src='images/${condition}-circle.png'>`,
        choices: ['f', 'j'],
        data: {
            collect: true,
        },
        on_finish: function (data) {
            if (data.response == 'f' && condition == 'blue') {
                data.correct = true;
            } else if (data.response == 'j' && condition == 'orange') {
                data.correct = true;
            } else {
                data.correct = false;
            }
        }
    }
    timeline.push(conditionTrial);

    let fixationTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `+`,
        trial_duration: 200,
        choices: ['NO KEY']
    }
    timeline.push(fixationTrial);
}



/**
 * Process results
 */
let resultsTrial = {
    type: jsPsychHtmlKeyboardResponse,
    choices: ['NO KEYS'],
    async: false,
    stimulus: ` 
        <h1>Please wait...</h1>
        <p>We are saving the results of your inputs.</p>
        `,
    on_start: function () {

        // Filter and retrieve results as CSV data
        let results = jsPsych.data
            .get()
            .filter({ collect: true })
            .ignore(['stimulus', 'trial_type', 'plugin_version', 'collect'])
            .csv();

        console.log(results);

        // Generate gift card
        fetch('/gift-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            body: JSON.stringify({}),
        }).then(response => {
            return response.json();
        }).then(data => {
            jsPsych.data.addProperties({ gcClaimCode: data.gcClaimCode });
            jsPsych.finishTrial();
        })
    }
}
timeline.push(resultsTrial);



/**
 * Debrief
 */
let debriefTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let gcClaimCode = jsPsych.data.get().last(1).values()[0].gcClaimCode;
        return `
            <h1>Thank you!</h1>
            <p>As a thank you for your participation, here is a $10 Amazon Gift Card:</a>
            <div>
                <img class='giftCardImage' src='images/gift-card.jpg' alt='Amazon Gift Card Image'>
                <div class='giftCardCode'>${gcClaimCode}</div>
            </div>

            <a href='https://www.amazon.com/gc/redeem'>Go here to redeem your gift code...</a>
            `
    },
    choices: ['NO KEY'],
}
timeline.push(debriefTrial);



/**
 * Run
 */
jsPsych.run(timeline);