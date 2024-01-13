"use strict"
let canvas = ""
let context = ""
let lastUpdate = Date.now();
let paddlePosition = screen.width / 2;

let leftPressed = false;
let rightPressed = false;

const GRAVITY = 0.2;
const paddleHeight = 20;
const paddlePadding = 10;

function dot(a, b) {
    return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

/**
 * Ball is a class that represents a ball in the game of pong.
 * 
 * @param {number} x - The x coordinate of the ball.
 * @param {number} y - The y coordinate of the ball.
 * @param {number} radius - The radius of the ball.
 * @param {string} color - The color of the ball.
 * @param {number} velocity - The velocity of the ball. Vector (dx, dy).
 */
class Ball {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius; 
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.x, this.y, this.radius, 0, (Math.PI) * 2);
        context.fill();

        // Draw the velocity vector of the ball for debugging purposes.
        // context.beginPath();
        // canvas_arrow(context, this.x, this.y, (this.x+this.velocity[0]*20), (this.y+this.velocity[1]*20));
        // context.stroke();
        // context.closePath();
    }
}

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

let balls = [];

function start() {
    canvas = document.getElementById("canvas")
    context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    balls.push(new Ball(100, 100, 50, "red", [2, 2]));
    balls.push(new Ball(200, 200, 30, "blue", [5, 3]));
    balls.push(new Ball(250, 300, 20, "green", [3, 5]));
    balls.push(new Ball(500, 600, 50, "yellow", [-2, -2]));
    balls.push(new Ball(400, 400, 30, "orange", [-5, -3]));
    balls.push(new Ball(350, 300, 20, "purple", [-3, -5]));
    balls.push(new Ball(750, 600, 20, "lime", [0, 20]));

    main()
}

function main() {
    const now = Date.now();
    const deltaTime = (now - lastUpdate) / 1000;
    // lastUpdate = now;
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move the paddle.
    if (leftPressed && paddlePosition > 50) {
        paddlePosition -= 10;
    } else if (rightPressed && paddlePosition < canvas.width - 50) {
        paddlePosition += 10;
    }

    // Draw the paddle.
    context.beginPath();
    context.fillStyle = "white";
    // context.fillRect(paddlePosition-50, canvas.height - paddleHeight, 100, paddleHeight);
    // rounded rectangle
    context.roundedRectangle(paddlePosition-50, canvas.height - paddleHeight - paddlePadding, 100, paddleHeight, 10);

    context.fill();
    
    context.closePath();

    for (let i = 0; i < balls.length; i++) {
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

    requestAnimationFrame(main);
}

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
    if (event.keyCode == 37) {
        leftPressed = true;
    } else if (event.keyCode == 39) {
        rightPressed = true;
    }
}

function onKeyup(event) {
    if (event.keyCode == 37) {
        leftPressed = false;
    } else if (event.keyCode == 39) {
        rightPressed = false;
    }
}

// Check if two balls are colliding.
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

// Check if a ball is colliding with a wall.
function checkWallCollision(ball) {
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.velocity[0] = -ball.velocity[0];
    }

    if (ball.y - ball.radius < 0) {
        ball.velocity[1] = -ball.velocity[1];
    }
}

// Set the new velocities of the balls that collide.
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

function checkPaddleCollision(ball) {
    if (ball.y + ball.radius > canvas.height - paddleHeight - paddlePadding) {
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
        }
    }
}

function checkBallDeletion(ball) {
    if (ball.y - ball.radius > canvas.height) {
        balls.splice(balls.indexOf(ball), 1);
    }

    if (checkLoss()) {
        onLose();
    }
}

function checkLoss() {
    return balls.length == 0;
}

function onLose() {
    document.getElementById("canvas").classList.add("lost");
    document.getElementById("main").classList.add("lost-body");

    setInterval(function() {
        if (!document.hasFocus())
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
