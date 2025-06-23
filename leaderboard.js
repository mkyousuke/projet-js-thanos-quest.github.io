import { getScores } from './storage.js';

function formatTime(timeInSeconds) {
    if (typeof timeInSeconds !== 'number' || isNaN(timeInSeconds)) {
        return 'N/A';
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.round(timeInSeconds % 60);
    return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
}

// Fonction pour gérer la musique
function playBackgroundMusic() {
    const music = document.getElementById('home-music');
    if (music) {
        music.volume = 0.5; // Ajustez le volume selon vos préférences
        music.play().catch(error => {
            console.log('Impossible de jouer la musique automatiquement:', error);
            // Ajouter un event listener pour démarrer la musique au premier clic
            document.addEventListener('click', () => {
                music.play().catch(err => console.log('Erreur lors de la lecture de la musique:', err));
            }, { once: true });
        });
    }
}

async function generateScoreImage(score) {
    const scoreCard = document.createElement('div');
    scoreCard.id = 'score-card-for-screenshot';

    const time1 = formatTime(score.levelTimes ? score.levelTimes[0] : undefined);
    const time2 = formatTime(score.levelTimes ? score.levelTimes[1] : undefined);
    const time3 = formatTime(score.levelTimes ? score.levelTimes[2] : undefined);

    scoreCard.innerHTML = `
        <div class="card-title">La Quête de Thanos</div>
        <div class="player-name">Score de ${score.name}</div>
        <p><strong>Temps Total : ${formatTime(score.time)}</strong></p>
        <br/>
        <p>Salle 1 (Âme) : ${time1}</p>
        <p>Salle 2 (Temps) : ${time2}</p>
        <p>Salle 3 (Esprit) : ${time3}</p>
    `;

    document.body.appendChild(scoreCard);

    try {
        const canvas = await html2canvas(scoreCard, {
            useCORS: true, 
            backgroundColor: null 
        });

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `score-thanos-quete-${score.name.replace(/\s/g, '_')}.png`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);

    } catch (error) {
        console.error("Erreur lors de la génération de l'image du score :", error);
        alert("Désolé, une erreur est survenue lors de la création de l'image.");
    } finally {
        document.body.removeChild(scoreCard);
    }
}

function displayLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return;

    const scores = getScores();
    const currentPlayerName = sessionStorage.getItem('currentPlayerName');
    
    leaderboardBody.innerHTML = '';

    if (scores.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Aucun score pour le moment.</td></tr>`;
        return;
    }
    
    scores.slice(0, 10).forEach((score, index) => {
        const row = document.createElement('tr');
        let actionCellHTML = '';

        if (score.name === currentPlayerName) {
            row.classList.add('current-player');
            actionCellHTML = `<button class="share-button" data-index="${index}">Partager</button>`;
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.name}</td>
            <td>${formatTime(score.time)}</td>
            <td>${formatTime(score.levelTimes ? score.levelTimes[0] : undefined)}</td>
            <td>${formatTime(score.levelTimes ? score.levelTimes[1] : undefined)}</td>
            <td>${formatTime(score.levelTimes ? score.levelTimes[2] : undefined)}</td>
            <td class="action-cell">${actionCellHTML}</td>
        `;
        leaderboardBody.appendChild(row);
    });

    document.querySelectorAll('.share-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const scoreIndex = e.target.getAttribute('data-index');
            const scoreData = scores[scoreIndex];
            generateScoreImage(scoreData);
        });
    });
}

// Fonction d'initialisation
function initializeLeaderboard() {
    displayLeaderboard();
    playBackgroundMusic();
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', initializeLeaderboard);
