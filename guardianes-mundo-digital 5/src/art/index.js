import { buildCharacters, buildAlex } from './characters.js';
import { buildBackgrounds, buildForestProps, buildCommonFx } from './environment.js';
import { buildItems, buildUI } from './items.js';
import { buildLevel2Props } from './level2.js';
import { buildLevel3Props } from './level3.js';

// Punto único de generación del arte procedural. Si una textura con la misma
// clave ya fue cargada desde public/assets (EXTERNAL_ASSETS), no se redibuja.

export function buildCoreArt(scene, avatar) {
  buildCommonFx(scene);
  buildUI(scene);
  buildItems(scene);
  buildCharacters(scene);
  buildAlex(scene, avatar);
}

export function buildLevelArt(scene, level) {
  buildBackgrounds(scene, level);
  buildForestProps(scene, level);
  if (level === 2) buildLevel2Props(scene);
  if (level === 3) buildLevel3Props(scene);
}

export { buildAlex };
