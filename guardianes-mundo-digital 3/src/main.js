import Phaser from 'phaser';
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import './styles/main.css';

import { GAME_WIDTH, GAME_HEIGHT, PHYSICS } from './config.js';
import { input } from './systems/InputManager.js';
import { audio } from './systems/AudioManager.js';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import AvatarScene from './scenes/AvatarScene.js';
import IntroScene from './scenes/IntroScene.js';
import MapScene from './scenes/MapScene.js';
import Level1Scene from './scenes/Level1Scene.js';
import Level2Scene from './scenes/Level2Scene.js';
import Level3Scene from './scenes/Level3Scene.js';
import EndingScene from './scenes/EndingScene.js';
import UIScene from './scenes/UIScene.js';
import MessagePuzzleScene from './puzzles/MessagePuzzleScene.js';
import SortPuzzleScene from './puzzles/SortPuzzleScene.js';
import BridgePuzzleScene from './puzzles/BridgePuzzleScene.js';
import PortalPuzzleScene from './puzzles/PortalPuzzleScene.js';
import ChatPuzzleScene from './puzzles/ChatPuzzleScene.js';
import WordsPuzzleScene from './puzzles/WordsPuzzleScene.js';
import PauseScene from './scenes/PauseScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import HelpScene from './scenes/HelpScene.js';
import ConfirmScene from './scenes/ConfirmScene.js';

async function waitForFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('500 20px "Baloo 2"'),
        document.fonts.load('600 20px "Baloo 2"'),
        document.fonts.load('700 20px "Baloo 2"'),
        document.fonts.load('800 20px "Baloo 2"')
      ]),
      new Promise((resolve) => setTimeout(resolve, 2500))
    ]);
  } catch {
    // Si la fuente no carga se usa la fuente alternativa del sistema.
  }
}

async function start() {
  await waitForFonts();
  input.init();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#0b2e33',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: { activePointers: 4 },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: PHYSICS.gravity }, debug: false }
    },
    render: { antialias: true, roundPixels: false },
    scene: [
      BootScene, MenuScene, AvatarScene, IntroScene, MapScene,
      Level1Scene, Level2Scene, Level3Scene, EndingScene,
      UIScene, MessagePuzzleScene, SortPuzzleScene, BridgePuzzleScene,
      PortalPuzzleScene, ChatPuzzleScene, WordsPuzzleScene,
      InventoryScene, PauseScene, OptionsScene, HelpScene, ConfirmScene
    ]
  });

  // Desbloquea el audio con el primer gesto (requisito de los navegadores).
  const unlock = () => audio.unlock();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);

  // Silencia el audio cuando la pestaña no está visible.
  document.addEventListener('visibilitychange', () => audio.setSuspended(document.hidden));

  // Ganchos de depuración/pruebas (no recopilan datos).
  window.__GMD__ = { game };

  document.getElementById('loading')?.classList.add('hidden');
}

start();
