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

    maxScore += randomHealth;

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
        SFX.hit.play();
    }

    if (ball.y - ball.radius < 0) {
        ball.velocity[1] = -ball.velocity[1];
        SFX.hit.play();
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
            SFX["hit-paddle"].play();
            score += 1;

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
        
        SFX["break-scifi"].play();
        SFX["break-shatter"].play();
        SFX["break-slide"].play();

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

    SFX.hit.play();
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
    const min = Math.max(...Object.keys(RANK_REQUIREMENTS).filter( num => num <= score/maxScore ));
    const rank = RANK_REQUIREMENTS[min];

    document.getElementById("rank").src = `assets/pong/${rank}`;

    document.getElementById("score").innerText = String(score).padStart(6, "0").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    document.getElementById("accuracy").innerText = (score/maxScore*100).toFixed(1) + "%";
    document.getElementById("time").innerText = `${Math.floor((Date.now() - startTime)/1000)}s`;

    document.getElementById("win-menu").classList.remove("hidden");
    document.getElementById("win-menu").classList.add("show-win-menu");

    document.addEventListener("animationend", function() {
        document.getElementById("win-menu").classList.remove("show-win-menu");
    });

    if (selectedMap != null && difficulty != null) {
        // save score to localStorage
        const rawScores = JSON.parse(localStorage.getItem("scores"));
        const scores = rawScores == null ? [] : rawScores[selectedMap] ?? [];

        scores.push({ 
            date: new Date().toISOString(), 
            score: score/maxScore*100,
            time: Math.floor((Date.now() - startTime)/1000),
            difficulty: difficulty,
            score: score,
            maxScore: maxScore,
            accuracy: score/maxScore*100,
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

    SFX.naiwa.play();
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
    paused = false;
    clearInterval(lostAnimationInterval);
    lostAnimationInterval = null;
    maxScore = 0
    health = maxHealth;

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

    // Play the sound effect.
    SFX["hit-break"].play();
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

