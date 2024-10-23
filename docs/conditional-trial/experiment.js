let jsPsych = initJsPsych();
let timeline = [];

/**
 * Welcome
 */
let welcomeTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Welcome</h1> 
    <p>Press the <span class='key'>SPACE</span> key to begin.</p>
    `,
    choices: [' '],
}
timeline.push(welcomeTrial);



/**
 * This trial will be skipped at random
 */
let primeTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>You were randomly chosen to see this trial.</p> 
        <p>Press the <span class='key'>SPACE</span> key to continue.</p>
        `,
    choices: [' '],
    data: {
        collect: true,
        trialType: 'prime',
    },
    on_load: function () {
        if (getRandomNumber(0, 1) == 0) {
            jsPsych.data.addProperties({ sawPrime: false });
            jsPsych.finishTrial();
        } else {
            jsPsych.data.addProperties({ sawPrime: true });
        }
    }
}
timeline.push(primeTrial);



/**
 * Debrief
 */
let debriefTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Thank you!</h1> 
    <p>The experiment is complete, you can now close this tab.</p>
    `,
    choices: ['NO KEY'],
}
timeline.push(debriefTrial);


jsPsych.run(timeline);