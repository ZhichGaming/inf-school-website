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
                return `<div class="select-item-map-details" id="${difficulty.name}" onclick="selectDifficulty('${difficulty.name}');">
                <p class="select-item-map-difficulty">${difficulty.name}</p>
                </div>`
            }).join('') + '</div>';

            document.getElementById(pongMap.id).insertAdjacentHTML('afterend', difficulties);

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
