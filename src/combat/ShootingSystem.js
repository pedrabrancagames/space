import * as THREE from 'three';

/**
 * ShootingSystem - Sistema de tiros do jogador
 */
export class ShootingSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Configurações
        this.cooldown = 200; // ms entre tiros
        this.lastShotTime = 0;
        this.projectileSpeed = 0.5;
        this.projectileLifetime = 2000; // ms

        // Projéteis ativos
        this.projectiles = [];

        // Raycaster para detecção de colisão
        this.raycaster = new THREE.Raycaster();

        // Material do projétil
        this.projectileMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.9
        });

        // Geometria do projétil (laser)
        this.projectileGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
    }

    /**
     * Dispara um projétil do centro da tela
     * @returns {boolean} true se conseguiu atirar
     */
    shoot() {
        const now = Date.now();

        // Verificar cooldown
        if (now - this.lastShotTime < this.cooldown) {
            return false;
        }

        this.lastShotTime = now;

        // Criar projétil
        const projectile = new THREE.Mesh(this.projectileGeometry, this.projectileMaterial.clone());

        // Posicionar na frente da câmera
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        // Posição inicial: ligeiramente abaixo do centro para simular arma
        projectile.position.copy(this.camera.position);
        projectile.position.add(direction.clone().multiplyScalar(0.5));
        projectile.position.y -= 0.2;

        // Orientar o projétil na direção do movimento
        projectile.lookAt(projectile.position.clone().add(direction));

        // Dados do projétil
        projectile.userData = {
            direction: direction.clone(),
            createdAt: now,
            isActive: true
        };

        // Adicionar efeito de brilho
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3
        });
        const glowGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        projectile.add(glow);

        this.scene.add(projectile);
        this.projectiles.push(projectile);

        // Feedback visual na mira
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.classList.add('shooting');
            setTimeout(() => crosshair.classList.remove('shooting'), 150);
        }

        return true;
    }

    /**
     * Atualiza posição dos projéteis e verifica colisões
     * @param {number} deltaTime - Tempo desde o último frame
     * @param {THREE.Group[]} targets - Alvos para verificar colisão
     * @returns {THREE.Group[]} Aliens atingidos
     */
    update(deltaTime, targets) {
        const now = Date.now();
        const hits = [];

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            if (!projectile.userData.isActive) continue;

            // Mover projétil
            const movement = projectile.userData.direction.clone().multiplyScalar(this.projectileSpeed);
            projectile.position.add(movement);

            // Verificar tempo de vida
            if (now - projectile.userData.createdAt > this.projectileLifetime) {
                this.removeProjectile(i);
                continue;
            }

            // Verificar colisão com alvos
            for (const target of targets) {
                if (!target.userData.isAlive) continue;

                // Obter posição mundial do alvo
                const targetWorldPos = new THREE.Vector3();
                target.getWorldPosition(targetWorldPos);

                // Calcular distância
                const distance = projectile.position.distanceTo(targetWorldPos);

                // Raio de colisão baseado no tamanho do alien
                const hitRadius = 0.5;

                if (distance < hitRadius) {
                    // Hit!
                    projectile.userData.isActive = false;
                    hits.push(target);

                    // Criar efeito de impacto
                    this.createHitEffect(projectile.position.clone());

                    // Remover projétil
                    this.removeProjectile(i);
                    break;
                }
            }
        }

        return hits;
    }

    /**
     * Remove um projétil da cena
     * @param {number} index - Índice do projétil
     */
    removeProjectile(index) {
        const projectile = this.projectiles[index];

        if (projectile) {
            this.scene.remove(projectile);

            // Limpar recursos
            projectile.geometry?.dispose();
            projectile.material?.dispose();
            projectile.children.forEach(child => {
                child.geometry?.dispose();
                child.material?.dispose();
            });

            this.projectiles.splice(index, 1);
        }
    }

    /**
     * Cria efeito visual de impacto
     * @param {THREE.Vector3} position - Posição do impacto
     */
    createHitEffect(position) {
        // Flash de luz
        const light = new THREE.PointLight(0xffff00, 2, 3);
        light.position.copy(position);
        this.scene.add(light);

        // Remover após breve período
        setTimeout(() => {
            this.scene.remove(light);
            light.dispose();
        }, 100);
    }

    /**
     * Limpa todos os projéteis
     */
    clear() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.removeProjectile(i);
        }
    }

    /**
     * Limpa recursos
     */
    dispose() {
        this.clear();
        this.projectileGeometry.dispose();
        this.projectileMaterial.dispose();
    }
}
