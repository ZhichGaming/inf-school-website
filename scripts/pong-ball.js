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
        this.x = x * RESOLUTION_RATIO;
        this.y = y * RESOLUTION_RATIO;
        this.radius = radius * RESOLUTION_RATIO; 
        this.color = color * RESOLUTION_RATIO; // Deprecated.
        this.velocity = [velocity[0] * RESOLUTION_RATIO, velocity[1] * RESOLUTION_RATIO];
        this.health = health;

        this.isDissapearing = false;
        this.canBeDeleted = false;
        this.dissapearanceAnimationProgress = null;

        this.lastBounce = Date.now();
    }

    /**
     * Draw the ball on the canvas.
     * @returns void
     */
    draw() {
        const globalAlpha = this.isDissapearing ? (1-this.dissapearanceAnimationProgress+0.01)/5 : 1;
        context.globalAlpha = globalAlpha;
        // context.shadowBlur = 2;
        // context.shadowColor = "white";

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

        if (Date.now() - this.lastBounce > GRAVITY_TIME_CONDITION) {
            applyGravity(this);
        } else if (Date.now() - this.lastBounce > GRAVITY_TIME_WARNING && (Math.floor(new Date().getTime()/500) % 2 == 0)) {
            // Draw warning.
            const warning = new Image();
            warning.src = "assets/pong/attention.png";
            context.drawImage(warning, this.x - this.radius/2, this.y - this.radius/2, this.radius, this.radius);
        } else {
            // Draw health.
            const healthLabel = new Image();
            healthLabel.src = "assets/pong/default-" + this.health + ".png";
            context.drawImage(healthLabel, this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2);
        }

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

        // Draw the velocity vector of the ball.
        if (paused) {
            context.strokeStyle = "white";
            context.lineWidth = 5;

            context.beginPath();
            canvas_arrow(context, this.x, this.y, (this.x+this.velocity[0]*20), (this.y+this.velocity[1]*20));
            context.stroke();
            context.closePath();

            context.strokeStyle = "black";
            context.lineWidth = 1;
        }
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
