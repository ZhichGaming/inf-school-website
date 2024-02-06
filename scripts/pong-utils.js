/**
 * Get the value of a get parameter from the URL.
 * @param {string} name - The name of the get parameter.
 * @returns The value of the get parameter.
 * @see https://stackoverflow.com/questions/831030/how-to-get-get-request-parameters-in-javascript
 */
function getGetParam(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
}

// Generation functions.

/**
 * Generate a ball with random properties.
 * @returns Ball object.
 */
function generateBall() {
    const randomRadius = Math.floor(Math.random() * 30) + 30;
    const randomColor = generateColor(); // Temporary color.
    const randomVelocity = generateVelocity();
    const [randomX, randomY] = generateCoords(randomRadius);
    const randomHealth = generateHealth();

    maxHits += randomHealth;

    return new Ball(randomX, randomY, randomRadius, randomColor, randomVelocity, randomHealth);
}

/**
 * Generate random coordinates for the ball.
 * @param {number} radius The radius of the ball.
 * @returns Array of coordinates [x, y].
 */
function generateCoords(radius) {
    // We have to divide by resolution ratio because the canvas is scaled up and .
    let randomX = Math.floor(Math.random() * canvas.width / RESOLUTION_RATIO);
    let randomY = Math.floor(Math.random() * canvas.height / 2 / RESOLUTION_RATIO);

    if (randomX - radius < 0) {
        randomX += radius;
    } else if (randomX + radius > canvas.width/RESOLUTION_RATIO) {
        randomX -= radius;
    }

    if (randomY - radius < 0) {
        randomY += radius;
    } else if (randomY + radius > canvas.height/RESOLUTION_RATIO) {
        randomY -= radius;
    }

    return [randomX, randomY];
}

/**
 * Generate random velocity for the ball that have a magnitude of initialBallVelocity.
 * @returns Array of velocity [dx, dy].
 */
function generateVelocity() {
    const randomVelocity = [Math.floor(Math.random() * 10) - 5, Math.floor(Math.random() * 10) - 5];

    if (randomVelocity[0] == 0 || randomVelocity[1] == 0) {
        return generateVelocity();
    }

    const magnitude = Math.sqrt(randomVelocity[0]**2 + randomVelocity[1]**2);
    const normalizedVelocity = [randomVelocity[0]/magnitude, randomVelocity[1]/magnitude];

    return [normalizedVelocity[0] * initialBallVelocity, normalizedVelocity[1] * initialBallVelocity];
}

/**
 * Generate random color for the ball.
 * @returns String of hexa color.
 */
function generateColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}

/**
 * Generate random health for the ball.
 * @returns Number between 1 and 9.
 */
function generateHealth() {
    return Math.floor(Math.random() * 9) + 1;
}

// Verification functions.

/**
 * Check if two balls are colliding.
 * @param {Ball} ball1 - The first ball.
 * @param {Ball} ball2 - The second ball.
 * @returns True if the balls are colliding, false otherwise.
 */
function checkBallCollision(ball1, ball2) {
    if (ball1 == null || ball2 == null) {
        return false;
    }

    let dx = ball1.x - ball2.x;
    let dy = ball1.y - ball2.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball1.radius + ball2.radius) {
        return true;
    }

    return false;
}

/**
 * Check if the ball is colliding with the wall.
 * @param {Ball} ball - The ball to check.
 * @returns True if the ball is colliding with the wall, false otherwise.
 */
function checkWallCollision(ball) {
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.velocity[0] = -ball.velocity[0];
        // SFX.hit.cloneNode().play();
    }

    if (ball.y - ball.radius < 0) {
        ball.velocity[1] = -ball.velocity[1];
        // SFX.hit.cloneNode().play();
    }
}

/**
 * Check if the ball is colliding with the paddle. If so, change the ball's velocity. Sets lastBounce to Date.now().
 * @param {Ball} ball - The ball to check.
 */
function checkPaddleCollision(ball) {
    const paddleInformation = getPaddleInformation();

    if (ball.y + ball.radius > paddleInformation.y) {
        if (ball.x > paddleInformation.x && ball.x < paddleInformation.x+paddleInformation.width) {
            // TODO: Fix bug of too much velocity.
            ball.lastBounce = Date.now();

            ball.velocity[1] = -ball.velocity[1];
            SFX["hit"].cloneNode().play();
            hits++;
            combo++;

            document.getElementById("score-display-combo").innerText = `x${combo}`;
            document.getElementById("score-display-accuracy").innerText = `${(hits/(hits+missed)*100).toFixed(1)}%`;

            updateScore((ball.health * Math.sqrt(ball.velocity[0]**2 + ball.velocity[1]**2)) * (1+combo/10));

            if (ball.health > 1) {
                ball.health -= 1;
            } else {
                clearBall(ball);
            }
        }
    }
}

/**
 * Check if the ball is out of the canvas and delete it.
 * @param {Ball} ball - The ball to check.
 */
function checkBallDeletion(ball) {
    if (ball?.y - ball?.radius > canvas.height) {
        deleteBall(ball);
        
        // Won't clone these because they shouldn't be spammed too much. 
        SFX["break-scifi"].play();
        SFX["break-shatter"].play();
        SFX["break-slide"].play();

        missed += ball.health;
        combo = 0;

        document.getElementById("score-display-combo").innerText = `x${combo}`;

        if (health - ball.health <= 0) {
            health = 0;

            onLose();
        } else {
            health -= ball.health;
        }

        document.getElementById("health").style.width = `${(health/maxHealth)*100}%`;
    }

    if (checkGameEnd()) {
        onWin();
    }
}

/**
 * Check if the game ended. The game ends when there are no balls left.
 * @returns True if the game ended, false otherwise.
 */
function checkGameEnd() {
    return balls.length == 0;
}

// Movement functions.

/**
 * Perform collision resolution between two balls.
 * @param {Ball} obj1 - The first ball.
 * @param {Ball} obj2 - The second ball.
 */
function collide(obj1, obj2) {
    let vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y};
    let distance = Math.sqrt((obj2.x-obj1.x)*(obj2.x-obj1.x) + (obj2.y-obj1.y)*(obj2.y-obj1.y));
    
    let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
    let vRelativeVelocity = {x: obj1.velocity[0] - obj2.velocity[0], y: obj1.velocity[1] - obj2.velocity[1]};
    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

    if (speed < 0){
        return;
    }

    let impulse = 2 * speed / (obj1.radius**2 + obj2.radius**2);

    obj1.velocity[0] -= (impulse * obj2.radius**2 * vCollisionNorm.x);
    obj1.velocity[1] -= (impulse * obj2.radius**2 * vCollisionNorm.y);
    obj2.velocity[0] += (impulse * obj1.radius**2 * vCollisionNorm.x);
    obj2.velocity[1] += (impulse * obj1.radius**2 * vCollisionNorm.y);

    // SFX.hit.cloneNode().play();
}

/**
 * Apply gravity to the ball.
 * @param {Ball} ball - The ball to apply gravity to.
 */
function applyGravity(ball) {
    if (ball == null)
        return;

    ball.velocity[1] = ball?.velocity[1] + GRAVITY;
}

// Misc functions.

/**
 * On win of the game.
 */
function onWin() {
    const min = Math.max(...Object.keys(RANK_REQUIREMENTS).filter( num => num <= hits/maxHits ));
    const rank = RANK_REQUIREMENTS[min];
    const map = pongMaps.find( map => map.id == selectedMap);

    document.getElementById("rank").src = `assets/pong/${rank}`;

    document.getElementById("win-menu-title").innerText = map.name ?? "Unknown";
    document.getElementById("win-menu-artist").innerText = map.artist ?? "Unknown";
    document.getElementById("win-menu-difficulty").innerText = difficulty ?? "Unknown";
    document.getElementById("score").innerText = String(score.toFixed(0)).padStart(6, "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("accuracy").innerText = (hits/maxHits*100).toFixed(1) + "%";
    document.getElementById("time").innerText = `${Math.floor((Date.now() - startTime)/1000)}s`;

    document.getElementById("win-menu").classList.remove("hidden");
    document.getElementById("win-menu").classList.add("show-win-menu");

    document.addEventListener("animationend", function() {
        document.getElementById("win-menu").classList.remove("show-win-menu");
    });

    if (hits/maxHits*100 > 60) {
        SFX["gameover-pass"].play();
    } else {
        SFX["gameover-fail"].play();
    }

    if (selectedMap != null && difficulty != null) {
        // save score to localStorage
        const rawScores = JSON.parse(localStorage.getItem("scores"));
        const scores = rawScores == null ? [] : rawScores[selectedMap] ?? [];

        scores.push({ 
            date: new Date().toISOString(), 
            time: Math.floor((Date.now() - startTime)/1000),
            difficulty: difficulty,
            score: score,
            hits: hits,
            maxScore: maxHits,
            accuracy: hits/maxHits*100,
            rank: rank
        });

        localStorage.setItem("scores", JSON.stringify({ ...JSON.parse(localStorage.getItem("scores")), [selectedMap]: scores }));
    }
}

/**
 * On loss of the game.
 * Adds transitions to the canvas, the main element and the loss element to make them fade in/out.
 * Adds the loss element to the DOM.
 * Adds a setInterval to spawn random triangles in the loss element.
 */
function onLose() {
    lost = true;
    paused = true;

    SFX.fail.play();
    audio.pause();

    document.getElementById("canvas").classList.add("lost");
    document.getElementById("main").classList.add("lost-body");

    // I can't clear the interval no matter what, triangles keep spawning.
    lostAnimationInterval = setInterval(function() {
        if (!document.hasFocus())
            return;

        if (!lost)
            return;

        spawnRandomTriangle(document.getElementById("restart"));
        spawnRandomTriangle(document.getElementById("quit"));
    }, 500);

    setTimeout(function() {
        document.getElementById("loss-menu").classList.remove("hidden");
        document.getElementById("loss-menu").classList.add("show-loss-menu");

        document.addEventListener("animationend", function() {
            document.getElementById("loss-menu").classList.remove("show-loss-menu");
        });
    } , 1000);
}

/**
 * Animate the change of page with a dark overlay.
 * @param {MouseEvent} event - The mouse event.
 * @param {string} url - The URL to change to.
 */
function animateChangePage(event, url) {
    var x = event.pageX;
    var y = event.pageY;

    var darkOverlay = document.getElementById('dark-overlay');
    darkOverlay.style.opacity = '1'; // Adjust the opacity as needed
    darkOverlay.style.clipPath = 'circle(0% at ' + x + 'px ' + y + 'px)';
    
    var startTime;

    function animate(time) {
        if (!startTime) startTime = time;
        var progress = (time - startTime) / 500; // 500 milliseconds animation duration
        darkOverlay.style.clipPath = 'circle(' + (progress * 100) + '% at ' + x + 'px ' + y + 'px)';

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // I could probably use a URL object here but I'm too lazy to.
            const resultURL = url + (url.includes("?") ? "&" : "?") + "animate=true";
            window.location.href = resultURL;
        }
    }

    requestAnimationFrame(animate);
}

/**
 * Animate the received page with an opacity transition.
 * If the animate get parameter is not present, the transition is removed.
 */
function animateReceivePage(element) {
    if (getGetParam("animate")) {
        const background = document.querySelector("html").style.background;

        document.querySelector("html").style.transition = "none";
        document.querySelector("html").style.background = "black";

        // By reading the offsetHeight property, we are forcing
        // the browser to flush the pending CSS changes (which it
        // does to ensure the value obtained is accurate).
        document.querySelector("html").offsetHeight;

        document.querySelector("html").style.transition = "background 1s ease-out";

        document.querySelector("html").offsetHeight;
        document.querySelector("html").style.background = background;
        
        element.style.opacity = 1;

        const url = new URL(window.location.href);
        url.searchParams.delete("animate");
        window.history.pushState({}, "", url);
    } else {
        // const transition = document.getElementById("body").style.transition;
        element.style.transition = "none";
        element.style.opacity = 1;
        // document.getElementById("body").style.transition = transition;
    }
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
 * On click of the cursor control checkbox.
 * @param {HTMLInputElement} checkbox - The checkbox.
 */
function onCheckCursorControl(checkbox) {
    controlWithMouse = checkbox.checked;
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
    cancelAnimationFrame(animationFrameID);
    lost = false;
    clearInterval(lostAnimationInterval);
    lostAnimationInterval = null;
    maxHits = 0
    health = maxHealth;

    SFX.restart.play();

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

    paddlePosition = screen.width / 2 * RESOLUTION_RATIO;
    restartDate = null;
    document.getElementById("main").style.opacity = 1;

    startTime = Date.now();
    score = 0;
    hits = 0;
    paused = false;

    document.getElementById("score-display-text").innerText = "000,000";

    main()
}

/**
 * Delete the ball from the balls array.
 * @param {Ball} ball - The ball to delete.
 */
function deleteBall(ball) {
    balls.splice(balls.indexOf(ball), 1);
}

/**
 * Clear the ball from the canvas (happens after animation) and animate its dissapearance.
 * @param {Ball} ball - The ball to clear.
 */
function clearBall(ball) {
    // Animate the dissapearance of the ball.
    ball.dissapearanceAnimationProgress = 0;
    updateScore(1000)

    // Play the sound effect.
    SFX["hit-break"].cloneNode().play();
}

/**
 * Spawn a random triangle in the element.
 * @param {HTMLElement} element - The element to spawn the triangle in.
 */
function spawnRandomTriangle(element) {
    const randomX = Math.floor(Math.random() * canvas.width);
    const newTriangle = document.createElement("div");

    newTriangle.classList.add("triangle");
    newTriangle.style.left = randomX + "px";
    newTriangle.style.display = "absolute";

    element.appendChild(newTriangle)
}

/**
 * Update the score and make it glow.
 * @param {number} increase - The increase in score.
 */
function updateScore(increase) {
    score += increase;

    document.getElementById("score-display-text").classList.remove("glow-score");
    document.getElementById("score-display-text").innerText = String(score.toFixed(0)).padStart(6, "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById("score-display-text").classList.add("glow-score");

    document.getElementById("score-display-text").addEventListener("animationend", function() {
        document.getElementById("score-display-text").classList.remove("glow-score");
    });
}

CanvasRenderingContext2D.prototype.roundedRectangle = function(x, y, width, height, rounded) {
    const radiansInCircle = 2 * Math.PI;
    const halfRadians = (2 * Math.PI)/2;
    const quarterRadians = (2 * Math.PI)/4;  
    
    // top left arc
    this.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true);
    
    // line from top left to bottom left
    this.lineTo(x, y + height - rounded);
  
    // bottom left arc  
    this.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true); 
    
    // line from bottom left to bottom right
    this.lineTo(x + width - rounded, y + height);
  
    // bottom right arc
    this.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true);  
    
    // line from bottom right to top right
    this.lineTo(x + width, y + rounded);
  
    // top right arc
    this.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true); 
    
    // line from top right to top left
    this.lineTo(x + rounded, y);
}

