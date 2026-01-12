/**
 * HUD - Gerencia a interface do usuário durante o jogo
 */
export class HUD {
    constructor() {
        // Elementos do HUD
        this.elements = {
            hud: document.getElementById('hud'),
            score: document.getElementById('score'),
            wave: document.getElementById('wave'),
            lives: document.getElementById('lives'),
            combo: document.getElementById('combo'),
            comboCount: document.getElementById('combo-count')
        };

        // Estado
        this.currentScore = 0;
        this.displayedScore = 0;
        this.targetScore = 0;
        this.currentWave = 1;
        this.currentLives = 3;
        this.maxLives = 3;

        // Combo
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboTimeout = 2000; // ms para resetar combo
    }

    /**
     * Mostra o HUD
     */
    show() {
        this.elements.hud.classList.remove('hidden');
    }

    /**
     * Esconde o HUD
     */
    hide() {
        this.elements.hud.classList.add('hidden');
    }

    /**
     * Atualiza a pontuação com animação
     * @param {number} points - Pontos a adicionar
     * @param {number} screenX - Posição X na tela (opcional)
     * @param {number} screenY - Posição Y na tela (opcional)
     */
    addScore(points, screenX = null, screenY = null) {
        // Aplicar multiplicador de combo
        const multiplier = Math.min(this.comboCount, 5);
        const finalPoints = points * Math.max(1, multiplier);

        this.targetScore += finalPoints;

        // Incrementar combo
        this.incrementCombo();

        // Mostrar popup de pontos se posição fornecida
        if (screenX !== null && screenY !== null) {
            this.showScorePopup(finalPoints, screenX, screenY);
        }

        // Animar contagem de pontos
        this.animateScore();
    }

    /**
     * Anima a contagem de pontos
     */
    animateScore() {
        const animate = () => {
            if (this.displayedScore < this.targetScore) {
                const diff = this.targetScore - this.displayedScore;
                const increment = Math.ceil(diff / 10);
                this.displayedScore = Math.min(this.displayedScore + increment, this.targetScore);
                this.elements.score.textContent = this.displayedScore.toLocaleString();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    /**
     * Mostra popup de pontos na posição do acerto
     */
    showScorePopup(points, x, y) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 800);
    }

    /**
     * Incrementa o contador de combo
     */
    incrementCombo() {
        this.comboCount++;

        // Limpar timer anterior
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }

        // Mostrar combo se maior que 1
        if (this.comboCount >= 2) {
            this.showCombo();
        }

        // Timer para resetar combo
        this.comboTimer = setTimeout(() => {
            this.resetCombo();
        }, this.comboTimeout);
    }

    /**
     * Mostra indicador de combo
     */
    showCombo() {
        this.elements.comboCount.textContent = `x${this.comboCount}`;
        this.elements.combo.classList.remove('hidden');

        // Forçar reflow para reiniciar animação
        this.elements.combo.style.animation = 'none';
        this.elements.combo.offsetHeight; // Trigger reflow
        this.elements.combo.style.animation = null;
    }

    /**
     * Reseta o combo
     */
    resetCombo() {
        this.comboCount = 0;
        this.elements.combo.classList.add('hidden');
    }

    /**
     * Atualiza o número da wave
     * @param {number} wave - Número da wave
     */
    setWave(wave) {
        this.currentWave = wave;
        this.elements.wave.textContent = wave;

        // Efeito de destaque
        this.elements.wave.parentElement.style.animation = 'none';
        this.elements.wave.parentElement.offsetHeight;
        this.elements.wave.parentElement.style.animation = 'pulse 0.5s ease-out';
    }

    /**
     * Remove uma vida
     * @returns {number} Vidas restantes
     */
    loseLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
            this.updateLivesDisplay();

            // Efeito de hit na tela
            this.showHitEffect();
        }

        return this.currentLives;
    }

    /**
     * Atualiza o display de vidas
     */
    updateLivesDisplay() {
        const hearts = this.elements.lives.querySelectorAll('.life');

        hearts.forEach((heart, index) => {
            if (index >= this.currentLives) {
                heart.classList.add('lost');
            } else {
                heart.classList.remove('lost');
            }
        });
    }

    /**
     * Mostra efeito de dano na tela
     */
    showHitEffect() {
        const hitEffect = document.createElement('div');
        hitEffect.className = 'hit-effect';
        document.body.appendChild(hitEffect);

        setTimeout(() => {
            hitEffect.remove();
        }, 200);
    }

    /**
     * Reseta o HUD para novo jogo
     */
    reset() {
        this.currentScore = 0;
        this.displayedScore = 0;
        this.targetScore = 0;
        this.currentWave = 1;
        this.currentLives = this.maxLives;
        this.comboCount = 0;

        // Atualizar display
        this.elements.score.textContent = '0';
        this.elements.wave.textContent = '1';
        this.elements.combo.classList.add('hidden');

        // Resetar corações
        const hearts = this.elements.lives.querySelectorAll('.life');
        hearts.forEach(heart => heart.classList.remove('lost'));
    }

    /**
     * Retorna a pontuação atual
     * @returns {number}
     */
    getScore() {
        return this.targetScore;
    }

    /**
     * Retorna vidas restantes
     * @returns {number}
     */
    getLives() {
        return this.currentLives;
    }

    /**
     * Retorna wave atual
     * @returns {number}
     */
    getWave() {
        return this.currentWave;
    }
}
