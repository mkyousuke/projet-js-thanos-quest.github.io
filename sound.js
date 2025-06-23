export function playSound(soundFile, volume = 1.0) {
    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play();
}