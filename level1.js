import * as ui from './ui.js';
import { levelCompleted } from './game.js';
import { playSound } from './sound.js';

const gamora = { name: "Gamora", image: "./assets/images/sprites/gamora.png" };
const thanos = { name: "Thanos", image: "./assets/images/sprites/thanos.png" };
const narrator = { name: "Rappel", image: "" };

const correctOrder = ['souvenir_dague', 'souvenir_poupee', 'gamora-sprite'];
let sacrificedItems = [];
let isRiddleSolved = false;

export function startVormir() {
    console.log("Lancement du niveau 1 : Vormir");
    ui.clearGameArea();
    sacrificedItems = [];
    isRiddleSolved = false;

    ui.setRoomTitle("Vormir : La Pierre de l'Âme");
    ui.loadSceneBackground('./assets/images/vormir_2d.jpg');
    ui.showDialogue(thanos, "Un sacrifice... pour un sacrifice.");

    const music = document.getElementById('background-music');
    music.src = './assets/sounds/vormir.mp3';
    music.volume = 0.5;
    music.play();

    createRiddleElements();
    addEventListeners();

    const storyButton = document.getElementById('story-reminder-button');
    if (storyButton) {
        storyButton.style.display = 'inline-block';
        storyButton.onclick = () => {
            const dialogueWindow = document.getElementById('dialogue-window');
            const isDialogueVisible = !dialogueWindow.classList.contains('hidden');

            const storyTextLvl1 = "Sur la planète désolée de Vormir, Thanos, accompagné de Gamora, cherche à obtenir la Pierre de l'Âme. Il apprend le terrible prix à payer : \"Une âme pour une âme\". Pour s'emparer de la Pierre, Thanos doit comprendre et accomplir le sacrifice ultime : il doit sacrifier ce qu'il aime le plus...";

            if (isDialogueVisible && dialogueWindow.querySelector('#dialogue-text').textContent === storyTextLvl1) {
                ui.hideDialogue();
            } else {
                ui.showDialogue(narrator, storyTextLvl1);
            }
        };
    }
}

function createRiddleElements() {
    const gameArea = document.getElementById('game-area');

    const gamoraSprite = document.createElement('img');
    gamoraSprite.id = 'gamora-sprite';
    gamoraSprite.src = './assets/images/sprites/gamora.png';
    gamoraSprite.className = 'interactive-object';
    gamoraSprite.draggable = true;
    gameArea.appendChild(gamoraSprite);

    const sacrificeZone = document.createElement('div');
    sacrificeZone.id = 'sacrifice-zone';
    gameArea.appendChild(sacrificeZone);

    const memory1 = document.createElement('img');
    memory1.src = './assets/images/objects/poupee.png';
    memory1.id = 'souvenir_poupee';
    memory1.className = 'memory-object interactive-object';
    memory1.draggable = true;
    gameArea.appendChild(memory1);

    const memory2 = document.createElement('img');
    memory2.src = './assets/images/objects/dague.png';
    memory2.id = 'souvenir_dague';
    memory2.className = 'memory-object interactive-object';
    memory2.draggable = true;
    gameArea.appendChild(memory2);
}

function addEventListeners() {
    const memories = document.querySelectorAll('.memory-object');
    const sacrificeZone = document.getElementById('sacrifice-zone');
    const gamoraSprite = document.getElementById('gamora-sprite');

    memories.forEach(memory => {
        addDragEvents(memory);
    });

    addDragEvents(gamoraSprite);

    gamoraSprite.addEventListener('click', () => {
        if (!isRiddleSolved) {
            ui.showDialogue(gamora, "Toute ma vie, j'ai rêvé d'un jour, d'un moment, où tu aurais ce que tu mérites. Et j'ai toujours été tellement déçue. Mais maintenant, tu tues et tu tortures et tu appelles ça de la pitié. L'univers t'a jugé. Tu lui as demandé un prix et il t'a dit non. Tu as échoué. Et tu veux savoir pourquoi ? Parce que tu n'aimes rien. Personne.");
        }
    });

    sacrificeZone.addEventListener('dragover', (event) => {
        if (isRiddleSolved) return;
        event.preventDefault();
        sacrificeZone.classList.add('drag-over');
    });
    sacrificeZone.addEventListener('dragleave', () => {
        sacrificeZone.classList.remove('drag-over');
    });
    sacrificeZone.addEventListener('drop', (event) => {
        if (isRiddleSolved) return;
        event.preventDefault();
        sacrificeZone.classList.remove('drag-over');
        const droppedItemId = event.dataTransfer.getData('text/plain');
        const droppedItem = document.getElementById(droppedItemId);
        if (droppedItem) {
            handleSacrifice(droppedItem);
        }
    });
}

function addDragEvents(element) {
    element.addEventListener('dragstart', (event) => {
        if (isRiddleSolved) return;
        playSound('./assets/sounds/pickup.wav', 0.1);
        event.dataTransfer.setData('text/plain', event.target.id);
        setTimeout(() => { element.classList.add('hidden'); }, 0);
    });
    element.addEventListener('dragend', (event) => {
        element.classList.remove('hidden');
    });
}

function handleSacrifice(item) {
    playSound('./assets/sounds/drop.wav', 0.1);
    item.style.display = 'none';
    sacrificedItems.push(item.id);
    ui.showDialogue(thanos, `Un sacrifice a été fait...`);
    checkVictory();
}

function checkVictory() {
    if (sacrificedItems.length === correctOrder.length) {
        document.getElementById('background-music').pause();
        let isOrderCorrect = true;
        for (let i = 0; i < correctOrder.length; i++) {
            if (sacrificedItems[i] !== correctOrder[i]) {
                isOrderCorrect = false;
                break;
            }
        }

        if (isOrderCorrect) {
            isRiddleSolved = true;
            playSound('./assets/sounds/victory.mp3');
            setTimeout(() => {
                const music = document.getElementById('background-music');
                if (music) {
                    music.play();
                }
            }, 2500);
            ui.loadSceneBackground('./assets/images/gamora_dead.jpeg');
            ui.showDialogue(thanos, "Je suis navré, mon enfant. (Thanos accomplit le sacrifice et obtient la pierre)");
            setTimeout(levelCompleted, 9000);
        } else {
            ui.showDialogue(gamora, "Ce n'est pas l'ordre correct du sacrifice !");
            setTimeout(startVormir, 3000);
        }
    }
}