// Canvas and context.
let canvas;
let context;

// General game variables.
let balls = [];
let paddlePosition = screen.width / 2 * RESOLUTION_RATIO;
let startTime = Date.now();
let score = 0;
let maxScore = 0;
let maxHealth = MAX_HEALTH;
let health = maxHealth;

// Game state and loss animations.
let lost = false;
let lostAnimationInterval = null;

// Key states.
let leftPressed = false;
let rightPressed = false;
let shiftPressed = false;

// Last time the shift key was pressed.
let lastKeypressTime = Date.now();
let isExpanding = false;
let expansionState = 0;
let lastExpansionDate = Date.now();

// Date of start of press of restart key.
let restartDate = null;

// Map information.
let selectedMap = null;
let difficulty = null;
let numberOfBalls = NUMBER_OF_BALLS;
let initialBallVelocity = INITIAL_BALL_VELOCITY;
let audio = null;
