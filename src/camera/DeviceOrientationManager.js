import * as THREE from 'three';

/**
 * DeviceOrientationManager - Controla a câmera baseado na orientação do dispositivo
 * Permite que objetos 3D fiquem "fixos no espaço" enquanto o celular se move
 */
export class DeviceOrientationManager {
    constructor(camera) {
        this.camera = camera;
        this.enabled = false;

        // Orientação inicial
        this.initialAlpha = null;
        this.initialBeta = null;
        this.initialGamma = null;

        // Orientação atual
        this.alpha = 0; // Rotação em Z (bússola)
        this.beta = 0;  // Rotação em X (inclinação frente/trás)
        this.gamma = 0; // Rotação em Y (inclinação esquerda/direita)

        // Quaternions para suavização
        this.targetQuaternion = new THREE.Quaternion();
        this.smoothQuaternion = new THREE.Quaternion();

        // Objetos auxiliares
        this.euler = new THREE.Euler();
        this.q0 = new THREE.Quaternion();
        this.q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90° em X

        // Orientação da tela
        this.screenOrientation = window.orientation || 0;

        // Bind
        this.handleOrientation = this.handleOrientation.bind(this);
        this.handleOrientationChange = this.handleOrientationChange.bind(this);
    }

    /**
     * Solicita permissão e inicia o tracking de orientação
     */
    async start() {
        // iOS 13+ requer permissão explícita
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    console.warn('⚠️ Permissão de orientação negada');
                    return false;
                }
            } catch (error) {
                console.error('❌ Erro ao solicitar permissão:', error);
                return false;
            }
        }

        // Adicionar listeners
        window.addEventListener('deviceorientation', this.handleOrientation);
        window.addEventListener('orientationchange', this.handleOrientationChange);

        this.enabled = true;
        console.log('📱 Device Orientation ativado');
        return true;
    }

    /**
     * Handler para eventos de orientação
     */
    handleOrientation(event) {
        if (!this.enabled) return;

        const alpha = event.alpha || 0; // Z: 0-360
        const beta = event.beta || 0;   // X: -180 a 180
        const gamma = event.gamma || 0; // Y: -90 a 90

        // Salvar orientação inicial como referência
        if (this.initialAlpha === null) {
            this.initialAlpha = alpha;
            this.initialBeta = beta;
            this.initialGamma = gamma;
        }

        this.alpha = alpha;
        this.beta = beta;
        this.gamma = gamma;

        // Atualizar quaternion alvo
        this.updateTargetQuaternion();
    }

    /**
     * Calcula o quaternion da câmera baseado na orientação
     */
    updateTargetQuaternion() {
        const alphaRad = THREE.MathUtils.degToRad(this.alpha);
        const betaRad = THREE.MathUtils.degToRad(this.beta);
        const gammaRad = THREE.MathUtils.degToRad(this.gamma);

        // Orientação da tela em radianos
        const orient = THREE.MathUtils.degToRad(this.screenOrientation);

        // Criar euler baseado na orientação do dispositivo
        this.euler.set(betaRad, alphaRad, -gammaRad, 'YXZ');

        // Converter para quaternion
        this.targetQuaternion.setFromEuler(this.euler);

        // Aplicar correção de orientação da tela
        this.targetQuaternion.multiply(this.q1);
        this.targetQuaternion.multiply(this.q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient));
    }

    /**
     * Handler para mudança de orientação da tela
     */
    handleOrientationChange() {
        this.screenOrientation = window.orientation || 0;
    }

    /**
     * Atualiza a câmera com suavização
     * @param {number} deltaTime - Tempo desde o último frame
     */
    update(deltaTime) {
        if (!this.enabled) return;

        // Suavizar a rotação (lerp do quaternion)
        const smoothFactor = Math.min(1, deltaTime * 10);
        this.smoothQuaternion.slerp(this.targetQuaternion, smoothFactor);

        // Aplicar à câmera
        this.camera.quaternion.copy(this.smoothQuaternion);
    }

    /**
     * Para o tracking
     */
    stop() {
        window.removeEventListener('deviceorientation', this.handleOrientation);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        this.enabled = false;
        console.log('📱 Device Orientation desativado');
    }

    /**
     * Reseta a orientação inicial
     */
    reset() {
        this.initialAlpha = null;
        this.initialBeta = null;
        this.initialGamma = null;
    }
}
