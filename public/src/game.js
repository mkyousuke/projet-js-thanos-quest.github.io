import * as ui from './ui.js';
import { startTimer, stopTimer, getPlayTimeInSeconds } from './timer.js';
import { saveScore } from './storage.js';
import { startVormir } from './levels/level1.js';
import { startTitan } from './levels/level2.js';
import { startWakanda } from './levels/level3.js';

let gameState = {
    currentPlayerName: "Thanos",
    currentLevel: 0,
    stonesLeft: 3,
    totalTime: 300, 
    cumulativeTime: 0,
    levelTimes: []
};

export function startGame(playerName) {
    gameState.currentPlayerName = playerName;
    ui.displayPlayerName(gameState.currentPlayerName);

    gameState.stonesLeft = 3;
    ui.updateRiddlesLeft(gameState.stonesLeft);

    gameState.currentLevel = 1;
    gameState.cumulativeTime = 0;
    gameState.levelTimes = [];
    loadLevel(gameState.currentLevel);
}


export function levelCompleted() {
    stopTimer();
    const timeForThisLevel = getPlayTimeInSeconds(); 
    
    gameState.levelTimes.push(timeForThisLevel);
    gameState.cumulativeTime += timeForThisLevel;

    gameState.stonesLeft--;
    ui.updateRiddlesLeft(gameState.stonesLeft);
    console.log(`Niveau ${gameState.currentLevel} terminé en ${timeForThisLevel}s. Temps cumulé: ${gameState.cumulativeTime}s. Pierres restantes: ${gameState.stonesLeft}`);

    if (gameState.stonesLeft <= 0) {
        gameWon();
    } else {
        gameState.currentLevel++;
        loadLevel(gameState.currentLevel);
    }
}

function loadLevel(level) {
    const bodyElement = document.body;
    const music = document.getElementById('background-music');

    startTimer(gameState.totalTime);

    switch (level) {
        case 1:
            bodyElement.className = 'theme-salle1-ame';
            music.src = './assets/sounds/vormir.mp3';
            music.volume = 0.9;
            if (music.src) music.play().catch(e => console.warn("Music play failed for Vormir:", e));
            startVormir();
            break;
        case 2:
            bodyElement.className = 'level2-theme';
            music.src = './assets/sounds/titan.mp3';
            music.volume = 0.3;
            if (music.src) music.play().catch(e => console.warn("Music play failed for Titan:", e));
            startTitan();
            break;
        case 3:
            bodyElement.className = 'theme-salle3-esprit';
            music.src = './assets/sounds/final.mp3';
            music.volume = 0.1;
            if (music.src) music.play().catch(e => console.warn("Music play failed for Wakanda (final.mp3):", e));
            startWakanda();
            break;
        default:
            console.log("Tous les niveaux sont terminés ou niveau inconnu.");
            if(gameState.stonesLeft > 0) {
                console.error("Erreur: Tentative de chargement d'un niveau invalide avant la fin du jeu.");
            }
            break;
    }
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.round(timeInSeconds % 60);
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
}

function gameWon() {
    const finalPlayTime = gameState.cumulativeTime;
    saveScore(gameState.currentPlayerName, finalPlayTime, gameState.levelTimes);

    ui.clearGameArea();
    ui.setRoomTitle("DESTINÉE ACCOMPLIE");
    document.getElementById('story-reminder-button').classList.add('hidden');

    const music = document.getElementById('background-music');
    if (music) {}
    document.body.className = '';

    const thanosVictory = { name: "Thanos", image: './assets/images/sprites/thanos2.png' };
    const systemMessage = { name: "Système", image: "" };

    ui.loadSceneBackground('./assets/images/final_1.jpg');
    ui.showDialogue(thanosVictory, "L'univers requiert une correction. Ma volonté est plus forte que la leur.");

    setTimeout(() => {
        ui.loadSceneBackground('./assets/images/final_2.jpg');
        ui.showDialogue(thanosVictory, "L'équilibre doit être restauré. Une nouvelle ère commence.");

        setTimeout(() => {
            ui.loadSceneBackground('./assets/images/final_3.jpg');
            ui.showDialogue(thanosVictory, "Je... suis... inéluctable.");

            setTimeout(() => {
                let finalMessageText = `FÉLICITATIONS, ${gameState.currentPlayerName} ! Vous avez accompli votre destinée !\n\n`;
                gameState.levelTimes.forEach((time, index) => {
                    finalMessageText += `Temps Salle ${index + 1}: ${formatTime(time)}\n`;
                });
                finalMessageText += `\nTemps total : ${formatTime(finalPlayTime)}.`;

                ui.showDialogue(systemMessage, finalMessageText);

                setTimeout(() => {
                    window.location.href = 'credits.html';
                }, 8000);
            }, 5000);
        }, 6000);
    }, 6000);
}

document.addEventListener('gameOverTimer', () => {
    stopTimer();
    ui.clearGameArea();
    const music = document.getElementById('background-music');
    if (music) music.pause();
    document.body.className = '';
    ui.setRoomTitle("DÉFAITE...");

    if (document.getElementById('dialogue-window').classList.contains('hidden')) {
         ui.showDialogue(
             { name: "Strange", image: './assets/images/sprites/strange.png' },
             `Le destin n'a pas tourné en votre faveur cette fois, ${gameState.currentPlayerName}. La quête est un échec.`
         );
    }
});