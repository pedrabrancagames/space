/**
 * SoundManager - Gerencia os efeitos sonoros do jogo
 */
export class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;

        // Usar Web Audio API para sons mais responsivos
        this.audioContext = null;
        this.masterGain = null;
    }

    /**
     * Inicializa o contexto de áudio (deve ser chamado após interação do usuário)
     */
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;

            // Gerar sons proceduralmente (não precisa de arquivos externos)
            this.sounds = {
                shoot: this.createShootSound(),
                explosion: this.createExplosionSound(),
                hit: this.createHitSound(),
                gameOver: this.createGameOverSound(),
                waveComplete: this.createWaveCompleteSound()
            };

            console.log('🔊 Sistema de áudio inicializado');
            return true;
        } catch (error) {
            console.warn('⚠️ Áudio não disponível:', error);
            return false;
        }
    }

    /**
     * Cria som de tiro (laser)
     */
    createShootSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(this.masterGain);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(110, this.audioContext.currentTime + 0.1);

            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    }

    /**
     * Cria som de explosão
     */
    createExplosionSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            // Criar ruído
            const bufferSize = this.audioContext.sampleRate * 0.2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;

            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.start(this.audioContext.currentTime);
            noise.stop(this.audioContext.currentTime + 0.2);
        };
    }

    /**
     * Cria som de hit/dano
     */
    createHitSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(this.masterGain);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

            gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    }

    /**
     * Cria som de game over
     */
    createGameOverSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            const notes = [440, 392, 349, 330, 294, 262];

            notes.forEach((freq, i) => {
                const oscillator = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(this.masterGain);

                oscillator.type = 'triangle';
                oscillator.frequency.value = freq;

                const startTime = this.audioContext.currentTime + i * 0.15;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.15);
            });
        };
    }

    /**
     * Cria som de wave completa
     */
    createWaveCompleteSound() {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

            notes.forEach((freq, i) => {
                const oscillator = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(this.masterGain);

                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                const startTime = this.audioContext.currentTime + i * 0.1;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.2);
            });
        };
    }

    /**
     * Toca um som
     * @param {string} soundName - Nome do som
     */
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    /**
     * Ativa/desativa sons
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Define o volume master
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    /**
     * Resume o contexto de áudio (necessário após interação do usuário)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}
