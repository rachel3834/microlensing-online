console.log("Executing PSPL_microlensing_event_animation.js");

var PSPL_microlensing_event_animation = (function() {
  var eventModule = PSPL_microlensing_event;
  var lensPlaneModule = PSPL_microlensing_event_lens_plane;

  var fps = 60; // frames rendered per second (ideally; runs slow in non-Chrome browsers now)

  var time;
  var timer;
  var running = false;

  var minTime;
  var maxTime;
  var animationStep = 0.1; // (days) time step per frame of animation
  var playbackControlStep = 0.1; // (days) time step for "stepBack" and "stepForward" playback commands
  console.log(minTime + " " + animationStep + " " + maxTime);

  var timeReadout = document.getElementById("timeReadout");
  var stepBackButton = document.getElementById("stepBack");
  var playButton = document.getElementById("play");
  var pauseButton = document.getElementById("pause");
  var stepForwardButton = document.getElementById("stepForward");
  var timeResetButton = document.getElementById("timeReset");

  var roundingErrorThreshold = 1e-12; // if values passed to almostEquals have a smaller difference
                                      // than this, they will pass as "almost" equal

  function updateMinAndMaxTimes(min, max) {

    // default to min/max values of lightcurve plot time axis
    if (min === undefined)
      min = eventModule.xAxisInitialDay;

    if (max === undefined)
      max = eventModule.xAxisFinalDay;

    minTime = min;
    maxTime = max;
  }

  function init() {
    updateMinAndMaxTimes();
    time = minTime;
    timeReadout.innerHTML = Number(time).toFixed(4);
    initListeners();
  }

  function run() {
    if (running === true) {
      timer = window.setTimeout(run, 1000/fps);
      updateTime(time+animationStep);
      animateFrame();
    }
  }

  function almostEquals(a, b, epsilon=roundingErrorThreshold) {
    return (Math.abs(a - b) < epsilon);
  }

  function updateTime(newTime) {
    time = newTime;

    // makes sure we display "0.00" instead of "-0.00" if 0 time has rounding error
    var newTimeReadout = Number(time).toFixed(4);
    if (almostEquals(time, 0) === true) {
      newTimeReadout = Number(0).toFixed(4);
    }
    timeReadout.innerHTML = newTimeReadout; // update time readout
  }

  function animateFrame() {
    console.log("animating frame");

    // min/max times may have changed if lightcurve plot time axis scale/range has changed
    updateMinAndMaxTimes();
    // pause if we've reached the max time
    if ( (time >= maxTime) || (almostEquals(time, maxTime) === true) ) {
      console.log(`time ${time} is greater than or equal to (within rounding error threshold of ${roundingErrorThreshold}) maxTime ${maxTime}`);
      updatePlayback("pause");
      return;
    }
    console.log(`time ${time} is less than (within rounding error threshold of ${roundingErrorThreshold}) maxTime ${maxTime}`);

    eventModule.plotLightcurve(time); // animate frame for lightcurve
    animateFrameSource(); // animate frame for source movement on lens plane figure
    console.log("TIME: " + time);
    var u = eventModule.getU(eventModule.getTimeTerm(time));
    var magnif = eventModule.getMagnif(time);
    console.log("debugging u: " + String(u));
    console.log("debugging magnif: " + String(magnif));
  }

  function animateFrameSource() {
    // update source thetaX position for new time
    lensPlaneModule.sourcePos.x = lensPlaneModule.getThetaX(time);
    lensPlaneModule.redraw();
  }

  function initListeners() {
    stepBackButton.addEventListener("click", function() { updatePlayback("stepBack"); }, false);
    playButton.addEventListener("click", function() { updatePlayback("play"); }, false);
    pauseButton.addEventListener("click", function() { updatePlayback("pause"); }, false);
    stepForwardButton.addEventListener("click", function() { updatePlayback("stepForward"); }, false);
    timeResetButton.addEventListener("click", function() { updatePlayback("timeReset"); }, false);
  }

  function updatePlayback(command="play", updateFrame=true) {
    //setting updateFrame to false lets us modify the internal frame without
    // actually updating the display, in case we want to issue multiple playback
    // command before actually updating the displayed frame (like multiple
    // steps backwards/forwards)
    window.clearTimeout(timer);

    if (command === "stepBack") {
      console.log("step back");
      if (time > minTime) {
        updateTime(time - playbackControlStep);
        if (updateFrame === true)
          animateFrame();
      }
    }
    else if (command === "play") {
      console.log("play");
      console.log(time);
      if (time >= maxTime || almostEquals(time, maxTime) === true) {
        updatePlayback("timeReset");
        console.log("At or past max time, resetting");
      }
      running = true;
      run();
    }
    else if (command === "pause") {
      console.log("pause");
      running = false;
    }
    else if (command === "stepForward") {
      console.log("step forward");
      if (time < maxTime && almostEquals(time, maxTime) === false) {
        updateTime(time + playbackControlStep);
        if (updateFrame === true)
          animateFrame();
      }
    }
    else if (command === "timeReset") {
      console.log("reset time");
      running = false;
      updateTime(minTime);
      if (updateFrame === true)
        animateFrame();
    }
  }

  init();

  return {
    get running() { return running; },
    get time() { return time; },

    updatePlayback: updatePlayback,
    animateFrame: animateFrame,
  }
})();
