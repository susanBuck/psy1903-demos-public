let jsPsych = initJsPsych();
let timeline = [];



/**
 * Debrief
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
 * jsPsych plugin: "call-function" https://www.jspsych.org/latest/plugins/call-function/
 * This plugin allows us run arbitrary code - we use it here to add a property to our experiment data
 * called "showPrime" that is either 0 (false) or 1 (true). 
 * Then, in the next trial (primeTrial), we look for this property and if it's false, we skip that trial
 */
let prePrimeTrial = {
    type: jsPsychCallFunction,
    func: function () {
        jsPsych.data.addProperties({
            showPrime: getRandomNumber(0, 1)
        })
    }
}
timeline.push(prePrimeTrial);



/**
 * 
 */
let primeTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>You were randomly chosen to see this trial.</p> 
        <p>Press the <span class='key'>SPACE</span> key to continue.</p>
        `,
    choices: [' '],
    on_load: function () {

        // Retrieve the data from the previous trial (prePrimeTrial)
        let lastTrialData = jsPsych.data.get().last(1).values()[0];

        // If showPrime was 0 (false), skip this trial
        if (lastTrialData.showPrime == false) {
            jsPsych.finishTrial();
        }
    },
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