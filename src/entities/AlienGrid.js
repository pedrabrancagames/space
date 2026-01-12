import * as THREE from 'three';
import { AlienFactory } from './AlienFactory.js';

/**
 * AlienGrid - Gerencia a formação e movimento dos aliens
 */
export class AlienGrid {
    constructor(scene) {
        this.scene = scene;
        this.factory = new AlienFactory();

        // Configuração do grid
        this.config = {
            rows: 5,
            cols: 11,
            spacingX: 1.2,
            spacingY: 0.8,
            startX: 0,
            startY: 3,  // Começa no topo da tela
            startZ: -8  // Distância da câmera (negativo = à frente)
        };

        // Estado do grid
        this.aliens = [];
        this.direction = 1; // 1 = direita, -1 = esquerda
        this.moveSpeed = 0.015;
        this.dropDistance = 0.3;
        this.baseSpeed = 0.015;
        this.speedMultiplier = 1;

        // Limites de movimento
        this.boundaryX = 5;

        // Animação
        this.wiggleTime = 0;
        this.wiggleAmount = 0.1;

        // Referência ao grupo principal
        this.group = null;
    }

    /**
     * Gera uma nova onda de aliens
     * @param {number} wave - Número da wave atual
     */
    spawnWave(wave = 1) {
        // Limpar aliens anteriores
        this.clear();

        // Criar grupo para a wave
        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Aumentar dificuldade baseado na wave
        this.speedMultiplier = 1 + (wave - 1) * 0.15;
        this.moveSpeed = this.baseSpeed * this.speedMultiplier;

        // Calcular offset para centralizar o grid
        const totalWidth = (this.config.cols - 1) * this.config.spacingX;
        const totalHeight = (this.config.rows - 1) * this.config.spacingY;
        const offsetX = -totalWidth / 2;
        const offsetY = this.config.startY;

        // Criar aliens
        for (let row = 0; row < this.config.rows; row++) {
            const rowAliens = [];

            // Determinar tipo baseado na linha
            // Linha 0 (topo): tipo 3 (mais pontos)
            // Linhas 1-2: tipo 2
            // Linhas 3-4: tipo 1
            let alienType;
            if (row === 0) {
                alienType = 3;
            } else if (row <= 2) {
                alienType = 2;
            } else {
                alienType = 1;
            }

            for (let col = 0; col < this.config.cols; col++) {
                const alien = this.factory.createAlien(alienType, 1 + wave * 0.05);

                const x = offsetX + col * this.config.spacingX;
                const y = offsetY - row * this.config.spacingY;
                const z = this.config.startZ;

                alien.position.set(x, y, z);

                // Armazenar posição inicial no grid
                alien.userData.gridRow = row;
                alien.userData.gridCol = col;
                alien.userData.originalY = y; // IMPORTANTE: Salvar Y original para animação

                this.group.add(alien);
                rowAliens.push(alien);
            }


            this.aliens.push(rowAliens);
        }

        console.log(`👾 Wave ${wave}: ${this.getAliveCount()} aliens spawned`);
    }

    /**
     * Atualiza posição e animação dos aliens
     * @param {number} deltaTime - Tempo desde o último frame
     * @returns {boolean} true se algum alien atingiu o chão
     */
    update(deltaTime) {
        if (!this.group || this.aliens.length === 0) return false;

        // Atualizar tempo de animação
        this.wiggleTime += deltaTime * 3;

        // Verificar se precisa mudar de direção
        let needsToChangeDirection = false;
        let hitGround = false;

        // Encontrar aliens mais à esquerda e à direita
        let leftMost = Infinity;
        let rightMost = -Infinity;
        let lowestY = Infinity;

        for (const row of this.aliens) {
            for (const alien of row) {
                if (!alien.userData.isAlive) continue;

                const worldPos = new THREE.Vector3();
                alien.getWorldPosition(worldPos);

                leftMost = Math.min(leftMost, worldPos.x);
                rightMost = Math.max(rightMost, worldPos.x);
                lowestY = Math.min(lowestY, worldPos.y);
            }
        }

        // Verificar se atingiu as bordas
        if (rightMost >= this.boundaryX && this.direction === 1) {
            needsToChangeDirection = true;
        } else if (leftMost <= -this.boundaryX && this.direction === -1) {
            needsToChangeDirection = true;
        }

        // Verificar se algum alien atingiu o chão
        if (lowestY <= -3) {
            hitGround = true;
        }

        // Aplicar movimento
        if (needsToChangeDirection) {
            this.direction *= -1;
            this.group.position.y -= this.dropDistance;

            // Aumentar velocidade a cada mudança de direção
            this.moveSpeed *= 1.02;
        } else {
            this.group.position.x += this.direction * this.moveSpeed;
        }

        // Aplicar animação de "wiggle" para cada alien
        for (const row of this.aliens) {
            for (const alien of row) {
                if (!alien.userData.isAlive) continue;

                // Rotação suave
                const wiggle = Math.sin(this.wiggleTime + alien.userData.wiggleOffset) * this.wiggleAmount;
                alien.rotation.z = wiggle;

                // Pequena oscilação vertical
                const bounce = Math.sin(this.wiggleTime * 2 + alien.userData.wiggleOffset) * 0.02;
                alien.position.y = alien.userData.originalY + bounce;

                // Salvar posição Y original se não existir
                if (alien.userData.originalY === undefined) {
                    alien.userData.originalY = alien.position.y;
                }
            }
        }

        return hitGround;
    }

    /**
     * Destrói um alien específico
     * @param {THREE.Group} alien - O alien a ser destruído
     * @returns {number} Pontos ganhos
     */
    destroyAlien(alien) {
        if (!alien.userData.isAlive) return 0;

        alien.userData.isAlive = false;

        // Criar efeito de explosão
        const worldPos = new THREE.Vector3();
        alien.getWorldPosition(worldPos);

        const explosion = this.factory.createExplosion(worldPos, alien.children[0]?.material?.color?.getHex() || 0x00ff88);
        this.scene.add(explosion);

        // Remover explosão após animação
        setTimeout(() => {
            this.scene.remove(explosion);
            explosion.geometry.dispose();
            explosion.material.dispose();
        }, 1000);

        // Esconder o alien (não remover para manter estrutura do grid)
        alien.visible = false;

        // Aumentar velocidade levemente quando alien é destruído
        const aliveCount = this.getAliveCount();
        if (aliveCount > 0) {
            this.moveSpeed = this.baseSpeed * this.speedMultiplier * (1 + (55 - aliveCount) * 0.02);
        }

        return alien.userData.points;
    }

    /**
     * Retorna todos os aliens vivos
     * @returns {THREE.Group[]}
     */
    getAliveAliens() {
        const alive = [];
        for (const row of this.aliens) {
            for (const alien of row) {
                if (alien.userData.isAlive) {
                    alive.push(alien);
                }
            }
        }
        return alive;
    }

    /**
     * Retorna a contagem de aliens vivos
     * @returns {number}
     */
    getAliveCount() {
        return this.getAliveAliens().length;
    }

    /**
     * Verifica se todos os aliens foram destruídos
     * @returns {boolean}
     */
    isWaveCleared() {
        return this.getAliveCount() === 0;
    }

    /**
     * Limpa todos os aliens
     */
    clear() {
        if (this.group) {
            this.scene.remove(this.group);

            // Limpar recursos
            this.group.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        this.aliens = [];
        this.group = null;
        this.direction = 1;
        this.moveSpeed = this.baseSpeed;
    }

    /**
     * Limpa recursos
     */
    dispose() {
        this.clear();
        this.factory.dispose();
    }
}
