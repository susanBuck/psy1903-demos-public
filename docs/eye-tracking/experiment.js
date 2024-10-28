let mock = true;

if (mock && localStorage.getItem('numbers') == null) {
    alert('Can not mock data as there is no previous data to use. Please run through the experiment in full once to record mock data');
    mock = false;
}

// document.addEventListener('DOMContentLoaded', () => {
//     document.body.innerHTML += `<div id='mouseCoordinates'></div>`;
// });

let jsPsych = initJsPsych({
    extensions: [
        { type: jsPsychExtensionWebgazer }
    ]
});

let numbers = null;
if (!mock) {
    numbers = generateNumbers();
} else {
    numbers = JSON.parse(localStorage.getItem('numbers'));
}

localStorage.setItem('numbers', JSON.stringify(numbers));

let targets = [];
let options = '';
let answer = null;
for (number of numbers) {
    options += `<div class='options' id='option${number}'>${number}</div>`;
    if (number % 2 == 0) {
        answer = number;
    }
    targets.push(`#option${number}`);
}
jsPsych.data.addProperties({ numbers: numbers, answer: answer });



let camera_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
          <p>In order to participate you must allow the experiment to use your camera.</p>
          <p>You will be prompted to do this on the next screen.</p>
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
          <p>Next we will calibrate the eye tracking.</p>
          <p>You’ll see a series of dots appear on the screen. Look at each dot and click on it.</p>
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
        <p>On the next screen you will see three numbers.</p>
        <p>Two of the numbers will be EVEN and one will be ODD.</p>
        <p>Look at the EVEN number until the numbers are no longer present.</p>
        <p>Press the <span class='key'>SPACE</span> key to start.</p>
        `
}

let trial = {
    type: jsPsychHtmlKeyboardResponse,
    trial_duration: 4000,
    stimulus: function () {
        return options;
    },
    choices: 'NO_KEYS',
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: { targets: targets }
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
            localStorage.setItem('results', JSON.stringify(results));
        } else {
            results = JSON.parse(localStorage.getItem('results'));
        }

        console.log(results);

        let dots = '';
        let counts = {};
        for (number of numbers) {
            counts[number] = 0;
        }

        for (data of results.webgazer_data) {

            let addClass = '';
            for (number of numbers) {

                let target = results.webgazer_targets['#option' + number];

                let inRange = isPointInSquare(data.x, data.y, target.x, target.y, target.width, target.height);
                if (inRange) {
                    counts[number]++;
                    addClass = 'inSquare';
                }

                dots += `<div class='dot ${addClass}' style='left:${Math.round(data.x)}px; top:${Math.round(data.y)}px' title='${data.t} (${Math.round(data.x)},${Math.round(data.y)})'></div>`;
            }
        }

        let chosenNumber = findKeyWithMaxValue(counts);
        let correct = chosenNumber == answer;

        if (correct) {
            feedback = `<div id='feedback' class='correct'>You choose ${chosenNumber} which is correct!</div>`;
        } else {
            feedback = `<div id='feedback' class='incorrect'>You chose ${chosenNumber} which is incorrect.</div>`;
        }

        return `
            <div id='results'>
            ${feedback}
            <div id='details'>
                The grey dots represent every gaze point that was recorded.
                The purple dots represent any gaze points that were within 50px of a number box and count for a "vote" for that number as the correct answer.
            </div>
            </div>
            ${dots}
            ${options}
        `;

    },
    choices: 'NO_KEYS'
};



if (!mock) {
    jsPsych.run([
        camera_instructions,
        init_camera,
        calibration_instructions,
        calibration,
        validation_instructions,
        validation,
        recalibrate,
        calibration_done,
        begin,
        trial,
        debriefTrial
    ]);
} else {
    jsPsych.run([
        debriefTrial
    ]);
}




function generateNumbers() {
    const getRandomOdd = () => {
        let num;
        do {
            num = Math.floor(Math.random() * 10); // Random number less than 10
        } while (num % 2 === 0); // Keep generating until we get an odd number
        return num;
    };

    const getRandomEven = () => {
        let num;
        do {
            num = Math.floor(Math.random() * 10); // Random number less than 10
        } while (num % 2 !== 0); // Keep generating until we get an even number
        return num;
    };

    const evenNumber = getRandomEven();
    const oddNumber1 = getRandomOdd();
    const oddNumber2 = getRandomOdd();

    return jsPsych.randomization.repeat([oddNumber1, oddNumber2, evenNumber], 1);
}



function isPointInSquare(pointX, pointY, squareX, squareY, width, height, padding = 50) {

    if (padding > 0) {
        squareX = squareX - padding;
        squareY = squareY - padding;
        width = width + padding + padding;
        height = height + padding + padding;
    }

    // Check if the point is within the horizontal bounds of the square
    const isWithinX = pointX >= squareX && pointX <= squareX + width;

    // Check if the point is within the vertical bounds of the square
    const isWithinY = pointY >= squareY && pointY <= squareY + height;

    // The point is inside the square if it's within both bounds
    return isWithinX && isWithinY;
}


function findKeyWithMaxValue(obj) {
    let maxKey = null;
    let maxValue = -Infinity; // Initialize to a very low value

    for (const [key, value] of Object.entries(obj)) {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }

    return maxKey;
}
