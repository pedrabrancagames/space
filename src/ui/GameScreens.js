/**
 * GameScreens - Gerencia as telas do jogo (splash, game over, erro)
 */
export class GameScreens {
    constructor() {
        // Elementos das telas
        this.screens = {
            splash: document.getElementById('splash-screen'),
            gameOver: document.getElementById('game-over-screen'),
            error: document.getElementById('error-screen'),
            loading: document.getElementById('loading-screen')
        };

        // Elementos de interação
        this.buttons = {
            start: document.getElementById('start-button'),
            restart: document.getElementById('restart-button'),
            retry: document.getElementById('retry-button')
        };

        // Elementos de dados
        this.stats = {
            finalScore: document.getElementById('final-score'),
            finalWave: document.getElementById('final-wave'),
            aliensKilled: document.getElementById('aliens-killed'),
            errorMessage: document.getElementById('error-message')
        };

        // Callbacks
        this.onStart = null;
        this.onRestart = null;
        this.onRetry = null;

        // Configurar event listeners
        this.setupEventListeners();
    }

    /**
     * Configura os event listeners dos botões
     */
    setupEventListeners() {
        this.buttons.start.addEventListener('click', () => {
            if (this.onStart) {
                this.onStart();
            }
        });

        this.buttons.restart.addEventListener('click', () => {
            if (this.onRestart) {
                this.onRestart();
            }
        });

        this.buttons.retry.addEventListener('click', () => {
            if (this.onRetry) {
                this.onRetry();
            }
        });
    }

    /**
     * Mostra a tela de splash/início
     */
    showSplash() {
        this.hideAll();
        this.screens.splash.classList.remove('hidden');
    }

    /**
     * Esconde a tela de splash (inicia o jogo)
     */
    hideSplash() {
        this.screens.splash.classList.add('hidden');
    }

    /**
     * Mostra a tela de loading
     */
    showLoading() {
        this.screens.loading.classList.remove('hidden');
    }

    /**
     * Esconde a tela de loading
     */
    hideLoading() {
        this.screens.loading.classList.add('hidden');
    }

    /**
     * Mostra a tela de game over com estatísticas
     * @param {Object} stats - Estatísticas do jogo
     * @param {number} stats.score - Pontuação final
     * @param {number} stats.wave - Wave máxima alcançada
     * @param {number} stats.aliensKilled - Número de aliens destruídos
     */
    showGameOver(stats) {
        this.hideAll();

        // Atualizar estatísticas
        this.stats.finalScore.textContent = stats.score.toLocaleString();
        this.stats.finalWave.textContent = stats.wave;
        this.stats.aliensKilled.textContent = stats.aliensKilled;

        // Mostrar tela com delay para efeito dramático
        setTimeout(() => {
            this.screens.gameOver.classList.remove('hidden');
        }, 500);
    }

    /**
     * Esconde a tela de game over
     */
    hideGameOver() {
        this.screens.gameOver.classList.add('hidden');
    }

    /**
     * Mostra a tela de erro
     * @param {string} message - Mensagem de erro
     */
    showError(message) {
        this.hideAll();
        this.stats.errorMessage.textContent = message;
        this.screens.error.classList.remove('hidden');
    }

    /**
     * Esconde a tela de erro
     */
    hideError() {
        this.screens.error.classList.add('hidden');
    }

    /**
     * Esconde todas as telas
     */
    hideAll() {
        Object.values(this.screens).forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    /**
     * Define callback para botão iniciar
     * @param {Function} callback
     */
    setOnStart(callback) {
        this.onStart = callback;
    }

    /**
     * Define callback para botão reiniciar
     * @param {Function} callback
     */
    setOnRestart(callback) {
        this.onRestart = callback;
    }

    /**
     * Define callback para botão tentar novamente
     * @param {Function} callback
     */
    setOnRetry(callback) {
        this.onRetry = callback;
    }
}
