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
 * The time required for gravity to be applied to the ball.
 * @type {number}
 */
const GRAVITY_TIME_CONDITION = 5000;

/**
 * The time required before the gravity warning is shown.
 * @type {number}
 */
const GRAVITY_TIME_WARNING = 3000;

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
 * The maximum health of the player.
 * @type {number}
 */
const MAX_HEALTH = 20;

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
 * @property {Audio} restart - The sound effect for a restart.
 * @property {Audio} lose - The sound effect played when losing.
 * @property {Audio} overfail - The sound effect for a fail.
 * @property {Audio} overpass - The sound effect for a pass.
 * @property {Audio} score-tick - The sound effect for a score tick. Pitch should be adjusted.
 * @property {Audio} select-difficulty - The sound effect for selecting a difficulty.
 * @property {Audio} select-expand - The sound effect for expanding a map.
 * @property {Audio} hover - The sound effect for hovering.
 */
const SFX = {
    "hit": new Audio("./assets/pong/sfx/normal-hitnormal.wav"),
    "hit-break": new Audio("./assets/pong/sfx/normal-hitfinish.wav"),
    "hit-paddle": new Audio("./assets/pong/sfx/normal-hitclap.wav"),
    "naiwa": new Audio("./assets/pong/sfx/naiwa.wav"),
    "break-scifi": new Audio("./assets/pong/sfx/combobreak-scifi.wav"),
    "break-shatter": new Audio("./assets/pong/sfx/combobreak-shatter.wav"),
    "break-slide": new Audio("./assets/pong/sfx/combobreak-slide.wav"),
    "restart": new Audio("./assets/pong/sfx/restart.wav"),
    "fail": new Audio("./assets/pong/sfx/failsound.wav"),
    "gameover-fail": new Audio("./assets/pong/sfx/rank-impact-fail.wav"),
    "gameover-pass": new Audio("./assets/pong/sfx/rank-impact-pass.wav"),
    "score-tick": new Audio("./assets/pong/sfx/score-tick.wav"),
    "select-difficulty": new Audio("./assets/pong/sfx/select-difficulty.mp3"),
    "select-expand": new Audio("./assets/pong/sfx/select-expand.mp3"),
    "hover": new Audio("./assets/pong/sfx/hover.mp3")
}

/**
 * Delay between keypresses to activate the expansion ability.
 * @type {number}
 */
const EXPANSION_DELTA = 500;

/**
 * Cooldown of the expansion ability in ms.
 * @type {number}
 */
const EXPANSION_COOLDOWN = 1000;

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
