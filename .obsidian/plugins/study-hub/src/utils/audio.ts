/**
 * Plays a calm notification chime using the Web Audio API.
 * Does not require external audio files or internet access.
 */
export function playChimeSound(): void {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Frequencies for a pleasant chord (E5, G#5, B5, E6)
        const notes = [659.25, 830.61, 987.77, 1318.51];

        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.08);

            // Envelope: quick attack, smooth exponential decay
            gain.gain.setValueAtTime(0, now + index * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + index * 0.08);
            osc.stop(now + index * 0.08 + 1.3);
        });
    } catch (e) {
        console.warn('Could not play audio chime:', e);
    }
}
