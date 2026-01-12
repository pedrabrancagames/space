/**
 * CameraManager - Gerencia acesso à câmera do dispositivo
 */
export class CameraManager {
    constructor() {
        this.videoElement = document.getElementById('camera-feed');
        this.stream = null;
        this.isActive = false;
    }

    /**
     * Solicita acesso à câmera e inicia o stream
     * @returns {Promise<boolean>} true se conseguiu acessar a câmera
     */
    async requestAccess() {
        try {
            // Preferência por câmera traseira (environment) para AR
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;

            // Aguardar o vídeo estar pronto
            await new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play()
                        .then(resolve)
                        .catch(reject);
                };
                this.videoElement.onerror = reject;
            });

            this.isActive = true;
            console.log('📷 Câmera inicializada com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao acessar câmera:', error);

            // Tentar fallback para câmera frontal
            if (error.name === 'OverconstrainedError') {
                return this.requestFallbackCamera();
            }

            throw this.parseError(error);
        }
    }

    /**
     * Fallback para câmera frontal se traseira não disponível
     */
    async requestFallbackCamera() {
        try {
            console.log('🔄 Tentando câmera frontal como fallback...');

            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;

            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play().then(resolve);
                };
            });

            this.isActive = true;
            console.log('📷 Câmera frontal inicializada');
            return true;

        } catch (error) {
            throw this.parseError(error);
        }
    }

    /**
     * Converte erros de MediaDevices em mensagens amigáveis
     */
    parseError(error) {
        const errorMessages = {
            'NotAllowedError': 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.',
            'NotFoundError': 'Nenhuma câmera encontrada no dispositivo.',
            'NotReadableError': 'A câmera está sendo usada por outro aplicativo.',
            'OverconstrainedError': 'A câmera não suporta as configurações solicitadas.',
            'SecurityError': 'O acesso à câmera foi bloqueado por questões de segurança. Certifique-se de estar usando HTTPS.',
            'AbortError': 'O acesso à câmera foi interrompido.',
        };

        const message = errorMessages[error.name] || `Erro ao acessar câmera: ${error.message}`;

        return new Error(message);
    }

    /**
     * Para o stream da câmera
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isActive = false;
        console.log('📷 Câmera desligada');
    }

    /**
     * Retorna as dimensões do vídeo
     */
    getDimensions() {
        return {
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight
        };
    }
}
