import { startGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM prêt. Menu principal affiché.");

    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const infoBanner = document.getElementById('info-banner');
    const titleBanner = document.getElementById('title-banner');
    const homeMusic = document.getElementById('home-music');

    if (homeMusic) {
        homeMusic.volume = 0.03; 
        const playPromise = homeMusic.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("La lecture automatique de la musique d'accueil a été bloquée par le navigateur.", error);
                const playOnClick = () => {
                    homeMusic.play();
                    document.body.removeEventListener('click', playOnClick);
                };
                document.body.addEventListener('click', playOnClick);
            });
        }
    }

    if (startButton && startScreen && infoBanner && titleBanner) {
        startButton.addEventListener('click', () => {
            if (homeMusic) {
                homeMusic.pause();
                homeMusic.currentTime = 0; 
            }

            startScreen.style.display = 'none';

            infoBanner.classList.remove('hidden');
            infoBanner.style.display = 'flex'; 
            titleBanner.classList.remove('hidden');
            titleBanner.style.display = 'flex'; 

            let playerName = prompt("Entrez votre pseudo :", "Thanos");
            if (!playerName || playerName.trim() === "") {
                playerName = "Thanos";
            }
            
            startGame(playerName); 
        });
    }
});