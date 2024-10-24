let jsPsych = initJsPsych();

let timeline = [];

var trial = {
    type: jsPsychVirtualChinrest,
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
timeline.push(trial);

for (let i = 0; i < 10; i++) {
    let trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
                <div id='left-cue' class='box cue'></div>
                <div id='fixation' class='box'>+</div>
                <div id='right-cue' class='box cue'></div>
            `,
        choices: ['ArrowLeft', 'ArrowRight'],
        on_load: function () {
            // Simulate a valid or invalid cue by highlighting one side
            let isValid = Math.random() < 0.8;  // 80% valid, 20% invalid
            let cueSide = isValid ? 'left-cue' : 'right-cue';
            document.getElementById(cueSide).style.backgroundColor = 'silver';

            // Show the target after a brief delay
            setTimeout(function () {
                var targetSide = isValid ? 'left-cue' : 'right-cue';
                document.getElementById(targetSide).innerHTML = '⭑';  // Show the target
            }, 500);
        }
    };

    timeline.push(trial);
}

jsPsych.run(timeline);
