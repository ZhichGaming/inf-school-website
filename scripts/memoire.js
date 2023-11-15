"use strict"

const images = [
    "chat-1.png",
    "chat-2.png",
    "cheval-1.png",
    "cheval-2.png",
    // "chien-1.png",
    // "chien-2.png",
    "lapin-1.png",
    "lapin-2.png",
    "poule-1.png",
    "poule-2.png",
    "cochon-1.png",
    "cochon-2.png"
]

let shuffled = getShuffled()
let correct = []
let currentShown = -1

let score = 0
let timer = 0

setInterval(function() { 
    if (correct.length !== images.length) {
        timer += 1
        document.getElementById("timer").innerHTML = timer
    }
}, 1000);

function clickImage(id) {
    if (!isClickable(id)) {
        return
    }
    
    setTimeout(() => {
        document.getElementById(id).src = "./images/" + shuffled[parseInt(id) - 1]
    }, 500)

    document.getElementById(id).classList.add("rotate")
    
    document.getElementById(id).addEventListener("animationend", () => {
        document.getElementById(id).classList.remove("rotate")
    })

    if (currentShown === -1) {
        currentShown = parseInt(id)
        document.getElementById(id).classList.remove("clickable")
    } else {
        validateAnswer(shuffled[currentShown-1], shuffled[parseInt(id)-1])
        document.getElementById(currentShown.toString()).classList.add("clickable")
        currentShown = -1
    }
}

function validateAnswer(id1, id2) {
    const q1 = document.getElementById(shuffled.indexOf(id1) + 1)
    const q2 = document.getElementById(shuffled.indexOf(id2) + 1)

    q1.classList.remove("clickable")
    q2.classList.remove("clickable")

    if ((id1+"").split("-")[0] === (id2+"").split("-")[0]) {
        correct.push(id1)
        correct.push(id2)

        if (correct.length === images.length) {
            confetti({
                particleCount: 150,
                spread: 60
            });

            score += 1
            document.getElementById("score").innerHTML = score
        }
    } else {
        setTimeout(() => {
            setTimeout(() => {
                q1.src = "./images/interrogation.png"
                q2.src = "./images/interrogation.png"
            }, 500)

            document.getElementById(shuffled.indexOf(id1) + 1).classList.add("rotate")
            document.getElementById(shuffled.indexOf(id2) + 1).classList.add("rotate")

            document.getElementById(shuffled.indexOf(id1) + 1).addEventListener("animationend", () => {
                document.getElementById(shuffled.indexOf(id1) + 1).classList.remove("rotate")
            })
            document.getElementById(shuffled.indexOf(id2) + 1).addEventListener("animationend", () => {
                document.getElementById(shuffled.indexOf(id2) + 1).classList.remove("rotate")
            })

            document.getElementById(shuffled.indexOf(id1) + 1).classList.add("clickable")
            document.getElementById(shuffled.indexOf(id2) + 1).classList.add("clickable")
        }, 1500)
    }
}

function isClickable(id) {
    if (correct.includes(shuffled[parseInt(id) - 1])) {
        return false
    }

    if (currentShown === parseInt(id)) {
        return false
    }

    return true
}

function restart() {
    for (let i = 1; i <= images.length; i++) {
        document.getElementById(i.toString()).src = "./images/interrogation.png"
    }

    shuffled = getShuffled()
    correct = []
    currentShown = -1

    document.getElementById("timer").innerHTML = "0"
    timer = 0
}

function getShuffled() {
    return images.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)
}
