const gameArea = document.getElementById('game-area');
const dialogueWindow = document.getElementById('dialogue-window');
const dialogueText = document.getElementById('dialogue-text');
const dialogueCharacterImage = document.getElementById('dialogue-character-image');
const timerDisplay = document.getElementById('timer');
const riddlesLeftDisplay = document.getElementById('riddles-left');
const roomTitleElement = document.getElementById('room-title');
const playerNameDisplayElement = document.getElementById('player-name-display');

export function setRoomTitle(title) {
    if (roomTitleElement) {
        roomTitleElement.textContent = title;
    }
}

export function showDialogue(character, text) {
    if (dialogueCharacterImage && dialogueText && dialogueWindow) {
        dialogueCharacterImage.src = character.image;
        dialogueCharacterImage.alt = character.name;
        dialogueText.textContent = text;
        dialogueWindow.classList.remove('hidden');

        if (!character.image || character.image === "") {
            dialogueWindow.classList.add('no-portrait');
        } else {
            dialogueWindow.classList.remove('no-portrait');
        }
    }
}

export function hideDialogue() {
    if (dialogueWindow) {
        dialogueWindow.classList.add('hidden');
    }
}

export function updateTimerDisplay(formattedTime) {
    if (timerDisplay) {
        timerDisplay.textContent = `Temps restant : ${formattedTime}`;
    }
}

export function updateRiddlesLeft(count) {
    if (riddlesLeftDisplay) {
        riddlesLeftDisplay.textContent = `Pierres restantes : ${count}`;
    }
}

export function displayPlayerName(name) {
    if (playerNameDisplayElement) {
        playerNameDisplayElement.textContent = name;
    }
}

export function loadSceneBackground(imageUrl) {
    if (gameArea) {
        gameArea.style.backgroundImage = `url(${imageUrl})`;
    }
}

export function clearGameArea() {
    if (gameArea) {
        gameArea.innerHTML = '';
    }
}