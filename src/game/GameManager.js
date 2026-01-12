import * as THREE from 'three';
import { CameraManager } from '../camera/CameraManager.js';
import { AlienGrid } from '../entities/AlienGrid.js';
import { ShootingSystem } from '../combat/ShootingSystem.js';
import { HUD } from '../ui/HUD.js';
import { GameScreens } from '../ui/GameScreens.js';
import { SoundManager } from '../audio/SoundManager.js';

/**
 * GameManager - Controlador principal do jogo
 */
export class GameManager {
    constructor() {
        // Sistemas
        this.cameraManager = new CameraManager();
        this.screens = new GameScreens();
        this.hud = new HUD();
        this.soundManager = new SoundManager();

        // Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Entidades
        this.alienGrid = null;
        this.shootingSystem = null;

        // Estado do jogo
        this.state = {
            isPlaying: false,
            isPaused: false,
            wave: 1,
            aliensKilled: 0
        };

        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = 0;

        // Bind de métodos
        this.gameLoop = this.gameLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     * Inicializa o jogo
     */
    async init() {
        console.log('🎮 Inicializando AR Space Invaders...');

        // Configurar callbacks das telas
        this.screens.setOnStart(() => this.startGame());
        this.screens.setOnRestart(() => this.restartGame());
        this.screens.setOnRetry(() => this.startGame());

        // Mostrar tela inicial
        this.screens.showSplash();

        // Inicializar Three.js
        this.initThreeJS();

        // Configurar eventos
        this.setupEventListeners();

        console.log('✅ Inicialização completa');
    }

    /**
     * Inicializa a cena Three.js
     */
    initThreeJS() {
        // Cena
        this.scene = new THREE.Scene();

        // Câmera perspectiva
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer com transparência para mostrar vídeo atrás
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Iluminação
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Luz de destaque colorida
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 20);
        pointLight1.position.set(-5, 5, -5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00ff, 0.5, 20);
        pointLight2.position.set(5, 5, -5);
        this.scene.add(pointLight2);

        // Criar sistemas de jogo
        this.alienGrid = new AlienGrid(this.scene);
        this.shootingSystem = new ShootingSystem(this.scene, this.camera);

        console.log('✅ Three.js inicializado');
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Resize
        window.addEventListener('resize', this.handleResize);

        // Touch para atirar
        const shootArea = document.getElementById('shoot-area');
        shootArea.addEventListener('touchstart', this.handleTouch, { passive: false });
        shootArea.addEventListener('click', this.handleClick);

        // Prevenir zoom no double tap
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Inicia o jogo
     */
    async startGame() {
        console.log('🚀 Iniciando jogo...');

        // Mostrar loading
        this.screens.showLoading();

        try {
            // Solicitar acesso à câmera
            await this.cameraManager.requestAccess();

            // Inicializar áudio
            await this.soundManager.init();

            // Esconder telas
            this.screens.hideAll();

            // Mostrar HUD
            this.hud.show();
            this.hud.reset();

            // Resetar estado
            this.state.isPlaying = true;
            this.state.wave = 1;
            this.state.aliensKilled = 0;

            // Spawn primeira wave
            this.spawnWave();

            // Iniciar game loop
            this.clock.start();
            this.gameLoop();

            console.log('✅ Jogo iniciado!');

        } catch (error) {
            console.error('❌ Erro ao iniciar jogo:', error);

            let title = 'Erro de Sistema';
            let icon = '❌';

            if (error.message.includes('câmera') || error.message.includes('camera')) {
                title = 'Câmera Indisponível';
                icon = '📵';
            }

            this.screens.showError(error.message, title, icon);
        }
    }

    /**
     * Reinicia o jogo
     */
    restartGame() {
        console.log('🔄 Reiniciando jogo...');

        // Limpar entidades
        this.alienGrid.clear();
        this.shootingSystem.clear();

        // Resetar HUD
        this.hud.reset();

        // Resetar estado
        this.state.isPlaying = true;
        this.state.wave = 1;
        this.state.aliensKilled = 0;

        // Esconder telas
        this.screens.hideAll();

        // Mostrar HUD
        this.hud.show();

        // Spawn wave
        this.spawnWave();
    }

    /**
     * Gera uma nova wave de aliens
     */
    spawnWave() {
        this.alienGrid.spawnWave(this.state.wave);
        this.hud.setWave(this.state.wave);

        if (this.state.wave > 1) {
            this.soundManager.play('waveComplete');
        }
    }

    /**
     * Loop principal do jogo
     */
    gameLoop() {
        if (!this.state.isPlaying) return;

        requestAnimationFrame(this.gameLoop);

        const deltaTime = this.clock.getDelta();

        // Atualizar aliens
        const hitGround = this.alienGrid.update(deltaTime);

        // Verificar se alien atingiu o chão
        if (hitGround) {
            this.onAlienHitGround();
        }

        // Atualizar projéteis e verificar colisões
        const aliveAliens = this.alienGrid.getAliveAliens();
        const hits = this.shootingSystem.update(deltaTime, aliveAliens);

        // Processar hits
        for (const alien of hits) {
            this.onAlienHit(alien);
        }

        // Verificar se wave foi completada
        if (this.alienGrid.isWaveCleared()) {
            this.onWaveComplete();
        }

        // Renderizar
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Chamado quando um alien é atingido
     */
    onAlienHit(alien) {
        // Destruir alien e pegar pontos
        const points = this.alienGrid.destroyAlien(alien);

        // Incrementar contador
        this.state.aliensKilled++;

        // Calcular posição na tela para popup
        const worldPos = new THREE.Vector3();
        alien.getWorldPosition(worldPos);

        const screenPos = worldPos.project(this.camera);
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

        // Adicionar pontos ao HUD
        this.hud.addScore(points, x, y);

        // Tocar som
        this.soundManager.play('explosion');
    }

    /**
     * Chamado quando um alien atinge o chão
     */
    onAlienHitGround() {
        // Perder uma vida
        const remainingLives = this.hud.loseLife();

        // Tocar som
        this.soundManager.play('hit');

        // Verificar game over
        if (remainingLives <= 0) {
            this.gameOver();
        } else {
            // Resetar posição dos aliens e continuar
            this.alienGrid.clear();
            this.spawnWave();
        }
    }

    /**
     * Chamado quando a wave é completada
     */
    onWaveComplete() {
        console.log(`🎉 Wave ${this.state.wave} completa!`);

        // Próxima wave
        this.state.wave++;

        // Pequeno delay antes de spawnar nova wave
        setTimeout(() => {
            if (this.state.isPlaying) {
                this.spawnWave();
            }
        }, 1500);
    }

    /**
     * Game Over
     */
    gameOver() {
        console.log('💀 Game Over!');

        this.state.isPlaying = false;

        // Tocar som
        this.soundManager.play('gameOver');

        // Esconder HUD
        this.hud.hide();

        // Limpar entidades
        this.alienGrid.clear();
        this.shootingSystem.clear();

        // Mostrar tela de game over
        this.screens.showGameOver({
            score: this.hud.getScore(),
            wave: this.state.wave,
            aliensKilled: this.state.aliensKilled
        });
    }

    /**
     * Handler de toque
     */
    handleTouch(event) {
        event.preventDefault();

        if (!this.state.isPlaying) return;

        // Resume áudio se necessário
        this.soundManager.resume();

        // Atirar
        if (this.shootingSystem.shoot()) {
            this.soundManager.play('shoot');
        }
    }

    /**
     * Handler de clique (para desktop)
     */
    handleClick(event) {
        if (!this.state.isPlaying) return;

        // Resume áudio se necessário
        this.soundManager.resume();

        // Atirar
        if (this.shootingSystem.shoot()) {
            this.soundManager.play('shoot');
        }
    }

    /**
     * Handler de resize
     */
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Atualizar câmera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Atualizar renderer
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /**
     * Limpa recursos
     */
    dispose() {
        this.state.isPlaying = false;

        // Parar câmera
        this.cameraManager.stop();

        // Limpar Three.js
        this.alienGrid?.dispose();
        this.shootingSystem?.dispose();
        this.renderer?.dispose();

        // Remover event listeners
        window.removeEventListener('resize', this.handleResize);
    }
}
