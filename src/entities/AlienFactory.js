import * as THREE from 'three';

/**
 * AlienFactory - Cria modelos 3D de aliens estilo Space Invaders (voxel)
 */
export class AlienFactory {
    constructor() {
        // Materiais com cores vibrantes
        this.materials = {
            type1: new THREE.MeshStandardMaterial({
                color: 0x00ff88,
                emissive: 0x00ff88,
                emissiveIntensity: 0.3,
                metalness: 0.3,
                roughness: 0.5
            }),
            type2: new THREE.MeshStandardMaterial({
                color: 0xff00ff,
                emissive: 0xff00ff,
                emissiveIntensity: 0.3,
                metalness: 0.3,
                roughness: 0.5
            }),
            type3: new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.3,
                metalness: 0.3,
                roughness: 0.5
            })
        };

        // Cache de geometrias
        this.geometryCache = {};
    }

    /**
     * Cria um alien baseado no tipo (1, 2 ou 3)
     * @param {number} type - Tipo do alien (1-3)
     * @param {number} scale - Escala do alien
     * @returns {THREE.Group} Grupo contendo o modelo do alien
     */
    createAlien(type = 1, scale = 1) {
        const alien = new THREE.Group();

        // Padrões de pixels para cada tipo de alien (inspirados no Space Invaders original)
        const patterns = this.getPatterns();
        const pattern = patterns[`type${type}`] || patterns.type1;
        const material = this.materials[`type${type}`] || this.materials.type1;

        // Tamanho de cada voxel
        const voxelSize = 0.08 * scale;

        // Criar geometria do cubo (reutilizada para todos os voxels)
        const cubeGeometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);

        // Construir o alien a partir do padrão de pixels
        const rows = pattern.length;
        const cols = pattern[0].length;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (pattern[row][col] === 1) {
                    const cube = new THREE.Mesh(cubeGeometry, material);

                    // Centralizar o alien
                    const x = (col - cols / 2) * voxelSize;
                    const y = (rows / 2 - row) * voxelSize;
                    const z = 0;

                    cube.position.set(x, y, z);
                    alien.add(cube);
                }
            }
        }

        // Adicionar profundidade (duplicar com offset no eixo Z)
        const depth = 2;
        for (let d = 1; d <= depth; d++) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (pattern[row][col] === 1) {
                        const cube = new THREE.Mesh(cubeGeometry, material);
                        const x = (col - cols / 2) * voxelSize;
                        const y = (rows / 2 - row) * voxelSize;
                        const z = d * voxelSize;

                        cube.position.set(x, y, z);
                        alien.add(cube);
                    }
                }
            }
        }

        // Dados do alien para game logic
        alien.userData = {
            type: type,
            points: type * 10, // Tipo 1 = 10pts, Tipo 2 = 20pts, Tipo 3 = 30pts
            isAlive: true,
            wiggleOffset: Math.random() * Math.PI * 2
        };

        return alien;
    }

    /**
     * Padrões de pixels para os aliens (1 = voxel presente, 0 = vazio)
     * Inspirados nos sprites originais do Space Invaders
     */
    getPatterns() {
        return {
            // Alien tipo 1 - "Squid" (mais comum, vale menos pontos)
            type1: [
                [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
                [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0]
            ],

            // Alien tipo 2 - "Crab" (médio)
            type2: [
                [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
                [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]
            ],

            // Alien tipo 3 - "Octopus" (mais raro, vale mais pontos)
            type3: [
                [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
            ]
        };
    }

    /**
     * Cria efeito de explosão de partículas
     * @param {THREE.Vector3} position - Posição da explosão
     * @param {number} color - Cor das partículas
     * @returns {THREE.Points} Sistema de partículas
     */
    createExplosion(position, color = 0x00ff88) {
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z;

            velocities.push({
                x: (Math.random() - 0.5) * 0.3,
                y: (Math.random() - 0.5) * 0.3,
                z: (Math.random() - 0.5) * 0.3
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.05,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            velocities: velocities,
            lifetime: 1.0,
            age: 0
        };

        return particles;
    }

    /**
     * Limpa recursos
     */
    dispose() {
        Object.values(this.materials).forEach(material => material.dispose());
        Object.values(this.geometryCache).forEach(geometry => geometry.dispose());
    }
}
