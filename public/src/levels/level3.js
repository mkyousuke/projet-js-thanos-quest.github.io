import * as ui from '../ui.js';
import { levelCompleted } from '../game.js';
import { playSound } from '../utils/sound.js';

const thanos = { name: 'Thanos', image: './assets/images/sprites/thanos.png' };
const wanda = { name: 'Wanda Maximoff', image: './assets/images/sprites/wanda.png' };
const vision = { name: 'Vision', image: './assets/images/sprites/vision.png' };
const narrator = { name: "Rappel", image: "" };

const LEVEL_ID = "Wakanda - La Pierre de l'Esprit";
const BACKGROUND_IMAGE_PHASE1 = './assets/images/wakanda_2d.jpg';
const BACKGROUND_IMAGE_PHASE2 = './assets/images/wakanda_2d_2.jpg';
const MUSIC_SRC = './assets/sounds/wakanda_theme.mp3';
const STORY_TEXT_LVL3 = "L'assaut final sur le Wakanda est lancé. Pour récupérer la Pierre de l'Esprit, Thanos doit d'abord affronter la Sorcière Rouge qui protège Vision. Une fois sa défense brisée, il devra rapidement extraire la pierre de Vision lui-même.";

const SOUND_ANCHOR_ACTIVATE = './assets/sounds/anchor_activate.wav';
const SOUND_ANCHOR_FAIL = './assets/sounds/anchor_fail.wav';
const SOUND_SHIELD_BREAK = './assets/sounds/shield_break.wav';
const SOUND_WANDA_DEFEAT = './assets/sounds/wanda_scream.wav';
const SOUND_TIME_STONE_FREEZE = './assets/sounds/time_stone_effect.wav';
const SOUND_PUZZLE_PICKUP = './assets/sounds/puzzle_pickup.wav';
const SOUND_PUZZLE_DROP_OK = './assets/sounds/puzzle_drop_ok.wav';
const SOUND_PUZZLE_DROP_WRONG = './assets/sounds/puzzle_drop_wrong.wav';
const SOUND_PUZZLE_COMPLETE = './assets/sounds/puzzle_complete.wav';
const SOUND_VISION_OVERLOAD = './assets/sounds/vision_overload.wav';
const VICTORY_SOUND = './assets/sounds/final_victory_snap.mp3';
const SOUND_BTN_CLICK = './assets/sounds/button_click.wav';

const POSSIBLE_WORDS_PHASE1 = [
    "ESPRIT", "MAGIES", "SORTS", "CHAOS", "FATRAS",
    "MUTANT", "RÊVES", "DOULEUR", "COLÈRE", "MYTHE", "ALTERE"
];
let WORD_TO_FORM = "ESPRIT";
let LETTERS_AVAILABLE = WORD_TO_FORM.split('');

const MAX_ERRORS_PHASE1 = 3;
const ANCHOR_POINT_SIZE = 60;

const PUZZLE_GRID_SIZE = 3;
const PUZZLE_IMAGE_SRC = './assets/images/objects/esprit.jpg';
const MINI_TIMER_DURATION = 60;
const PUZZLE_PIECE_DISPLAY_SIZE = 60;
const PUZZLE_AREA_GAP = 3;

let gameAreaRef;
let currentPhase = 1;
let anchorPoints = [];
let clickedLettersSequence = [];
let errorsPhase1 = 0;

let puzzlePiecesDOMElements = [];
let puzzleSlotsDOMElements = [];
let draggedPiece = null;
let puzzleHistory = [];
let puzzleRedoStack = [];
let initialPiecesLayout = null;

let miniTimerId = null;
let timeLeftMiniTimer = MINI_TIMER_DURATION;
let revealedPuzzleImage = null;
let puzzleControlsContainer = null;


export function startWakanda() {
    console.log("Lancement du Niveau 3 : Wakanda");
    ui.clearGameArea();
    gameAreaRef = document.getElementById('game-area');
    currentPhase = 1;
    anchorPoints = [];
    clickedLettersSequence = [];
    errorsPhase1 = 0;
    
    puzzlePiecesDOMElements = [];
    puzzleSlotsDOMElements = [];
    draggedPiece = null;
    puzzleHistory = [];
    puzzleRedoStack = [];
    initialPiecesLayout = null;


    if (miniTimerId) clearInterval(miniTimerId);
    miniTimerId = null;
    timeLeftMiniTimer = MINI_TIMER_DURATION;

    if (revealedPuzzleImage && revealedPuzzleImage.parentNode) {
        revealedPuzzleImage.remove();
        revealedPuzzleImage = null;
    }
    if (puzzleControlsContainer && puzzleControlsContainer.parentNode) {
        puzzleControlsContainer.remove();
        puzzleControlsContainer = null;
    }

    document.body.classList.add('theme-salle3-esprit');
    ui.setRoomTitle(LEVEL_ID);
    ui.loadSceneBackground(BACKGROUND_IMAGE_PHASE1);

    const storyButton = document.getElementById('story-reminder-button');
    if (storyButton) {
        storyButton.style.display = 'inline-block';
        storyButton.onclick = () => {
            const dialogueWindow = document.getElementById('dialogue-window');
            const isStoryCurrentlyVisible = !dialogueWindow.classList.contains('hidden') &&
                                       dialogueWindow.querySelector('#dialogue-text').textContent === STORY_TEXT_LVL3;

            if (isStoryCurrentlyVisible) {
                ui.hideDialogue();
                if (currentPhase === 2 && puzzleControlsContainer) {
                    puzzleControlsContainer.style.display = 'flex';
                }
            } else {
                ui.showDialogue(narrator, STORY_TEXT_LVL3);
                if (currentPhase === 2 && puzzleControlsContainer) {
                    puzzleControlsContainer.style.display = 'none';
                }
            }
        };
    }
    setupPhase1();
}

function setupPhase1() {
    currentPhase = 1;
    clickedLettersSequence = []; 
    errorsPhase1 = 0; 

    WORD_TO_FORM = POSSIBLE_WORDS_PHASE1[Math.floor(Math.random() * POSSIBLE_WORDS_PHASE1.length)];
    LETTERS_AVAILABLE = WORD_TO_FORM.split('');

    if (puzzleControlsContainer) {
        puzzleControlsContainer.style.display = 'none';
    }
    ui.showDialogue(wanda, "Tu ne l'auras pas ! Vision est sous ma protection ! Déchiffre le mot du pouvoir !");
    console.log("Mot à former pour la phase 1 (Wanda) :", WORD_TO_FORM);

    const baseAnchorPositions = [
        { top: '25%', left: '30%' }, { top: '25%', left: '70%' },
        { top: '45%', left: '20%' }, { top: '45%', left: '80%' },
        { top: '60%', left: '35%' }, { top: '60%', left: '65%' },
        { top: '35%', left: '50%' }, 
        { top: '65%', left: '50%' }  
    ];

    if (LETTERS_AVAILABLE.length > baseAnchorPositions.length) {
        console.error("Le mot choisi est trop long pour les positions d'ancrage définies:", WORD_TO_FORM);
    }
    
    anchorPoints.forEach(ap => { if (ap.parentNode) ap.remove(); });
    anchorPoints = [];

    let shuffledLetters = [...LETTERS_AVAILABLE].sort(() => Math.random() - 0.5);
    const positionsToUse = baseAnchorPositions.slice(0, LETTERS_AVAILABLE.length);

    shuffledLetters.forEach((letter, index) => {
        const anchor = document.createElement('div');
        anchor.id = `anchor-${letter}-${index}`; 
        anchor.className = 'anchor-point interactive-object';
        anchor.dataset.letter = letter; 
        Object.assign(anchor.style, {
            width: `${ANCHOR_POINT_SIZE}px`, height: `${ANCHOR_POINT_SIZE}px`, position: 'absolute',
            top: positionsToUse[index % positionsToUse.length].top, 
            left: positionsToUse[index % positionsToUse.length].left,
            backgroundColor: 'rgba(255, 0, 255, 0.4)', border: '3px solid magenta',
            borderRadius: '50%', boxShadow: '0 0 15px magenta', display: 'flex',
            justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
            fontSize: `${ANCHOR_POINT_SIZE * 0.5}px`, color: 'white', textShadow: '1px 1px 2px black'
        });
        anchor.textContent = letter; 
        anchor.onclick = () => handleAnchorClick(letter, anchor);
        gameAreaRef.appendChild(anchor);
        anchorPoints.push(anchor);
    });
}

function handleAnchorClick(clickedLetter, anchorElement) {
    if (currentPhase !== 1) return;
    
    clickedLettersSequence.push(clickedLetter);
    anchorElement.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    anchorElement.style.borderColor = 'lightgreen';
    anchorElement.onclick = null; 
    const currentWordFormed = clickedLettersSequence.join('');

    if (WORD_TO_FORM.startsWith(currentWordFormed)) {
        playSound(SOUND_ANCHOR_ACTIVATE, 0.5); 
        if (currentWordFormed === WORD_TO_FORM) {
            victoryPhase1();
        }
    } else {
        playSound(SOUND_ANCHOR_FAIL, 0.7); 
        errorsPhase1++;
        ui.showDialogue(wanda, `"${currentWordFormed}"... Ce n'est pas le bon ordre ! (${errorsPhase1}/${MAX_ERRORS_PHASE1} erreurs)`);
        if (errorsPhase1 >= MAX_ERRORS_PHASE1) {
            defeatPhase1("Trop d'erreurs ! Wanda détruit la pierre de Vision pour empêcher Thanos de l'obtenir !");
            return;
        }
        resetAnchors();
    }
}

function resetAnchors() {
    clickedLettersSequence = []; 
    anchorPoints.forEach(anchor => {
        anchor.style.backgroundColor = 'rgba(255, 0, 255, 0.4)';
        anchor.style.borderColor = 'magenta';
        const letterForThisAnchor = anchor.dataset.letter;
        anchor.onclick = () => handleAnchorClick(letterForThisAnchor, anchor);
    });
}

function victoryPhase1() {
    console.log("Phase 1 Victoire !");
    playSound(SOUND_SHIELD_BREAK, 0.8); 
    ui.showDialogue(thanos, "Sa défense est brisée. Maintenant, Vision...");
    anchorPoints.forEach(anchor => {
        Object.assign(anchor.style, { transition: 'opacity 0.5s, transform 0.5s', opacity: '0', transform: 'scale(0.1)' });
    });
    setTimeout(() => {
        playSound(SOUND_TIME_STONE_FREEZE, 0.7);
        ui.showDialogue(thanos, "Le temps s'arrête pour toi, Sorcière.");
    }, 1500);
    setTimeout(() => {
        anchorPoints.forEach(anchor => { if(anchor.parentNode) gameAreaRef.removeChild(anchor); });
        anchorPoints = [];
        ui.loadSceneBackground(BACKGROUND_IMAGE_PHASE2);
        setupPhase2();
    }, 3500);
}

function defeatPhase1(message) {
    console.log("Phase 1 Défaite.");
    playSound(SOUND_WANDA_DEFEAT, 0.9);
    ui.showDialogue(wanda, message, true);
    setTimeout(() => { document.dispatchEvent(new CustomEvent('gameOverTimer')); }, 4000);
}


function setupPhase2() {
    currentPhase = 2;
    puzzleHistory = []; 
    puzzleRedoStack = [];
    initialPiecesLayout = { slots: {}, containerPieces: [] }; 
    puzzlePiecesDOMElements = []; 
    puzzleSlotsDOMElements = [];  

    ui.showDialogue(thanos, "Vision... la Pierre de l'Esprit sera mienne.");

    const puzzleArea = document.createElement('div');
    puzzleArea.id = 'puzzle-area';
    const puzzleTotalSize = (PUZZLE_GRID_SIZE * PUZZLE_PIECE_DISPLAY_SIZE) + ((PUZZLE_GRID_SIZE - 1) * PUZZLE_AREA_GAP);
    const puzzleAreaOffsetLeft = 0; 
    Object.assign(puzzleArea.style, {
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(calc(-50% - ${puzzleTotalSize / 3}px), -50%)`,
        width: `${puzzleTotalSize}px`, height: `${puzzleTotalSize}px`,
        backgroundColor: 'rgba(0,0,0,0.05)', 
        display: 'grid',
        gridTemplateColumns: `repeat(${PUZZLE_GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${PUZZLE_GRID_SIZE}, 1fr)`,
        gap: `${PUZZLE_AREA_GAP}px`
    });
    gameAreaRef.appendChild(puzzleArea);

    for (let i = 0; i < PUZZLE_GRID_SIZE * PUZZLE_GRID_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.id = `slot-${i}`; 
        slot.dataset.expectedPiece = `piece-${i}`; 
        Object.assign(slot.style, { border: '1px dashed #555', boxSizing: 'border-box' });
        slot.ondragover = (event) => event.preventDefault();
        slot.ondrop = (event) => handleDropOnSlot(event, slot);
        puzzleArea.appendChild(slot);
        puzzleSlotsDOMElements.push(slot);
    }

    const piecesContainer = document.createElement('div');
    piecesContainer.id = 'puzzle-pieces-container';
    Object.assign(piecesContainer.style, {
        position: 'absolute', padding: '10px', backgroundColor: 'transparent',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', 
        gap: '8px', width: `${PUZZLE_GRID_SIZE * (PUZZLE_PIECE_DISPLAY_SIZE + 8) + 12}px`, 
        zIndex: '50' 
    });
    gameAreaRef.appendChild(piecesContainer);
    
    requestAnimationFrame(() => {
        const paRect = puzzleArea.getBoundingClientRect();
        const gaRect = gameAreaRef.getBoundingClientRect(); 
        let desiredTop = (paRect.bottom - gaRect.top) - piecesContainer.offsetHeight;
        let desiredLeft = (paRect.right - gaRect.left) - piecesContainer.offsetWidth;
        const minTop = 80; 
        const maxBottomAllowed = gameAreaRef.offsetHeight - 80; 
        if (desiredTop < minTop) { desiredTop = minTop; }
        if (desiredTop + piecesContainer.offsetHeight > maxBottomAllowed) {
            desiredTop = maxBottomAllowed - piecesContainer.offsetHeight;
        }
        const minLeft = 10; 
        const maxRightAllowed = gameAreaRef.offsetWidth - 10; 
        if (desiredLeft < minLeft) { desiredLeft = minLeft; }
        if (desiredLeft + piecesContainer.offsetWidth > maxRightAllowed) {
            desiredLeft = maxRightAllowed - piecesContainer.offsetWidth;
        }
        piecesContainer.style.top = `${desiredTop}px`;
        piecesContainer.style.left = `${desiredLeft}px`;
        if (piecesContainer.children.length === 0) {
            piecesContainer.style.display = 'none';
        } else {
            piecesContainer.style.display = 'flex';
        }
    });

    let pieceIndexes = [];
    for (let i = 0; i < PUZZLE_GRID_SIZE * PUZZLE_GRID_SIZE; i++) { pieceIndexes.push(i); }
    pieceIndexes.sort(() => Math.random() - 0.5);

    pieceIndexes.forEach((originalPieceIndex) => { 
        const piece = document.createElement('div');
        piece.id = `piece-${originalPieceIndex}`; 
        piece.className = 'puzzle-piece interactive-object';
        piece.draggable = true;
        piece.dataset.pieceId = `piece-${originalPieceIndex}`; 
        Object.assign(piece.style, {
            width: `${PUZZLE_PIECE_DISPLAY_SIZE}px`, height: `${PUZZLE_PIECE_DISPLAY_SIZE}px`,
            border: '1px solid #fff', boxSizing: 'border-box', cursor: 'grab',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: '0', backgroundImage: `url(${PUZZLE_IMAGE_SRC})`,
            backgroundSize: `${PUZZLE_GRID_SIZE * PUZZLE_PIECE_DISPLAY_SIZE}px ${PUZZLE_GRID_SIZE * PUZZLE_PIECE_DISPLAY_SIZE}px`
        });
        const col = originalPieceIndex % PUZZLE_GRID_SIZE;
        const row = Math.floor(originalPieceIndex / PUZZLE_GRID_SIZE);
        piece.style.backgroundPosition = `-${col * PUZZLE_PIECE_DISPLAY_SIZE}px -${row * PUZZLE_PIECE_DISPLAY_SIZE}px`;
        piece.ondragstart = (event) => handleDragStartPiece(event, piece);
        piecesContainer.appendChild(piece);
        puzzlePiecesDOMElements.push(piece);
        if(initialPiecesLayout) initialPiecesLayout.containerPieces.push(piece.id); 
    });

    createPuzzleControls(); 
    savePuzzleState(); 
    startMiniTimer();
}

function createPuzzleControls() {
    if (puzzleControlsContainer && puzzleControlsContainer.parentNode) {
        puzzleControlsContainer.remove(); 
    }
    puzzleControlsContainer = document.createElement('div');
    puzzleControlsContainer.id = 'puzzle-controls';
    Object.assign(puzzleControlsContainer.style, {
        position: 'absolute', bottom: `10px`, 
        left: '50%', transform: 'translateX(-50%)', padding: '8px',
        backgroundColor: 'rgba(50,50,50,0.6)', borderRadius: '8px',
        zIndex: '100', display: 'flex', gap: '15px'
    });

    const btnUndo = document.createElement('button');
    btnUndo.innerHTML = '&#x2190;'; 
    btnUndo.title = "Annuler"; 
    btnUndo.onclick = undoPuzzleAction;
    
    const btnRedo = document.createElement('button');
    btnRedo.innerHTML = '&#x2192;'; 
    btnRedo.title = "Rétablir"; 
    btnRedo.onclick = redoPuzzleAction;

    const btnReset = document.createElement('button');
    btnReset.innerHTML = '&#x21BA;'; 
    btnReset.title = "Réinitialiser"; 
    btnReset.onclick = resetPuzzle;
    
    [btnUndo, btnRedo, btnReset].forEach(btn => {
        btn.className = 'puzzle-control-button'; 
        Object.assign(btn.style, { 
            padding: '10px 15px', fontSize: '20px', cursor: 'pointer',
            backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px',
            transition: 'background-color 0.3s ease'
        });
        btn.onmouseover = () => btn.style.backgroundColor = '#45a049';
        btn.onmouseout = () => btn.style.backgroundColor = '#4CAF50';
        puzzleControlsContainer.appendChild(btn);
    });
    gameAreaRef.appendChild(puzzleControlsContainer);
    updatePuzzleControlButtons();
}

function getCurrentPuzzleState() {
    const state = { slots: {}, containerPieces: [] };
    puzzleSlotsDOMElements.forEach(slot => {
        if (slot.firstChild && slot.firstChild.id) {
            state.slots[slot.id] = slot.firstChild.id;
        } else {
            state.slots[slot.id] = null; 
        }
    });
    const piecesCont = document.getElementById('puzzle-pieces-container');
    if (piecesCont) {
        Array.from(piecesCont.children).forEach(pieceNode => {
            if (pieceNode.id && pieceNode.classList.contains('puzzle-piece')) {
                state.containerPieces.push(pieceNode.id);
            }
        });
    }
    return state;
}

function savePuzzleState() {
    const currentState = getCurrentPuzzleState();
    if (puzzleHistory.length === 0 && initialPiecesLayout) {
         initialPiecesLayout = JSON.parse(JSON.stringify(currentState)); 
    }
    puzzleHistory.push(currentState);
    puzzleRedoStack = []; 
    updatePuzzleControlButtons();
}

function applyPuzzleState(stateToApply) {
    if (!stateToApply) return;

    puzzleSlotsDOMElements.forEach(slot => {
        if (slot.firstChild) slot.removeChild(slot.firstChild);
        slot.style.borderColor = '#555'; 
    });
    const piecesCont = document.getElementById('puzzle-pieces-container');
    if (piecesCont) {
        while (piecesCont.firstChild) {
            piecesCont.removeChild(piecesCont.firstChild);
        }
    }

    puzzlePiecesDOMElements.forEach(pieceElement => {
        pieceElement.style.border = '1px solid #fff'; 
        let placedInSlot = false;
        for (const slotId in stateToApply.slots) {
            if (stateToApply.slots[slotId] === pieceElement.id) {
                const slotElement = document.getElementById(slotId);
                if (slotElement) {
                    slotElement.appendChild(pieceElement);
                    if (pieceElement.dataset.pieceId === slotElement.dataset.expectedPiece) {
                        pieceElement.style.border = '2px solid lightgreen';
                        slotElement.style.borderColor = 'lightgreen';
                    } else {
                        pieceElement.style.border = '2px solid red';
                        slotElement.style.borderColor = 'red';
                    }
                    placedInSlot = true;
                    break;
                }
            }
        }
        const pieceIsInContainerState = stateToApply.containerPieces && stateToApply.containerPieces.includes(pieceElement.id);
        if (!placedInSlot && pieceIsInContainerState) {
            if (piecesCont) piecesCont.appendChild(pieceElement);
        }
    });
    if (piecesCont) {
        piecesCont.style.display = piecesCont.children.length > 0 ? 'flex' : 'none';
    }
    checkPuzzleComplete(); 
    updatePuzzleControlButtons();
}

function undoPuzzleAction() {
    if (puzzleHistory.length <= 1) { 
        console.log("Undo: Historique vide ou état initial atteint.");
        return;
    }
    playSound(SOUND_BTN_CLICK, 0.7);
    const currentStateForRedo = puzzleHistory.pop(); 
    puzzleRedoStack.push(currentStateForRedo);
    const stateToRestore = puzzleHistory[puzzleHistory.length - 1]; 
    applyPuzzleState(stateToRestore);
    console.log("Undo appliqué. Redo stack:", puzzleRedoStack.length, "History:", puzzleHistory.length);
}

function redoPuzzleAction() {
    if (puzzleRedoStack.length === 0) {
        console.log("Redo: Pile de redo vide.");
        return;
    }
    playSound(SOUND_BTN_CLICK, 0.7);
    const stateToRestore = puzzleRedoStack.pop();
    puzzleHistory.push(stateToRestore); 
    applyPuzzleState(stateToRestore);
    console.log("Redo appliqué. Redo stack:", puzzleRedoStack.length, "History:", puzzleHistory.length);
}

function resetPuzzle() {
    playSound(SOUND_BTN_CLICK, 0.7);
    console.log("Réinitialisation du puzzle.");
    if (puzzleHistory.length > 0 && initialPiecesLayout) {
        const firstState = puzzleHistory[0]; 
        applyPuzzleState(firstState);
        puzzleHistory = [JSON.parse(JSON.stringify(firstState))];
        puzzleRedoStack = [];
        updatePuzzleControlButtons();
    } else { 
        console.warn("L'état initial du puzzle pour reset est invalide ou non défini, rechargement complet de la phase 2.");
        const puzzleArea = document.getElementById('puzzle-area');
        if (puzzleArea && puzzleArea.parentNode) puzzleArea.remove();
        const piecesCont = document.getElementById('puzzle-pieces-container');
        if (piecesCont && piecesCont.parentNode) piecesCont.remove();
        if (puzzleControlsContainer && puzzleControlsContainer.parentNode) puzzleControlsContainer.remove();
        puzzleSlotsDOMElements = [];
        puzzlePiecesDOMElements = [];
        initialPiecesLayout = null; 
        puzzleHistory = [];
        puzzleRedoStack = [];
        setupPhase2(); 
    }
}


function updatePuzzleControlButtons() {
    if (!puzzleControlsContainer) return;
    const btnUndo = puzzleControlsContainer.querySelector('button:nth-child(1)');
    const btnRedo = puzzleControlsContainer.querySelector('button:nth-child(2)');
    
    if (btnUndo) {
        btnUndo.disabled = puzzleHistory.length <= 1; 
        btnUndo.style.opacity = btnUndo.disabled ? '0.5' : '1';
        btnUndo.style.cursor = btnUndo.disabled ? 'default' : 'pointer';

    }
    if (btnRedo) {
        btnRedo.disabled = puzzleRedoStack.length === 0;
        btnRedo.style.opacity = btnRedo.disabled ? '0.5' : '1';
        btnRedo.style.cursor = btnRedo.disabled ? 'default' : 'pointer';
    }
}

function handleDragStartPiece(event, pieceElement) {
    playSound(SOUND_PUZZLE_PICKUP, 0.4);
    draggedPiece = pieceElement;
    event.dataTransfer.setData('text/plain', pieceElement.id);
    event.dataTransfer.effectAllowed = 'move';
    pieceElement.style.cursor = 'grabbing';
    setTimeout(() => pieceElement.style.opacity = '0.5', 0);
}

function handleDropOnSlot(event, slotElement) {
    event.preventDefault();
    if (!draggedPiece) return;

    if (slotElement.firstChild) { 
        const pieceInTargetSlot = slotElement.firstChild;
        const piecesCont = document.getElementById('puzzle-pieces-container');
        if (piecesCont) {
            if (piecesCont.style.display === 'none') {
                piecesCont.style.display = 'flex';
            }
            piecesCont.appendChild(pieceInTargetSlot); 
            pieceInTargetSlot.style.opacity = '1';
            pieceInTargetSlot.style.border = '1px solid #fff'; 
        }
    }
    slotElement.appendChild(draggedPiece); 
    draggedPiece.style.opacity = '1';
    draggedPiece.style.cursor = 'grab';

    if (draggedPiece.dataset.pieceId === slotElement.dataset.expectedPiece) {
        playSound(SOUND_PUZZLE_DROP_OK, 0.6);
        draggedPiece.style.border = '2px solid lightgreen';
        slotElement.style.borderColor = 'lightgreen';
    } else {
        playSound(SOUND_PUZZLE_DROP_WRONG, 0.6);
        draggedPiece.style.border = '2px solid red';
        slotElement.style.borderColor = 'red';
    }
    
    draggedPiece = null;
    savePuzzleState(); 
    checkPuzzleComplete();
}

function checkPuzzleComplete() {
    const piecesCont = document.getElementById('puzzle-pieces-container');
    let allPiecesInSlots = true;
    if (piecesCont) {
         for(let i=0; i < piecesCont.children.length; i++){
            if(piecesCont.children[i].classList.contains('puzzle-piece')){
                allPiecesInSlots = false;
                break;
            }
        }
    }
    if (allPiecesInSlots && piecesCont) {
        piecesCont.style.display = 'none';
    } else if (piecesCont) {
        const visiblePieces = Array.from(piecesCont.children).filter(child => child.classList.contains('puzzle-piece'));
        piecesCont.style.display = visiblePieces.length > 0 ? 'flex' : 'none';
    }

    for (let slot of puzzleSlotsDOMElements) {
        if (!slot.firstChild || slot.firstChild.dataset.pieceId !== slot.dataset.expectedPiece) { 
            return false; 
        }
    }
    victoryPhase2();
    return true;
}

function startMiniTimer() {
    timeLeftMiniTimer = MINI_TIMER_DURATION;
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'mini-timer-display';
    Object.assign(timerDisplay.style, {
        position: 'absolute', top: '70px', left: '50%',
        transform: 'translateX(-50%)', fontSize: '1.5em', color: 'yellow',
        padding: '5px 10px', backgroundColor: 'rgba(0,0,0,0.7)'
    });
    gameAreaRef.appendChild(timerDisplay);
    function updateDisplay() { timerDisplay.textContent = `Temps pour la Pierre : ${timeLeftMiniTimer}s`; }
    updateDisplay();
    miniTimerId = setInterval(() => {
        timeLeftMiniTimer--;
        updateDisplay();
        if (timeLeftMiniTimer <= 0) { defeatPhase2("Temps écoulé ! La Pierre de l'Esprit est perdue !"); }
    }, 1000);
}

function victoryPhase2() {
    if (currentPhase !== 2) return;
    currentPhase = 3;
    console.log("Phase 2 Victoire ! JEU GAGNÉ !");
    if (miniTimerId) clearInterval(miniTimerId);
    const timerDisplay = document.getElementById('mini-timer-display');
    if (timerDisplay && timerDisplay.parentNode) timerDisplay.remove();
    if (puzzleControlsContainer && puzzleControlsContainer.parentNode) puzzleControlsContainer.remove();

    playSound(SOUND_PUZZLE_COMPLETE, 0.8);

    const puzzleArea = document.getElementById('puzzle-area');
    if (puzzleArea && puzzleArea.parentNode) puzzleArea.style.display = 'none';
    const piecesCont = document.getElementById('puzzle-pieces-container');
    if (piecesCont && piecesCont.parentNode) piecesCont.remove(); 

    revealedPuzzleImage = document.createElement('img');
    revealedPuzzleImage.src = PUZZLE_IMAGE_SRC;
    revealedPuzzleImage.id = 'revealed-puzzle-image';
    const puzzleTotalSize = (PUZZLE_GRID_SIZE * PUZZLE_PIECE_DISPLAY_SIZE) + ((PUZZLE_GRID_SIZE - 1) * PUZZLE_AREA_GAP);
    const puzzleAreaOffsetLeft = 0; 
    Object.assign(revealedPuzzleImage.style, {
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(calc(-50% - ${puzzleTotalSize / 3}px), -50%)`, 
        width: `${puzzleTotalSize}px`, height: `${puzzleTotalSize}px`,
        border: '3px solid gold', boxShadow: '0 0 20px gold'
    });
    gameAreaRef.appendChild(revealedPuzzleImage);

    setTimeout(() => {
        if (revealedPuzzleImage && revealedPuzzleImage.parentNode) { revealedPuzzleImage.remove(); revealedPuzzleImage = null; }
        if (puzzleArea && puzzleArea.parentNode) puzzleArea.remove();
        ui.showDialogue(thanos, "Parfaitement équilibré... comme toute chose devrait l'être.");
        setTimeout(() => {
            playSound(VICTORY_SOUND, 1.0);
            const snapFlash = document.createElement('div');
            Object.assign(snapFlash.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'white', opacity: '0', zIndex: '9999', transition: 'opacity 0.3s ease-out'
            });
            document.body.appendChild(snapFlash);
            setTimeout(() => snapFlash.style.opacity = '1', 50);
            setTimeout(() => snapFlash.style.opacity = '0', 350);
            setTimeout(() => { if (snapFlash.parentNode) document.body.removeChild(snapFlash); }, 700);
        }, 2000);
        setTimeout(() => { levelCompleted(); }, 4000);
    }, 3000);
}

function defeatPhase2(message) {
    if (currentPhase !== 2) return;
    currentPhase = -1;
    console.log("Phase 2 Défaite.");
    if (miniTimerId) clearInterval(miniTimerId);
    const timerDisplay = document.getElementById('mini-timer-display');
    if (timerDisplay && timerDisplay.parentNode) timerDisplay.remove();
    if (puzzleControlsContainer && puzzleControlsContainer.parentNode) puzzleControlsContainer.remove();

    playSound(SOUND_VISION_OVERLOAD, 0.9);
    ui.showDialogue(vision, message, true);
    setTimeout(() => { document.dispatchEvent(new CustomEvent('gameOverTimer')); }, 4000);
}