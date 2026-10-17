// Configuración global del juego. Los contenidos pedagógicos viven en src/data/*.json.

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const FONT = '"Baloo 2", "Trebuchet MS", "Segoe UI", sans-serif';

export const COLORS = {
  ink: '#16303a',
  inkHex: 0x16303a,
  white: '#ffffff',
  text: '#f4fffb',
  textDark: '#16303a',
  teal: 0x2fd6b5,
  tealDark: 0x138a7a,
  gold: 0xf6c945,
  goldDark: 0xc9921b,
  green: 0x5fd068,
  coral: 0xff8a65,
  violet: 0x8f6bff,
  panel: 0x10343d,
  panelLight: 0x1c4f5a,
  overlay: 0x061a1e,
  success: 0x4cd38a,
  warning: 0xffb347
};

export const PHYSICS = {
  gravity: 1400,
  walkSpeed: 240,
  runSpeed: 360,
  accelGround: 2400,
  accelAir: 1600,
  dragGround: 2600,
  jumpVelocity: 650,
  jumpCutMultiplier: 0.45,
  coyoteMs: 120,
  jumpBufferMs: 140,
  runAfterMs: 650,
  maxFallSpeed: 900
};

export const PLAYER = {
  maxHearts: 3,
  invulnerableMs: 1300
};

export const SAVE_KEY = 'gmd_progress';
export const SETTINGS_KEY = 'gmd_settings';
export const SAVE_VERSION = 1;

// Niveles del juego. sceneKey debe coincidir con la clave de la escena.
export const LEVELS = [
  { id: 1, sceneKey: 'Level1Scene', name: 'El Bosque de las Señales', crystal: 'crystal_knowledge', badge: 'badge_explorer', color: 0x2fd6b5 },
  { id: 2, sceneKey: 'Level2Scene', name: 'El Laberinto de las Trampas', crystal: 'crystal_protection', badge: 'badge_protector', color: 0x8f6bff },
  { id: 3, sceneKey: 'Level3Scene', name: 'La Fortaleza de los Secretos', crystal: 'crystal_trust', badge: 'badge_guardian', color: 0xf6c945 }
];

// Recursos gráficos o de audio externos (opcional).
// Cuando existan ilustraciones profesionales, añádelas aquí con la MISMA clave
// que usa el generador procedural; BootScene las cargará y el generador
// dejará de dibujar esa textura. Ejemplo:
//   { type: 'image', key: 'bg_l1_sky', url: 'assets/backgrounds/bosque_cielo.png' }
//   { type: 'image', key: 'item_lupa', url: 'assets/items/lupa.png' }
export const EXTERNAL_ASSETS = [];
