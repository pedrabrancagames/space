# AR Space Invaders 👾

Um jogo de Realidade Aumentada estilo Space Invaders para navegador web mobile.

## 🎮 Como Jogar

1. Acesse o jogo em um **celular Android** usando **Google Chrome**
2. Permita o acesso à câmera quando solicitado
3. Aponte a câmera para o ambiente ao seu redor
4. **Toque na tela** para atirar nos aliens
5. Destrua todos os aliens antes que eles toquem o chão!

## 🛸 Características

- **Realidade Aumentada**: Os aliens aparecem sobre a imagem da câmera
- **Aliens 3D Voxel**: Modelos 3D inspirados nos sprites originais do Space Invaders
- **3 Tipos de Aliens**: Cada tipo vale pontos diferentes
- **Sistema de Combo**: Acerte vários aliens em sequência para multiplicar pontos
- **Waves Progressivas**: Dificuldade aumenta a cada wave
- **Efeitos Sonoros**: Sons procedurais gerados em tempo real (sem arquivos externos)

## 🔧 Tecnologias

- **Three.js** - Renderização 3D
- **Vite** - Build tool
- **getUserMedia API** - Acesso à câmera
- **Web Audio API** - Efeitos sonoros

## 📱 Compatibilidade

| Plataforma | Navegador | Status |
|------------|-----------|--------|
| Android | Chrome 79+ | ✅ Suportado |
| Android | Edge | ✅ Suportado |
| Android | Samsung Internet 13+ | ✅ Suportado |
| iOS | Safari | ⚠️ Limitado* |
| Desktop | Chrome/Firefox | ⚠️ Sem câmera AR |

*iOS tem limitações no acesso à câmera via navegador.

## 🚀 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📦 Deploy

O projeto está configurado para deploy automático na Vercel via GitHub Actions.

### Deploy Manual na Vercel

1. Conecte seu repositório GitHub à Vercel
2. Vercel detectará automaticamente o projeto Vite
3. O deploy será feito a cada push na branch `main`

## 🎨 Estrutura do Projeto

```
space-invaders/
├── index.html          # HTML principal
├── package.json        # Dependências
├── vite.config.js      # Configuração Vite
├── vercel.json         # Configuração Vercel
├── src/
│   ├── main.js         # Ponto de entrada
│   ├── styles/
│   │   └── main.css    # Estilos
│   ├── camera/
│   │   └── CameraManager.js
│   ├── entities/
│   │   ├── AlienFactory.js
│   │   └── AlienGrid.js
│   ├── combat/
│   │   └── ShootingSystem.js
│   ├── ui/
│   │   ├── HUD.js
│   │   └── GameScreens.js
│   ├── audio/
│   │   └── SoundManager.js
│   └── game/
│       └── GameManager.js
└── .github/
    └── workflows/
        └── deploy.yml
```

## 📝 Licença

MIT License
