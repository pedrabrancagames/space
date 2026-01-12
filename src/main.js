/**
 * AR Space Invaders
 * Jogo de Realidade Aumentada estilo Space Invaders
 * 
 * @author AR Space Invaders Team
 * @version 1.0.0
 */

import { GameManager } from './game/GameManager.js';

// Inicializar jogo quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 AR Space Invaders v1.0.0');
    console.log('📱 Dispositivo:', navigator.userAgent);

    // Verificar suporte a APIs necessárias
    const support = checkBrowserSupport();

    if (!support.camera) {
        showUnsupported('Seu navegador não suporta acesso à câmera. Use Chrome no Android.');
        return;
    }

    if (!support.webgl) {
        showUnsupported('Seu navegador não suporta WebGL. Use um navegador moderno.');
        return;
    }

    // Criar e inicializar o gerenciador do jogo
    const game = new GameManager();

    try {
        await game.init();
    } catch (error) {
        console.error('Erro ao inicializar jogo:', error);
        showUnsupported('Erro ao inicializar o jogo: ' + error.message);
    }

    // Expor para debug
    window.game = game;
});

/**
 * Verifica suporte do navegador
 * @returns {Object} Objeto com flags de suporte
 */
function checkBrowserSupport() {
    return {
        camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        webgl: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(
                    window.WebGLRenderingContext &&
                    (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
                );
            } catch (e) {
                return false;
            }
        })(),
        webAudio: !!(window.AudioContext || window.webkitAudioContext)
    };
}

/**
 * Mostra mensagem de navegador não suportado
 * @param {string} message - Mensagem de erro
 */
function showUnsupported(message) {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.innerHTML = `
      <div class="splash-content">
        <h1 class="game-title">
          <span class="title-ar">AR</span>
          <span class="title-space">SPACE</span>
          <span class="title-invaders">INVADERS</span>
        </h1>
        <div style="margin-top: 40px; padding: 20px;">
          <span style="font-size: 60px;">😢</span>
          <h2 style="color: #ff3366; margin: 20px 0;">Navegador Não Suportado</h2>
          <p style="color: rgba(255,255,255,0.6); line-height: 1.6;">
            ${message}
          </p>
          <p style="color: rgba(255,255,255,0.4); margin-top: 20px; font-size: 14px;">
            Recomendamos usar Google Chrome no Android para a melhor experiência.
          </p>
        </div>
      </div>
    `;
    }
}

// Prevenir comportamentos indesejados em mobile
document.addEventListener('touchmove', (e) => {
    // Permitir scroll apenas em elementos específicos
    if (!e.target.closest('.scrollable')) {
        e.preventDefault();
    }
}, { passive: false });

// Prevenir zoom com gesto de pinça
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// Manter tela ativa durante o jogo
if ('wakeLock' in navigator) {
    let wakeLock = null;

    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('🔒 Wake lock ativado');
        } catch (err) {
            console.log('Wake lock não disponível:', err);
        }
    };

    // Solicitar wake lock quando o jogo iniciar
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !wakeLock) {
            requestWakeLock();
        }
    });
}
