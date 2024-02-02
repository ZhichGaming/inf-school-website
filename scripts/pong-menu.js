let selectedMap = null;
let currentBGM = null;

function onLoad() {
    for (let pongMap of pongMaps) {
        const mapElement = 
        `<div id="${pongMap.id}" class="select-item" style="background-image: linear-gradient(to bottom, rgba(8, 8, 8, 0.586), rgba(242, 234, 240, 0)), url('./assets/maps/${pongMap.id}/background.png'); background-size: cover; background-position: center;">
            <div class="select-item-details">
                <p class="select-item-title">${pongMap.name}</p>
                <p class="select-item-artist">${pongMap.artist}</p>
            </div>
        </div>`
        
        document.getElementById('select-items').insertAdjacentHTML('beforeend', mapElement);
        const appendedChild = document.getElementById('select-items').lastElementChild;
    
        appendedChild.onclick = async () => {
            document.getElementById("history").classList.remove('hidden');

            selectedMap = pongMap;
    
            if (document.getElementsByClassName('select-item-selected').length > 0)
                document.getElementsByClassName('select-item-selected')[0].classList.remove('select-item-selected');
            
            appendedChild.classList.add('select-item-selected');

            document.getElementById("thumbnail-title").innerText = pongMap.name;
            document.getElementById("thumbnail-artist").innerText = pongMap.artist;

            document.getElementById("thumbnail").style.backgroundImage = `linear-gradient(to bottom, rgba(8, 8, 8, 0.586), rgba(242, 234, 240, 0)), url('./assets/maps/${pongMap.id}/background.png')`;
            document.getElementById("description").innerText = pongMap.description;

            // Remove previous difficulties.
            if (document.getElementById('select-item-map')) {
                document.getElementById('select-item-map').remove();
            }

            const difficulties = '<div id="select-item-map" class="select-item-map">' + pongMap.difficulties.map (difficulty => {
                return `<div class="select-item-map-details" id="${difficulty.name}">
                <p class="select-item-map-difficulty">${difficulty.name}</p>
                </div>`
            }).join('') + '</div>';

            document.getElementById(pongMap.id).insertAdjacentHTML('afterend', difficulties);

            const children = document.getElementById('select-item-map').children;
            
            for (let tableChild of children) {                
                tableChild.onclick = () => {
                    window.location.href = `./pong.html?map=${pongMap.id}&difficulty=${tableChild.id}`;
                }
            }

            const history = document.getElementById('history');
            const rawScores = JSON.parse(localStorage.getItem("scores"));
            const scores = rawScores == null ? [] : rawScores[pongMap.id];
            
            for (let score of scores.reverse()) {
                const rank = score.rank.toLowerCase();
                const rankImage = `assets/pong/${rank}`
                const date = new Date(score.date);

                const delta = Math.round((+new Date - date) / 1000);

                const minute = 60,
                    hour = minute * 60,
                    day = hour * 24,
                    week = day * 7;

                let fuzzy;

                if (delta < 30) {
                    fuzzy = 'now';
                } else if (delta < minute) {
                    fuzzy = delta + ' seconds ago';
                } else if (delta < 2 * minute) {
                    fuzzy = 'a minute ago'
                } else if (delta < hour) {
                    fuzzy = Math.floor(delta / minute) + ' minutes ago';
                } else if (Math.floor(delta / hour) == 1) {
                    fuzzy = '1 hour ago'
                } else if (delta < day) {
                    fuzzy = Math.floor(delta / hour) + ' hours ago';
                } else if (delta < day * 2) {
                    fuzzy = 'yesterday';
                }

                const historyItem = 
                `<div class="history-item">
                    <img class="history-item-rank" src="${rankImage}" alt="Ranking">
                    <div class="history-item-details">
                        <p class="history-item-difficulty">${score.difficulty}</p>
                        <div class="history-item-details-cards">
                            <p class="history-item-accuracy">${score.accuracy.toFixed(2)}%</p>
                            <p class="history-item-time">${score.time}s</p>
                            <p class="history-item-date">${fuzzy}</p>
                        </div>
                    </div>
                    <p class="history-item-score">${score.score}</p>
                </div>
                <hr class="history-item-separator">`

                history.insertAdjacentHTML('beforeend', historyItem);
            }

            if (scores === null || scores.length === 0) {
                if (document.getElementsByClassName('history-empty').length === 0)
                    history.insertAdjacentHTML('beforeend', '<p class="history-empty">No scores yet!</p>');
            }

            // Fade in/out music.
            if (currentBGM) {
                await adjustVolume(currentBGM, 0).then(() => {
                    currentBGM.pause();
                });
            }

            currentBGM = new Audio(`./assets/maps/${pongMap.id}/music.mp3`);
            currentBGM.play();
            currentBGM.loop=true;
            await adjustVolume(currentBGM, 0.5);

            selectedMap = pongMap.id;
        }
    }

    const inputHandler = (event) => {
        const input = event.target.value.toLowerCase();
        const items = document.getElementsByClassName('select-item');

        for (let item of items) {
            const title = item.getElementsByClassName('select-item-title')[0].innerText.toLowerCase();
            const artist = item.getElementsByClassName('select-item-artist')[0].innerText.toLowerCase();

            if (title.includes(input) || artist.includes(input)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    }

    document.getElementById("search").addEventListener('input', inputHandler);
}

async function adjustVolume(
    element,
    newVolume,
    {
        duration = 400,
        easing = swing,
        interval = 13,
    } = {},
) {
    const originalVolume = element.volume;
    const delta = newVolume - originalVolume;

    if (!delta || !duration || !easing || !interval) {
        element.volume = newVolume;
        return Promise.resolve();
    }

    const ticks = Math.floor(duration / interval);
    let tick = 1;

    return new Promise(resolve => {
        const timer = setInterval(() => {
            element.volume = originalVolume + (
                easing(tick / ticks) * delta
            );

            if (++tick === ticks + 1) {
                clearInterval(timer);
                resolve();
            }
        }, interval);
    });
}

function swing(p) {
    return 0.5 - Math.cos(p * Math.PI) / 2;
}

window.onload = onLoad;
