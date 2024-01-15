"use strict"

// Canvas and context.
let canvas;
let context;

// General game variables.
let balls = [];
let paddlePosition = screen.width / 2;

// Game state and loss animations.
let lost = false;
let lostAnimationInterval = null;

// Key states.
let leftPressed = false;
let rightPressed = false;
let shiftPressed = false;

// Date of start of press of restart key.
let restartDate = null;

function dot(a, b) {
    return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

/**
 * Ball is a class that represents a ball in the game of pong.
 * 
 * @param {number} x - The x coordinate of the ball.
 * @param {number} y - The y coordinate of the ball.
 * @param {number} radius - The radius of the ball.
 * @param {string} color - The color of the ball in hex. Deprecated.
 * @param {number} velocity - The velocity of the ball. Vector (dx, dy).
 * @param {number} health - The initial health of the ball. Max: 9.
 */
class Ball {
    constructor(x, y, radius, color, velocity, health) {
        this.x = x;
        this.y = y;
        this.radius = radius; 
        this.color = color; // Deprecated.
        this.velocity = velocity;
        this.health = health;

        this.isDissapearing = false;
        this.canBeDeleted = false;
        this.dissapearanceAnimationProgress = null;
    }

    /**
     * Draw the ball on the canvas.
     * @returns void
     */
    draw() {
        const globalAlpha = this.isDissapearing ? (1-this.dissapearanceAnimationProgress+0.01)/5 : 1;
        context.globalAlpha = globalAlpha;

        // Draw inner circle image.
        const innerCircle = new Image();

        innerCircle.src = "assets/pong/hitcircle@2x.png";
        innerCircle.width = this.radius*3.01;
        innerCircle.height = this.radius*3.01;

        // create offscreen buffer, 
        let buffer = document.createElement('canvas');
        buffer.width = innerCircle.width;
        buffer.height = innerCircle.height;

        let bx = buffer.getContext('2d');

        // fill offscreen buffer with the tint color
        bx.fillStyle = HEALTH_COLORS[this.health];
        bx.fillRect(0,0,buffer.width,buffer.height);

        // destination atop makes a result with an alpha channel identical to fg, but with all pixels retaining their original color *as far as I can tell*
        bx.globalCompositeOperation = "destination-atop";
        bx.drawImage(innerCircle, 0,0, this.radius*3.01, this.radius*3.01);

        // to tint the image, draw it first
        context.drawImage(innerCircle, this.x - this.radius*1.505, this.y - this.radius*1.505, this.radius*3.01, this.radius*3.01);

        //then set the global alpha to the amound that you want to tint it, and draw the buffer directly on top of it.
        context.globalAlpha = 0.5;
        context.drawImage(buffer, this.x - this.radius*1.505, this.y - this.radius*1.505, this.radius*3.01, this.radius*3.01);
        context.globalAlpha = globalAlpha;

        // Draw health.
        const healthLabel = new Image();
        healthLabel.src = "assets/pong/default-" + this.health + ".png";
        context.drawImage(healthLabel, this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);

        // Draw outer circle image.
        const outerCircle = new Image();
        outerCircle.src = "assets/pong/hitcircleoverlay@2x.png";
        context.drawImage(outerCircle, this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);

        context.globalAlpha = 1;

        // Draw the clear animation if it is in progress.
        if (this.dissapearanceAnimationProgress != null) {
            this.isDissapearing = true;
            this.canBeDeleted = this.drawClearAnimation(this.x, this.y);
            this.dissapearanceAnimationProgress += 0.02;
        }

        // Draw the velocity vector of the ball for debugging purposes.
        // context.beginPath();
        // canvas_arrow(context, this.x, this.y, (this.x+this.velocity[0]*20), (this.y+this.velocity[1]*20));
        // context.stroke();
        // context.closePath();
    }

    /**
     * Draw the clear animation of the ball.
     * @param {number} x - The x coordinate of where the ball dissapeared.
     * @param {number} y - The y coordinate of where the ball dissapeared.
     * @returns True if the animation is done, false otherwise.
     */
    drawClearAnimation(x, y) {
        if (this.dissapearanceAnimationProgress > 1) {
            this.dissapearanceAnimationProgress = null;
            return true;
        }

        const image = new Image();
        image.src = "assets/pong/lighting-standard.png";

        // Bell curve function. (I really bothered to go on desmos to find the perfect function for these...)
        const opacity = Math.E**(-((this.dissapearanceAnimationProgress-0.5)**2)/(2*0.15**2))/Math.sqrt(2*Math.PI*0.4**2)
        const length = -1/(20*this.dissapearanceAnimationProgress+1)+1;

        context.globalAlpha = opacity;
        context.drawImage(image, x-1.5*this.radius, y-1.5*this.radius, 3*this.radius*length, 3*this.radius*length);
        context.globalAlpha = 1;

        return false;
    }
}

/**
 * Draw an arrow on the canvas. For debugging velocity purposes.
 * @param {CanvasRenderingContext2D} context - The context of the canvas.
 * @param {number} fromx - The x coordinate of the start of the arrow.
 * @param {number} fromy - The y coordinate of the start of the arrow.
 * @param {number} tox - The x coordinate of the end of the arrow.
 * @param {number} toy - The y coordinate of the end of the arrow.
 * @see https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
 */
function canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

/**
 * Start the game.
 */
function start() {
    canvas = document.getElementById("canvas")
    context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    for (let i = 0; i < NUMBER_OF_BALLS; i++) {
        balls.push(generateBall());
    }

    main()
}

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

    return new Ball(randomX, randomY, randomRadius, randomColor, randomVelocity, randomHealth);
}

/**
 * Generate random coordinates for the ball.
 * @param {number} radius The radius of the ball.
 * @returns Array of coordinates [x, y].
 */
function generateCoords(radius) {
    let randomX = Math.floor(Math.random() * canvas.width);
    let randomY = Math.floor(Math.random() * canvas.height / 2);

    if (randomX - radius < 0) {
        randomX += radius;
    } else if (randomX + radius > canvas.width) {
        randomX -= radius;
    }

    if (randomY - radius < 0) {
        randomY += radius;
    } else if (randomY + radius > canvas.height) {
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

    return [normalizedVelocity[0] * INITIAL_BALL_VELOCITY, normalizedVelocity[1] * INITIAL_BALL_VELOCITY];
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

/**
 * The main game loop.
 */
function main() {
    const paddleMultiplier = shiftPressed ? 2 : 1;
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move the paddle.
    if (leftPressed && paddlePosition > 50) {
        paddlePosition -= 10 * paddleMultiplier;
    } else if (rightPressed && paddlePosition < canvas.width - 50) {
        paddlePosition += 10 * paddleMultiplier;
    }

    // Draw the paddle.
    context.beginPath();
    context.fillStyle = "white";
    context.roundedRectangle(paddlePosition-50, canvas.height - PADDLE_HEIGHT - PADDLE_PADDING, 100, PADDLE_HEIGHT, 10);
    context.fill();
    context.closePath();

    // Draw the balls and check for collision.
    for (let i = 0; i < balls.length; i++) {
        if (balls[i]?.canBeDeleted) {
            balls.splice(i, 1);
            continue;
        } else if (balls[i]?.isDissapearing) {
            balls[i]?.draw();
            continue;
        }

        balls[i].x += balls[i].velocity[0];
        balls[i].y += balls[i].velocity[1];

        checkWallCollision(balls[i]);
        checkPaddleCollision(balls[i]);
        checkBallDeletion(balls[i]);

        // applyGravity(balls[i]);

        for (let j = 0; j < balls.length; j++) {
            if (i == j) {
                continue
            }

            if (checkBallCollision(balls[i], balls[j])) {
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

    document.getElementById("loss-menu").classList.add("hidden");
    document.getElementById("loss-menu").classList.remove("show-loss-menu");

    balls = [];
    for (let i = 0; i < NUMBER_OF_BALLS; i++) {
        balls.push(generateBall());
    }

    document.getElementById("canvas").classList.remove("lost");
    document.getElementById("main").classList.remove("lost-body");

    paddlePosition = screen.width / 2;
    restartDate = null;
    document.getElementById("main").style.opacity = 1;
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

// Move the paddle.
// document.addEventListener("mousemove", function(event) {
//     paddlePosition = event.clientX;
// });

document.addEventListener("keydown", onKeydown);
document.addEventListener("keyup", onKeyup);

function onKeydown(event) {
    if (event.key == "ArrowLeft") {
        leftPressed = true;
    } else if (event.key == "ArrowRight") {
        rightPressed = true;
    } else if (event.key == "Shift") {
        shiftPressed = true;
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
    }

    if (ball.y - ball.radius < 0) {
        ball.velocity[1] = -ball.velocity[1];
    }
}

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
}

/**
 * Check if the ball is colliding with the paddle. If so, change the ball's velocity.
 * @param {Ball} ball - The ball to check.
 */
function checkPaddleCollision(ball) {
    if (ball.y + ball.radius > canvas.height - PADDLE_HEIGHT - PADDLE_PADDING) {
        if (ball.x > paddlePosition - 50 && ball.x < paddlePosition + 50) {
            // TODO: Fix bug of too much velocity.
            // if (ball.y + ball.radius + ball.velocity[1] > canvas.height - paddleHeight - paddlePadding) {
            //     const tmp = Math.abs(ball.y + ball.velocity[1] - (screen.height - paddleHeight - paddlePadding));
            //     console.log((screen.height - paddleHeight - paddlePadding))
            //     console.log(ball.y +ball.velocity[1] + ball.radius)
            //     console.log(tmp)

            //     ball.y -= tmp;
            //     ball.velocity[1] = -ball.velocity[1];
            // } else {
            //     ball.velocity[1] = -ball.velocity[1];
            // }
            ball.velocity[1] = -ball.velocity[1];

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
    }

    if (checkLoss()) {
        onLose();
    }
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
}

/**
 * Check if the player lost. The player loses when there are no balls left.
 * @returns True if the player lost, false otherwise.
 */
function checkLoss() {
    return balls.length == 0;
}

/**
 * On loss of the game.
 * Adds transitions to the canvas, the main element and the loss element to make them fade in/out.
 * Adds the loss element to the DOM.
 * Adds a setInterval to spawn random triangles in the loss element.
 */
function onLose() {
    lost = true;

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
    } , 400);
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

window.onload = start;
