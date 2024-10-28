let mock = false;

document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML += `<div id='mouseCoordinates'></div>`;
});

let jsPsych = initJsPsych({
    extensions: [
        { type: jsPsychExtensionWebgazer }
    ]
});

let camera_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
          <p>In order to participate you must allow the experiment to use your camera.</p>
          <p>You will be prompted to do this on the next screen.</p>
          <p>If you do not wish to allow use of your camera, you cannot participate in this experiment.<p>
          <p>It may take up to 30 seconds for the camera to initialize after you give permission.</p>
        `,
    choices: ['Got it'],
}

let init_camera = {
    type: jsPsychWebgazerInitCamera
}

let calibration_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
          <p>Now you'll calibrate the eye tracking, so that the software can use the image of your eyes to predict where you are looking.</p>
          <p>You'll see a series of dots appear on the screen. Look at each dot and click on it.</p>
        `,
    choices: ['Got it'],
}

let calibration = {
    type: jsPsychWebgazerCalibrate,
    calibration_points: [
        [25, 25], [75, 25], [50, 50], [25, 75], [75, 75]
    ],
    repetitions_per_point: 2,
    randomize_calibration_order: true
}

let validation_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
          <p>Now we’ll measure the accuracy of the calibration.</p>
          <p>Look at each dot as it appears on the screen.</p>
          <p>You do not need to click on the dots this time.</p>
        `,
    choices: ['Got it'],
    post_trial_gap: 1000
}

let validation = {
    type: jsPsychWebgazerValidate,
    validation_points: [
        [25, 25], [75, 25], [50, 50], [25, 75], [75, 75]
    ],
    roi_radius: 200,
    time_to_saccade: 1000,
    validation_duration: 2000,
    data: {
        task: 'validate'
    }
}

let recalibrate_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
          <p>The accuracy of the calibration is a little lower than we’d like.</p>
          <p>Let’s try calibrating one more time.</p>
          <p>On the next screen, look at the dots and click on them.<p>
        `,
    choices: ['OK'],
}

let recalibrate = {
    timeline: [recalibrate_instructions, calibration, validation_instructions, validation],
    conditional_function: function () {
        let validation_data = jsPsych.data.get().filter({ task: 'validate' }).values()[0];
        return validation_data.percent_in_roi.some(function (x) {
            let minimum_percent_acceptable = 50;
            return x < minimum_percent_acceptable;
        });
    },
    data: {
        phase: 'recalibration'
    }
}

let calibration_done = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
          <p>Great, we’re done with calibration!</p>
        `,
    choices: ['OK']
}

let begin = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [' '],
    stimulus: `
        <p>Press the <span class='key'>SPACE</span> key to start.</p>
        `
}

let trial = {
    type: jsPsychHtmlKeyboardResponse,
    trial_duration: 10000,
    stimulus: function () {

        return `
           <img src='img/portrait.jpeg' id='option1'>
        `;
    },
    on_start() {

        console.log(jsPsych.extensions.webgazer);


        var prediction = jsPsych.extensions.webgazer.getCurrentPrediction();
        if (prediction) {
            var x = prediction.x;
            var y = prediction.y;
        }


    },
    choices: 'NO_KEYS',
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: { targets: ['#option1'] }
        }
    ]
};

let debriefTrial = {
    type: jsPsychHtmlKeyboardResponse,
    on_start: function () {
        let mouseCoordinatesEl = document.getElementById('mouseCoordinates');
        document.addEventListener('mousemove', function (event) {
            mouseCoordinatesEl.innerHTML = event.pageX + ',' + event.pageY;
        });

    },
    stimulus: function () {
        if (!mock) {
            results = jsPsych.data.getLastTrialData().values()[0];
            console.log(results);
        } else {
            results = mockResults;
        }

        let target = results.webgazer_targets['#option1'];

        let bullseyes = '';
        for (data of results.webgazer_data) {
            bullseyes += `<div id='bullseye' style='left:${Math.round(data.x)}px; top:${Math.round(data.y)}px' title='${data.t} (${Math.round(data.x)},${Math.round(data.y)})'></div>`;
        }

        return `
            ${bullseyes}
            <img src='img/portrait.jpeg' id='option1'>
            
            
<textarea id='results'>

TARGET:
top left corner: ${Math.round(target.x)}, ${Math.round(target.y)}
width: ${Math.round(target.width)}
height: ${Math.round(target.height)}
top: ${Math.round(target.top)}
bottom: ${Math.round(target.bottom)}
left: ${Math.round(target.left)}
right: ${Math.round(target.right)}
</textarea>
        `;
    },
    choices: 'NO_KEYS'
};

if (!mock) {
    jsPsych.run([
        camera_instructions,
        init_camera,
        //calibration_instructions,
        //calibration,
        //validation_instructions,
        //validation,
        //recalibrate,
        //calibration_done,
        begin,
        trial,
        debriefTrial
    ]);
} else {
    jsPsych.run([
        debriefTrial
    ]);
}