import * as ui from '../ui.js';
import { levelCompleted } from '../game.js';
import { playSound } from '../utils/sound.js';

// --- Character Definitions ---
const thanos = { name: 'Thanos', image: './assets/images/sprites/thanos.png' };
const strange = { name: 'Doctor Strange', image: './assets/images/sprites/strange.png' };
const narrator = { name: "Rappel", image: "" };

// --- Level Constants ---
const LEVEL_ID = "Titan - La Pierre du Temps";
const BACKGROUND_IMAGE = './assets/images/titan_2d.jpg';
const MUSIC_SRC = './assets/sounds/titan.mp3';
const storyTextLvl2 = "Sur Titan, face à Thanos, Docteur Strange utilise la Pierre du Temps pour explorer 14 000 605 futurs. Il découvre qu'une seule voie mène à la victoire contre le Titan. Cette unique vision dictera son choix crucial...";

// --- Sound Constants ---
const NUMBER_APPEAR_SOUND = './assets/sounds/number_appear.mp3';
const PORTAL_HOVER_SOUND = './assets/sounds/portal.wav';
const WRONG_CODE_SOUND = './assets/sounds/wrong-code.wav';
const AGAMOTTO_CLICK_SOUND = './assets/sounds/agamotto.wav';
const VICTORY_SOUND = './assets/sounds/victory.mp3';

const CODE_LENGTH = 4;
const NUMBER_APPEAR_INTERVAL = 10000; 
const NUMBER_DISPLAY_DURATION = 2000; 

let correctCode = [];
let numberAppearanceIntervalId = null;
let currentCodeDigitIndex = 0;
let interactiveElementsForNumbers = [];
let gameAreaRef;

export function startTitan() {
    console.log('Lancement du niveau 2 - Titan');

    document.body.classList.add('level2-theme');

    ui.clearGameArea();
    gameAreaRef = document.getElementById('game-area');

    correctCode = [];
    currentCodeDigitIndex = 0;
    interactiveElementsForNumbers = [];
    if (numberAppearanceIntervalId) {
        clearInterval(numberAppearanceIntervalId);
        numberAppearanceIntervalId = null;
    }

    ui.setRoomTitle(LEVEL_ID);
    ui.loadSceneBackground(BACKGROUND_IMAGE);
    ui.showDialogue(thanos, "Tu ne pourras jamais contrôler son pouvoir. Tu n'es pas prêt.");

    const music = document.getElementById('background-music');
    music.src = MUSIC_SRC;
    music.volume = 0.3;
    music.play().catch(e => console.warn("Music play failed for Titan:", e));

    const storyButton = document.getElementById('story-reminder-button');
    if (storyButton) {
        storyButton.style.display = 'inline-block';
        storyButton.onclick = () => {
            const dialogueWindow = document.getElementById('dialogue-window');
            const isStoryVisible = !dialogueWindow.classList.contains('hidden') &&
                                   dialogueWindow.querySelector('#dialogue-text').textContent === storyTextLvl2;

            if (isStoryVisible) {
                ui.hideDialogue();
            } else {
                ui.showDialogue(narrator, storyTextLvl2);
            }
        };
    }

    generateCorrectCode();
    createInteractiveElements();
    startNumberAppearanceCycle();
}

function generateCorrectCode() {
    correctCode = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
        correctCode.push(Math.floor(Math.random() * 10));
    }
    console.log('Code secret de Titan (pour débogage):', correctCode.join(''));
}

function createInteractiveElements() {
    const strangeSprite = document.createElement('img');
    strangeSprite.src = strange.image;
    strangeSprite.alt = strange.name;
    strangeSprite.id = 'strange-sprite';
    strangeSprite.className = 'interactive-object';
    strangeSprite.style.position = 'absolute';
    strangeSprite.style.width = '150px';
    strangeSprite.style.height = 'auto';
    strangeSprite.style.bottom = '120px';
    strangeSprite.style.right = '120px';
    strangeSprite.style.cursor = 'pointer';
    strangeSprite.addEventListener('click', () => {
        ui.showDialogue(strange, "J'ai vu 14 000 605 futurs. Un seul nous mène à la victoire. Et pour emprunter cette voie, il faudra un acte de foi... que celui qui voit le temps accepte de voir son propre pouvoir remis entre d'autres mains, pour un instant");
    });
    gameAreaRef.appendChild(strangeSprite);

    const eyeOfAgamotto = document.createElement('img');
    eyeOfAgamotto.src = './assets/images/objects/agamotto.png';
    eyeOfAgamotto.alt = "Oeil d'Agamotto";
    eyeOfAgamotto.id = 'agamotto-eye';
    eyeOfAgamotto.className = 'interactive-object';
    eyeOfAgamotto.style.position = 'absolute';
    eyeOfAgamotto.style.width = '93px';
    eyeOfAgamotto.style.height = 'auto';
    eyeOfAgamotto.style.top = '280px';
    eyeOfAgamotto.style.left = '560px';
    eyeOfAgamotto.style.cursor = 'pointer';
    eyeOfAgamotto.addEventListener('click', () => {
        playSound(AGAMOTTO_CLICK_SOUND, 0.6);
        promptForCode();
    });
    gameAreaRef.appendChild(eyeOfAgamotto);

    const elementConfigs = [
        { type: 'portal', src: './assets/images/objects/portal.png', top: '300px', left: '180px', size: '100px' },
        { type: 'portal', src: './assets/images/objects/portal.png', top: '400px', left: '777px', size: '100px' },
        { type: 'portal', src: './assets/images/objects/portal.png', top: '500px', left: '240px', size: '110px' },
        { type: 'portal', src: './assets/images/objects/portal.png', top: '230px', left: '930px', size: '110px' }
    ];

    elementConfigs.forEach((config, index) => {
        const el = document.createElement('img');
        el.src = config.src;
        el.alt = `${config.type} ${index + 1}`;
        el.id = `${config.type}-${index}`;
        el.className = 'interactive-object level2-number-host';
        el.style.position = 'absolute';
        el.style.width = config.size;
        el.style.height = 'auto';
        el.style.objectFit = 'contain';
        el.style.top = config.top;
        el.style.left = config.left;
        
        el.addEventListener('mouseover', () => {
            playSound(PORTAL_HOVER_SOUND, 0.4);
        });

        gameAreaRef.appendChild(el);
        interactiveElementsForNumbers.push(el);
    });
}

function startNumberAppearanceCycle() {
    if (numberAppearanceIntervalId) clearInterval(numberAppearanceIntervalId);
    currentCodeDigitIndex = 0;
    numberAppearanceIntervalId = setInterval(() => {
        if (currentCodeDigitIndex < CODE_LENGTH) {
            displayDigitOnElement(correctCode[currentCodeDigitIndex]);
            currentCodeDigitIndex++;
        } else {
            currentCodeDigitIndex = 0;
            displayDigitOnElement(correctCode[currentCodeDigitIndex]);
            currentCodeDigitIndex++;
        }
    }, NUMBER_APPEAR_INTERVAL);
}

function displayDigitOnElement(digit) {
    const hostElement = interactiveElementsForNumbers[Math.floor(Math.random() * interactiveElementsForNumbers.length)];
    const numberDisplay = document.createElement('div');
    numberDisplay.textContent = digit;
    numberDisplay.className = 'ephemeral-number-display';
    numberDisplay.style.top = `${hostElement.offsetTop + (hostElement.offsetHeight / 2) - 25}px`;
    numberDisplay.style.left = `${hostElement.offsetLeft + (hostElement.offsetWidth / 2) - 15}px`;
    gameAreaRef.appendChild(numberDisplay);
    playSound(NUMBER_APPEAR_SOUND, 0.1);
    setTimeout(() => {
        if (numberDisplay.parentNode === gameAreaRef) {
            gameAreaRef.removeChild(numberDisplay);
        }
    }, NUMBER_DISPLAY_DURATION);
}

function promptForCode() {
    if (numberAppearanceIntervalId) {
        clearInterval(numberAppearanceIntervalId);
        numberAppearanceIntervalId = null;
    }
    setTimeout(() => {
        const playerInput = prompt("Strange vous tend l'Œil d'Agamotto.\nEntrez le code des réalités (4 chiffres, ex: 1234) :");
        if (playerInput === null) {
            ui.showDialogue(strange, "Le temps joue contre nous. Ne tardez pas.");
            startNumberAppearanceCycle();
            return;
        }
        if (playerInput.replace(/\s/g, '') === correctCode.join('')) {
            handleVictory();
        } else {
            handleDefeat(playerInput);
        }
    }, 100);
}

function handleVictory() {
    console.log('Niveau 2 Victoire !');
    playSound(VICTORY_SOUND);
    if (numberAppearanceIntervalId) clearInterval(numberAppearanceIntervalId);
    document.getElementById('background-music').pause();
    ui.clearGameArea();

    ui.loadSceneBackground('./assets/images/thanos-bg.jpg');
    ui.showDialogue(thanos, "Le temps lui-même se courbe devant la destinée. Docteur Strange, en me cédant cette Pierre, tu as enfin saisi la logique implacable de mon dessein. L'équilibre est plus proche, et ta sagesse, aussi forcée soit-elle, y aura contribué...");

    setTimeout(() => {
        levelCompleted();
        document.body.classList.remove('level2-theme');
    }, 9500);
}

function handleDefeat(wrongCode) {
    console.log(`Niveau 2 Défaite. Code entré : ${wrongCode}. Attendu : ${correctCode.join('')}`);
    playSound(WRONG_CODE_SOUND, 0.7);
    ui.showDialogue(strange, `Le code "${wrongCode}"... Ce n'était pas cette réalité-là. Observez à nouveau.`);
    startNumberAppearanceCycle();
}