"use strict"

/**
 * Start the game.
 */
function start() {
    canvas = document.getElementById("canvas")
    context = canvas.getContext("2d");

    canvas.width = window.innerWidth * RESOLUTION_RATIO;
    canvas.height = window.innerHeight * RESOLUTION_RATIO;

    selectedMap = getGetParam("map");
    difficulty = getGetParam("difficulty");

    if (selectedMap != null && difficulty != null) {
        const map = pongMaps.find(map => map.id == selectedMap);
        const diff = map.difficulties.find(diff => diff.name.toLowerCase() == difficulty.toLowerCase());

        numberOfBalls = diff.number_of_balls;
        initialBallVelocity = diff.initial_ball_velocity;

        audio = new Audio(`./assets/maps/${selectedMap}/music.mp3`);
        audio.loop = true;
        audio.volume = 0.2;

        audio.addEventListener("canplaythrough", () => {
            audio.play().catch(e => {
                window.addEventListener('keydown', () => {
                    audio.play()
                }, { once: true })
            })
        });
    }

    
    for (let i = 0; i < numberOfBalls; i++) {
        balls.push(generateBall());
    }

    // const bgm = new Audio("assets/pong/sfx/bgm-ohayou.mp3");
    // bgm.loop = true;
    // bgm.volume = 0.2;
    // bgm.play();

    main()
}

/**
 * Get the information of the paddle.
 * @returns Object with x, y, width and height.
 */
function getPaddleInformation() {
    return {
        x: paddlePosition-PADDLE_WIDTH/2-screen.width*expansionState,
        y: canvas.height - PADDLE_HEIGHT - PADDLE_PADDING,
        width: PADDLE_WIDTH + 2*screen.width*expansionState,
        height: PADDLE_HEIGHT
    }
}

/**
 * The main game loop.
 */
function main() {
    const paddleMultiplier = shiftPressed ? 2 : 1;
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move the paddle.
    if (leftPressed && paddlePosition > PADDLE_WIDTH/2) {
        paddlePosition -= 10 * paddleMultiplier * RESOLUTION_RATIO;
    } else if (rightPressed && paddlePosition < canvas.width - PADDLE_WIDTH/2) {
        paddlePosition += 10 * paddleMultiplier * RESOLUTION_RATIO;
    }

    if (isExpanding) {
        expansionState += 0.1;

        if (expansionState > 1) {
            isExpanding = false;
        }
    } else if (expansionState > 0) {
        expansionState -= 0.05;
    }

    const paddleInformation = getPaddleInformation();

    // Draw the paddle.
    context.beginPath();
    context.fillStyle = "white";
    context.roundedRectangle(paddleInformation.x, paddleInformation.y, paddleInformation.width, paddleInformation.height, 10);
    context.fill();
    context.closePath();

    // Draw the balls and check for collision.
    for (let i = 0; i < balls.length; i++) {
        if (balls[i]?.canBeDeleted) {
            balls.splice(i, 1);

            if (checkGameEnd()) {
                onWin();
            }

            continue;
        } else if (balls[i]?.isDissapearing) {
            balls[i]?.draw();
            continue;
        }

        balls[i].x += balls[i].velocity[0];
        balls[i].y += balls[i].velocity[1];

        checkWallCollision(balls[i]); // Does not set lastBounce.
        checkPaddleCollision(balls[i]);
        checkBallDeletion(balls[i]);

        // applyGravity(balls[i]);

        for (let j = 0; j < balls.length; j++) {
            if (i == j) {
                continue
            }

            if (checkBallCollision(balls[i], balls[j])) {
                balls[i].lastBounce = Date.now();
                balls[j].lastBounce = Date.now();

                collide(balls[i], balls[j]);
            }
        }
        
        balls[i]?.draw();
    }

    // Check for restart.
    if (restartDate != null) {
        const now = Date.now();
        const diff = Math.abs(restartDate - now)/1000;

        if (diff > RESTART_TIME_REQUIRED) {
            restartGame()
        } else {
            document.getElementById("main").style.opacity = 0.5 - diff/RESTART_TIME_REQUIRED;
        }
    }

    requestAnimationFrame(main);
}

/**
 * On click of the restart button.
 * Adds a transition to the main element to make it fade out.
 */
function onclickRestartButton() {
    document.getElementById("main").style.transition = "opacity 0s";
    document.getElementById("main").style.opacity = 0;
    document.getElementById("main").style.transition = "opacity 0.25s ease-out";

    setTimeout(function() {
        restartGame();
    }, 100);
}

/**
 * Restart the game and reset all variables.
 */
function restartGame() {
    lost = false;
    clearInterval(lostAnimationInterval);
    lostAnimationInterval = null;
    maxScore = 0

    audio.play();
    audio.currentTime = 0;

    document.getElementById("loss-menu").classList.add("hidden");
    document.getElementById("loss-menu").classList.remove("show-loss-menu");
    document.getElementById("win-menu").classList.add("hidden");
    document.getElementById("win-menu").classList.remove("show-win-menu");

    balls = [];
    for (let i = 0; i < numberOfBalls; i++) {
        balls.push(generateBall());
    }

    document.getElementById("canvas").classList.remove("lost");
    document.getElementById("main").classList.remove("lost-body");

    paddlePosition = screen.width / 2;
    restartDate = null;
    document.getElementById("main").style.opacity = 1;

    startTime = Date.now();
    score = 0;
}

window.onload = start;
