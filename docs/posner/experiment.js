let jsPsych = initJsPsych();

let timeline = [];

/**
 * Calibration
 */
let chinRest = {
    type: jsPsychVirtualChinrest,
    adjustment_prompt: `
    <h1>Welcome to the Posner Cueing Task</h1>
    <p>To ensure that the visual elements in this study are presented at their intended size, we first need to calibrate our experiment with your monitor.</p>
    <p>To do this, click and drag the lower right corner of the above rectangle until it is the same size as a credit card held up to the screen.</p>
    <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>
    <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>
    `,
    blindspot_reps: 3,
    resize_units: "cm",
    pixels_per_unit: 50,
    /* We want each box to be 7.5cm (75mm)
       7.5 * 50 pixels_per_unit = 375px width/height to set the box to be
    */
    on_finish: function (data) {
        console.log(data);
    }
};
timeline.push(chinRest);



/**
 * Instructions
 */
let instructions = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [' '],
    stimulus: `
        <h1>Instructions</h1>
        <p>In the screens that follow, you will see boxes.</p>
        <p>If a star appears in the box on the LEFT, press the left arrow key <span class='key'>←</span>. Example:</p>
        <img class='demo' src='images/left-example.png'>
        <p>If a star appears in the box on the RIGHT, press the right arrow key <span class='key'>→</span>. Example:</p>
        <img class='demo' src='images/right-example.png'>
        <p>One of the boxes may be highlighted before the star is presented. Please ignore this and only respond once the star is presented.</p>
        <p>Throughout the trials, you should maintain your gaze on the small plus sign you’ll see in the center of the screen while responding as quickly and accurately as possible.</p>
        <p>Press the <span class='key'>SPACE</span> key to begin</p>
    `,
}
timeline.push(instructions);



/**
 * Trials
 */
for (let i = 0; i < 10; i++) {
    let trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
                <div id='left' class='box cue'></div>
                <div id='fixation' class='box'>+</div>
                <div id='right' class='box cue'></div>
            `,
        choices: ['ArrowLeft', 'ArrowRight'],
        data: {
            collect: true,
        },
        on_load: function () {

            let sides = jsPsych.randomization.repeat(['left', 'right'], 1);
            let targetSide = sides[0];
            let nonTargetSide = sides[1];

            // Valid Trials: The target appears in the location indicated by the cue about 80% of the time
            let isValid = Math.random() < 0.8;  // 80% valid, 20% invalid

            if (isValid) {
                cueSide = targetSide;
            } else {
                cueSide = nonTargetSide;
            }

            // Flash the cue briefly
            document.getElementById(cueSide).style.backgroundColor = 'silver';
            setTimeout(function () {
                document.getElementById(cueSide).style.backgroundColor = 'white';
            }, 150);

            // Show the target after a brief delay
            setTimeout(function () {
                document.getElementById(targetSide).innerHTML = '⭑';  // Show the target
            }, 500);
        }
    };
    timeline.push(trial);
}


/**
 * Debrief
 */
let debrief = {
    type: jsPsychHtmlKeyboardResponse,
    choices: 'NO KEYS',
    stimulus: `
        <h1>Thank you!</h1>
        <p>You can now close this tab.</p>
    `,
    on_start: function (data) {
        // Filter and retrieve results as CSV data
        let results = jsPsych.data
            .get()
            .filter({ collect: true })
            .ignore(['stimulus', 'trial_type', 'plugin_version', 'collect'])
            .csv();

        console.log(results);
    }
}
timeline.push(debrief);



jsPsych.run(timeline);