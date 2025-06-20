const SCORES_KEY = 'escapeGameScores';

export function getScores() {
    try {
        const scoresJSON = localStorage.getItem(SCORES_KEY);
        return scoresJSON ? JSON.parse(scoresJSON).sort((a, b) => a.time - b.time) : [];
    } catch (error) {
        console.error("Erreur lors de la récupération des scores :", error);
        return [];
    }
}

export function saveScore(playerName, timeInSeconds, levelTimes) {
    if (!playerName || typeof timeInSeconds !== 'number') {
        return;
    }

    const scores = getScores();
    scores.push({ 
        name: playerName, 
        time: timeInSeconds, 
        levelTimes: levelTimes 
    });

    scores.sort((a, b) => a.time - b.time);
    const topScores = scores.slice(0, 10);

    try {
        localStorage.setItem(SCORES_KEY, JSON.stringify(topScores));
        sessionStorage.setItem('currentPlayerName', playerName);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du score :", error);
    }
}