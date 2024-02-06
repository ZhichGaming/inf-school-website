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
            if ( Date.now() - lastExpansionDate < 1000 ) 
                return;

            // optional - if we'd rather not detect a triple-press
            // as a second double-press, reset the timestamp
            thisKeypressTime = 0;
            isExpanding = true;
            lastExpansionDate = Date.now();
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

// Move the paddle using cursor.
document.addEventListener("mousemove", function(event) {
    if (controlWithMouse) {
        if (event.clientX*2 > canvas.width - PADDLE_WIDTH/2) {
            paddlePosition = canvas.width - PADDLE_WIDTH/2;
            return;
        }

        else if (event.clientX < PADDLE_WIDTH/2) {
            paddlePosition = PADDLE_WIDTH/2;
            return;
        }

        paddlePosition = event.clientX*2;

    }
});
