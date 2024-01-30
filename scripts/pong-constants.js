/**
 * Constants.
 */

/**
 * Ratio of the resolution of the canvas to its size.
 * @type {number}
 */
const RESOLUTION_RATIO = 2;

/**
 * The gravity constant.
 * @type {number}
 */
const GRAVITY = 0.2;

/**
 * The height of the paddle in pixels.
 * @type {number}
 */
const PADDLE_HEIGHT = 20 * RESOLUTION_RATIO;

/**
 * The distance of the paddle from the ground in pixels.
 * @type {number}
 */
const PADDLE_PADDING = 10 * RESOLUTION_RATIO;

/**
 * The width of the paddle in pixels.
 * @type {number}
 */
const PADDLE_WIDTH = 100 * RESOLUTION_RATIO;

/**
 * The number of balls in the game.
 * @type {number}
 */
const NUMBER_OF_BALLS = 3;

/**
 * The time required to hold to restart the game.
 * @type {number}
 */
const RESTART_TIME_REQUIRED = 0.3;

/**
 * The initial magnitude velocity of the ball before transfer of energy.
 * @type {number}
 */
const INITIAL_BALL_VELOCITY = 5;

/**
 * Dictionary of colors for the ball depending on health.
 * @type {Object}
 */
const HEALTH_COLORS = {
    1: "#BF2C34",
    2: "#F07857",
    3: "#F5C26B",
    4: "#4FB06D",
    5: "#53BDAS",
    6: "#43A5BE",
    7: "#F07857",
    8: "#5C62D6",
    9: "#253342"
}

/**
 * Object containing the sound effects.
 * @type {Object}
 * @property {Audio} hit - The sound effect for a normal hit.
 * @property {Audio} hit-break - The sound effect for a hit that breaks the circle.
 * @property {Audio} naiwa - nai waaaaaa.
 * @property {Audio} break-scifi - The sound effect for a scifi break.
 * @property {Audio} break-shatter - The sound effect for a shatter break.
 * @property {Audio} break-slide - The sound effect for a slide break.
 */
const SFX = {
    "hit": new Audio("./assets/pong/sfx/normal-hitnormal.wav"),
    "hit-break": new Audio("./assets/pong/sfx/normal-hitfinish.wav"),
    "hit-paddle": new Audio("./assets/pong/sfx/normal-hitclap.wav"),
    "naiwa": new Audio("./assets/pong/sfx/naiwa.wav"),
    "break-scifi": new Audio("./assets/pong/sfx/combobreak-scifi.wav"),
    "break-shatter": new Audio("./assets/pong/sfx/combobreak-shatter.wav"),
    "break-slide": new Audio("./assets/pong/sfx/combobreak-slide.wav")
}

/**
 * Delay between keypresses to activate the expansion ability.
 * @type {number}
 */
const EXPANSION_DELTA = 500;

/**
 * Required score to get each rank.
 * @type {Object}
 */
const RANK_REQUIREMENTS = {
    0: "ranking-D@2x.png",
    0.6: "ranking-C@2x.png",
    0.8: "ranking-B@2x.png",
    0.9: "ranking-A@2x.png",
    0.95: "ranking-S@2x.png",
    1: "ranking-SH@2x.png"
}
