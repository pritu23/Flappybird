/**
 * Flappy Bird - Web Audio API Sound Effects
 * 100% Procedural & Self-Contained (Zero external audio assets required)
 */

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('flappy_muted') === 'true';
    }

    /**
     * Lazily initialize AudioContext on user interaction to comply with browser autoplay policies.
     */
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('flappy_muted', this.isMuted);
        return this.isMuted;
    }

    /**
     * Crisp, uplifting chirp sound when bird flaps wings.
     */
    playFlap() {
        if (this.isMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            // Audio error safety
        }
    }

    /**
     * Bright dual-tone arcade coin chime when passing a pipe.
     */
    playScore() {
        if (this.isMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // Tone 1: High B5
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(987.77, now);
            gain1.gain.setValueAtTime(0.2, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.1);

            // Tone 2: Higher E6 (bright octave harmony)
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1318.51, now + 0.08);
            gain2.gain.setValueAtTime(0.25, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.28);
        } catch (e) {
            // Audio error safety
        }
    }

    /**
     * Punchy impact thud and descending drop when bird collides.
     */
    playHit() {
        if (this.isMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;

            // Punchy bass impact
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.25);

            // Quick noise snap
            const bufferSize = this.ctx.sampleRate * 0.06;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.2, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

            noise.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {
            // Audio error safety
        }
    }

    /**
     * UI button click sound.
     */
    playClick() {
        if (this.isMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {
            // Audio error safety
        }
    }

    /**
     * Celebratory triumphant arpeggio for unlocking a medal.
     */
    playMedal() {
        if (this.isMuted || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

            notes.forEach((freq, idx) => {
                const startTime = now + idx * 0.09;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.28);
            });
        } catch (e) {
            // Audio error safety
        }
    }
}

window.soundManager = new SoundEffects();
