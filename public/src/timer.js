import { updateTimerDisplay } from './ui.js';

let timerInterval;
let timeRemainingOnStop = 0;
let initialDuration = 0;

export function startTimer(durationInSeconds) {
    initialDuration = durationInSeconds;
    let timer = durationInSeconds;
    timeRemainingOnStop = durationInSeconds;
    let minutes, seconds;

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        updateTimerDisplay(`${minutes}:${seconds}`);
        timeRemainingOnStop = timer;

        if (--timer < 0) {
            stopTimer();
            console.log("TEMPS ÉCOULÉ !");
            const gameOverEvent = new CustomEvent('gameOverTimer');
            document.dispatchEvent(gameOverEvent);
        }
    }, 1000);
}

export function stopTimer() {
    clearInterval(timerInterval);
    console.log(`Timer arrêté. Temps restant : ${timeRemainingOnStop}`);
}

export function getPlayTimeInSeconds() {
    return initialDuration - timeRemainingOnStop;
}