// projet-js/public/assets/js/persistent-music.js

document.addEventListener('DOMContentLoaded', () => {
    const homeMusic = document.getElementById('home-music');

    if (!homeMusic) {
        console.error("L'élément audio 'home-music' est introuvable sur cette page.");
        return;
    }

    // Fonction pour sauvegarder l'état de la musique avant de quitter la page
    const saveMusicState = () => {
        const musicShouldPlay = sessionStorage.getItem('musicShouldPlay');
        // On ne sauvegarde le temps que si la musique est censée être jouée
        if (musicShouldPlay === 'true' && homeMusic && !homeMusic.paused) {
            sessionStorage.setItem('musicCurrentTime', homeMusic.currentTime);
        }
    };

    window.addEventListener('beforeunload', saveMusicState);

    // Vérifier si la musique doit être jouée en arrivant sur la page
    if (sessionStorage.getItem('musicShouldPlay') === 'true') {
        const musicTime = parseFloat(sessionStorage.getItem('musicCurrentTime')) || 0;
        homeMusic.currentTime = musicTime;
        homeMusic.volume = 0.4;

        const playPromise = homeMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("La lecture continue a été bloquée par le navigateur. Une interaction de l'utilisateur est requise.", error);
                // Proposer de relancer la musique au premier clic
                document.body.addEventListener('click', () => homeMusic.play(), { once: true });
            });
        }
    }
});