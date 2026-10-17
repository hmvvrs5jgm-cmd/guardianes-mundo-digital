import { FONT } from '../config.js';
import { save } from '../systems/SaveManager.js';

export function textScale() {
  return save.settings.textSize === 'large' ? 1.15 : 1;
}

// Texto nítido con la fuente del juego.
export function makeText(scene, x, y, str, opts = {}) {
  const {
    size = 24, color = '#f4fffb', weight = '700', align = 'left', wrap = 0,
    stroke = null, strokeThickness = 0, shadow = false, scaleWithSetting = false, lineSpacing = 0
  } = opts;
  const px = Math.round(size * (scaleWithSetting ? textScale() : 1));
  const style = {
    fontFamily: FONT,
    fontSize: `${px}px`,
    fontStyle: weight,
    color,
    align,
    lineSpacing,
    resolution: Math.min(2, Math.max(1, window.devicePixelRatio || 1))
  };
  if (wrap) style.wordWrap = { width: wrap, useAdvancedWrap: true };
  if (stroke) { style.stroke = stroke; style.strokeThickness = strokeThickness || 4; }
  const t = scene.add.text(x, y, str, style);
  if (shadow) t.setShadow(0, 3, 'rgba(0,0,0,0.45)', 4, true, true);
  return t;
}

// Panel redondeado con borde y brillo superior.
export function drawPanel(g, x, y, w, h, opts = {}) {
  const { fill = 0x10343d, alpha = 0.96, border = 0x2fd6b5, radius = 22, borderWidth = 4, glow = true } = opts;
  g.fillStyle(0x000000, 0.28);
  g.fillRoundedRect(x + 4, y + 8, w, h, radius);
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x, y, w, h, radius);
  if (glow) {
    g.fillStyle(0xffffff, 0.06);
    g.fillRoundedRect(x + 6, y + 6, w - 12, Math.min(h * 0.4, 60), Math.max(4, radius - 6));
  }
  if (borderWidth) {
    g.lineStyle(borderWidth, border, 1);
    g.strokeRoundedRect(x, y, w, h, radius);
  }
}

export function overlay(scene, alpha = 0.6) {
  const { width, height } = scene.scale;
  const r = scene.add.rectangle(width / 2, height / 2, width, height, 0x061a1e, alpha);
  r.setInteractive(); // bloquea clics al juego de abajo
  return r;
}

export function reducedMotion() {
  return save.settings.reducedMotion === true;
}

export function fadeTo(scene, key, data, ms = 450) {
  if (scene._leaving) return;
  scene._leaving = true;
  scene.cameras.main.fadeOut(ms, 6, 26, 30);
  scene.cameras.main.once('camerafadeoutcomplete', () => {
    scene.scene.start(key, data);
  });
}
