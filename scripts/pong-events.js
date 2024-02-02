document.addEventListener("keydown", onKeydown);
document.addEventListener("keyup", onKeyup);

function onKeydown(event) {
    if (event.key == "ArrowLeft") {
        leftPressed = true;
    } else if (event.key == "ArrowRight") {
        rightPressed = true;
    } else if (event.key == "Shift") {
        shiftPressed = true;

        var thisKeypressTime = new Date();

        if ( thisKeypressTime - lastKeypressTime <= EXPANSION_DELTA )
        {
            // optional - if we'd rather not detect a triple-press
            // as a second double-press, reset the timestamp
            thisKeypressTime = 0;
            isExpanding = true;
            console.log("double");
        }

        lastKeypressTime = thisKeypressTime;
    } else if (event.key == "`" && !event.repeat) {
        restartDate = Date.now();
    }
}

function onKeyup(event) {
    if (event.key == "ArrowLeft") {
        leftPressed = false;
    } else if (event.key == "ArrowRight") {
        rightPressed = false;
    } else if (event.key == "Shift") {
        shiftPressed = false;
    } else if (event.key == "`" && !event.repeat) {
        restartDate = null;
        document.getElementById("main").style.opacity = 1;
    }
}

// Move the paddle.
// document.addEventListener("mousemove", function(event) {
//     paddlePosition = event.clientX*2;
// });