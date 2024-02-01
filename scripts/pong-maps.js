class PongMap {
    constructor(name, id, difficulties, artist="Unknown", description="") {
        this.name = name;
        this.id = id;
        this.difficulties = difficulties;
        this.artist = artist;
        this.description = description;
    }
}

class PongMapConfiguration {
    constructor(name, number_of_balls, initial_ball_velocity) {
        this.name = name;
        this.number_of_balls = number_of_balls;
        this.initial_ball_velocity = initial_ball_velocity;
    }
}

// document.getElementById("").classList -> ["pong-map", "pong-map--selected"]

/**
 * Slyleaf: Normal map with balanced number of balls and speed.
 */
const slyleaf = new PongMap('Reaction feat. Slyleaf', 'reaction-slyleaf', [
    new PongMapConfiguration('Easy', 1, 3),
    new PongMapConfiguration('Normal', 2, 5),
    new PongMapConfiguration('Hard', 5, 7),
    new PongMapConfiguration('Insane', 8, 9)
], 'Slyleaf', 'A normal map with balanced number of balls and speed.');

/**
 * Babyhalo: Slow map with a lot of balls.
 */
const babyhalo = new PongMap('Babyhalo', 'babyhalo', [
    new PongMapConfiguration('Easy', 1, 3),
    new PongMapConfiguration('Normal', 2, 4),
    new PongMapConfiguration('Hard', 10, 4),
    new PongMapConfiguration('Insane', 15, 5)
], 'sana', 'A slow map with a lot of balls.');

/**
 * Little objects but very fast.
 */
const onigiri = new PongMap('Onigiri', 'onigiri', [
    new PongMapConfiguration('Easy', 1, 6),
    new PongMapConfiguration('Normal', 2, 10),
    new PongMapConfiguration('Hard', 2, 15),
    new PongMapConfiguration('Insane', 3, 20)
], "OISHII", "Small amount of objects but very fast.");

const pongMaps = [slyleaf, babyhalo, onigiri];
