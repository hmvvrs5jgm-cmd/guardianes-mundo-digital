import { canvasTexture, rr, circle, ellipse, fillStroke, glow, star, line, linGrad, radGrad, shade, OUTLINE, rng } from './draw.js';

// ---------- Paletas de personalización de Alex ----------
export const SKINS = ['#fbe0c6', '#f1c6a0', '#dca677', '#bd8152', '#94603b', '#6a4026'];
export const HAIRS = ['#3a2416', '#7a4520', '#e0a83a', '#1b1b24', '#c4562f', '#7d4bc4'];
export const OUTFITS = [
  { main: '#2fd6b5', dark: '#16917f', name: 'Turquesa' },
  { main: '#ff8a65', dark: '#c5583a', name: 'Coral' },
  { main: '#6c8cff', dark: '#3e56c2', name: 'Azul' },
  { main: '#f6c945', dark: '#c18f1c', name: 'Dorado' },
  { main: '#b07bff', dark: '#7a4cc9', name: 'Violeta' },
  { main: '#5fd068', dark: '#2f9a3d', name: 'Verde' }
];
export const HAIR_STYLES = ['Puntas', 'Rizos', 'Coleta'];

const deg = (d) => (d * Math.PI) / 180;

function limb(ctx, x, y, angleDeg, len, width, color) {
  const a = deg(angleDeg);
  const ex = x + Math.sin(a) * len;
  const ey = y + Math.cos(a) * len;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = width + 4;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  return [ex, ey];
}

function drawAlexHairBack(ctx, style, hair, swing) {
  if (style === 2) {
    ctx.save();
    ctx.translate(-16, -84);
    ctx.rotate(deg(-25 + swing));
    ellipse(ctx, -6, 10, 8, 15, 0.2);
    fillStroke(ctx, hair);
    ctx.restore();
  }
}

function drawAlexHairFront(ctx, style, hair) {
  const hx = 2, hy = -74;
  const hl = shade(hair, 0.25);
  if (style === 0) {
    ctx.beginPath();
    ctx.moveTo(hx - 21, hy + 2);
    ctx.lineTo(hx - 23, hy - 12);
    ctx.lineTo(hx - 15, hy - 22);
    ctx.lineTo(hx - 10, hy - 30);
    ctx.lineTo(hx - 2, hy - 24);
    ctx.lineTo(hx + 4, hy - 31);
    ctx.lineTo(hx + 10, hy - 22);
    ctx.lineTo(hx + 19, hy - 24);
    ctx.lineTo(hx + 20, hy - 13);
    ctx.lineTo(hx + 24, hy - 6);
    ctx.lineTo(hx + 15, hy - 9);
    ctx.lineTo(hx + 9, hy - 13);
    ctx.lineTo(hx + 3, hy - 8);
    ctx.lineTo(hx - 5, hy - 12);
    ctx.lineTo(hx - 11, hy - 6);
    ctx.lineTo(hx - 14, hy + 4);
    ctx.closePath();
    fillStroke(ctx, hair);
    line(ctx, hx - 8, hy - 22, hx - 2, hy - 18, hl, 2.5);
  } else if (style === 1) {
    const pts = [[-19, -2, 9], [-18, -12, 9], [-12, -20, 9], [-3, -24, 9], [7, -23, 9], [15, -19, 8], [21, -14, 6], [-14, 4, 8], [0, -14, 12], [4, -16, 6], [12, -16, 6], [19, -11, 4]];
    // silueta: primero el contorno, luego el relleno, para que no se vean líneas internas
    for (const [px, py, r] of pts) { circle(ctx, hx + px, hy + py, r + 2.5); ctx.fillStyle = OUTLINE; ctx.fill(); }
    for (const [px, py, r] of pts) { circle(ctx, hx + px, hy + py, r); ctx.fillStyle = hair; ctx.fill(); }
    ctx.strokeStyle = shade(hair, -0.25); ctx.lineWidth = 1.6;
    for (const [px, py] of [[-12, -18], [2, -22], [12, -20], [-16, -6]]) { ctx.beginPath(); ctx.arc(hx + px, hy + py, 4, 0.5, 2.6); ctx.stroke(); }
    circle(ctx, hx - 4, hy - 18, 3); ctx.fillStyle = hl; ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(hx, hy - 1, 22.5, Math.PI * 0.95, Math.PI * 2.02);
    ctx.lineTo(hx + 20, hy - 6);
    ctx.quadraticCurveTo(hx + 10, hy - 16, hx - 2, hy - 10);
    ctx.quadraticCurveTo(hx - 12, hy - 8, hx - 16, hy + 2);
    ctx.closePath();
    fillStroke(ctx, hair);
    line(ctx, hx - 6, hy - 18, hx + 4, hy - 20, hl, 2.5);
    // moño
    circle(ctx, hx - 19, hy - 9, 4.5);
    fillStroke(ctx, '#ff7aa8', OUTLINE, 2);
  }
}

function drawAlexFace(ctx, eyes, mouth) {
  const ey = -74;
  const ink = '#1d2430';
  if (eyes === 'blink') {
    line(ctx, 3, ey, 9, ey, ink, 2.5);
    line(ctx, 13, ey, 19, ey, ink, 2.5);
  } else if (eyes === 'happy') {
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(6, ey + 1, 3.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(16, ey + 1, 3.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  } else if (eyes === 'squint') {
    line(ctx, 3, ey - 2, 9, ey + 1, ink, 2.5);
    line(ctx, 19, ey - 2, 13, ey + 1, ink, 2.5);
  } else {
    ellipse(ctx, 6, ey, 2.8, 3.8); ctx.fillStyle = ink; ctx.fill();
    ellipse(ctx, 16, ey, 2.8, 3.8); ctx.fillStyle = ink; ctx.fill();
    circle(ctx, 7, ey - 1.5, 1.1); ctx.fillStyle = '#fff'; ctx.fill();
    circle(ctx, 17, ey - 1.5, 1.1); ctx.fillStyle = '#fff'; ctx.fill();
  }
  // mejillas
  ellipse(ctx, 1, ey + 7, 3.5, 2.2); ctx.fillStyle = 'rgba(255,120,130,0.45)'; ctx.fill();
  ellipse(ctx, 20, ey + 7, 3, 2); ctx.fill();
  // boca
  ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
  if (mouth === 'open') {
    ctx.beginPath(); ctx.arc(12, ey + 9, 4, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = '#7a2b35'; ctx.fill(); ctx.stroke();
  } else if (mouth === 'o') {
    ellipse(ctx, 12, ey + 10, 2.2, 2.8); ctx.fillStyle = '#7a2b35'; ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(12, ey + 7, 4.2, deg(20), deg(160)); ctx.stroke();
  }
}

export function drawAlex(ctx, avatar, pose = {}) {
  const skin = SKINS[avatar.skin] ?? SKINS[1];
  const hair = HAIRS[avatar.hair] ?? HAIRS[0];
  const outfit = OUTFITS[avatar.outfit] ?? OUTFITS[0];
  const style = avatar.hairStyle ?? 0;
  const { legF = 0, legB = 0, armF = 0, armB = 0, bob = 0, lean = 0, eyes = 'open', mouth = 'smile', hairSwing = 0 } = pose;
  const pants = '#33435a';

  ctx.save();
  ctx.rotate(deg(lean));
  ctx.translate(0, -bob);

  // pierna trasera y brazo trasero
  const [bx, by] = limb(ctx, -4, -34, legB, 24, 10, shade(pants, -0.2));
  ellipse(ctx, bx + 4, by - 1, 8, 5); fillStroke(ctx, '#273241');
  limb(ctx, -10, -52, armB, 19, 8, outfit.dark);

  drawAlexHairBack(ctx, style, hair, hairSwing);

  // torso (sudadera de guardián)
  rr(ctx, -15, -60, 30, 30, 11);
  ctx.fillStyle = linGrad(ctx, 0, -60, 0, -30, [[0, shade(outfit.main, 0.15)], [1, outfit.main]]);
  ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  rr(ctx, -15, -38, 30, 8, 4); ctx.fillStyle = outfit.dark; ctx.fill();
  // emblema
  ctx.beginPath();
  ctx.moveTo(5, -54); ctx.lineTo(10, -48); ctx.lineTo(5, -41); ctx.lineTo(0, -48); ctx.closePath();
  fillStroke(ctx, '#d9fff6', OUTLINE, 1.6);
  // capucha
  ctx.beginPath(); ctx.arc(-6, -58, 9, Math.PI, Math.PI * 2); fillStroke(ctx, outfit.dark, OUTLINE, 2);

  // pierna delantera
  const [fx, fy] = limb(ctx, 5, -34, legF, 24, 10, pants);
  ellipse(ctx, fx + 4, fy - 1, 8.5, 5.2); fillStroke(ctx, '#2c3646');
  line(ctx, fx - 2, fy + 2, fx + 10, fy + 2, '#e8f4f2', 1.6);

  // cabeza
  circle(ctx, -9, -72, 5); fillStroke(ctx, skin);
  circle(ctx, 2, -74, 21);
  ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  drawAlexFace(ctx, eyes, mouth);
  drawAlexHairFront(ctx, style, hair);
  // comunicador de guardián
  circle(ctx, -10, -71, 3.2); fillStroke(ctx, '#6ff7e0', OUTLINE, 1.6);

  // brazo delantero
  const [hx, hy] = limb(ctx, 10, -52, armF, 19, 8, outfit.main);
  circle(ctx, hx, hy, 5); fillStroke(ctx, skin, OUTLINE, 2);
  ctx.restore();
}

export const ALEX_W = 84;
export const ALEX_H = 112;

const ALEX_FRAMES = (() => {
  const f = {};
  f.idle = [0, 1, 2, 2, 1, 0].map((b, i) => ({ bob: b * 0.7, armF: 6, armB: -6, legF: 4, legB: -4, eyes: i === 4 ? 'blink' : 'open' }));
  f.walk = Array.from({ length: 6 }, (_, i) => {
    const p = (i / 6) * Math.PI * 2;
    const a = Math.sin(p) * 30;
    return { legF: a, legB: -a, armF: -a * 0.9, armB: a * 0.9, bob: Math.abs(Math.cos(p)) * 2.2, hairSwing: Math.sin(p) * 6 };
  });
  f.run = Array.from({ length: 6 }, (_, i) => {
    const p = (i / 6) * Math.PI * 2;
    const a = Math.sin(p) * 46;
    return { legF: a, legB: -a, armF: -a * 1.2, armB: a * 1.2, bob: Math.abs(Math.cos(p)) * 3.5, lean: 8, mouth: 'open', hairSwing: -10 + Math.sin(p) * 6 };
  });
  f.jump = [{ legF: 38, legB: -22, armF: 112, armB: -140, mouth: 'open', hairSwing: 14 }];
  f.fall = [{ legF: 12, legB: -14, armF: 100, armB: -100, mouth: 'o', hairSwing: -14 }];
  f.interact = [{ armF: 75, armB: -10, legF: 6, legB: -6, eyes: 'happy' }, { armF: 95, armB: -10, legF: 6, legB: -6, eyes: 'happy', mouth: 'open' }];
  f.hurt = [{ legF: -10, legB: 14, armF: -40, armB: 40, lean: -8, eyes: 'squint', mouth: 'o' }];
  f.cheer = [{ armF: 112, armB: -155, eyes: 'happy', mouth: 'open', bob: 4 }, { armF: 98, armB: -140, eyes: 'happy', mouth: 'open', bob: 0 }];
  return f;
})();

// Genera todas las texturas y animaciones de Alex para una apariencia.
// scale > 1 genera texturas en alta resolución para vistas ampliadas (menú, retratos).
export function buildAlex(scene, avatar, prefix = 'alex', scale = 1) {
  const anims = { idle: [5, -1], walk: [12, -1], run: [15, -1], jump: [1, 0], fall: [1, 0], interact: [6, 0], hurt: [1, 0], cheer: [5, -1] };
  for (const [name, list] of Object.entries(ALEX_FRAMES)) {
    list.forEach((pose, i) => {
      canvasTexture(scene, `${prefix}_${name}_${i}`, Math.ceil(ALEX_W * scale), Math.ceil(ALEX_H * scale), (ctx) => {
        ctx.scale(scale, scale);
        ctx.translate(ALEX_W / 2 - 2, ALEX_H - 6);
        drawAlex(ctx, avatar, pose);
      }, true);
    });
    const key = `${prefix}_${name}`;
    if (scene.anims.exists(key)) scene.anims.remove(key);
    scene.anims.create({
      key,
      frames: list.map((_, i) => ({ key: `${prefix}_${name}_${i}` })),
      frameRate: anims[name][0],
      repeat: anims[name][1]
    });
  }
  // retrato
  canvasTexture(scene, `portrait_${prefix}`, 150, 150, (ctx) => {
    ctx.translate(72, 250);
    ctx.scale(2.3, 2.3);
    drawAlex(ctx, avatar, { eyes: 'open', armF: 10, armB: -10 });
  }, true);
}

// ---------- Bit ----------
export function drawBit(ctx, emotion = 'neutral', cx = 32, cy = 30, thruster = 1) {
  glow(ctx, cx, cy, 30, '#6ff7e0', 0.35);
  // propulsor
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy + 16);
  ctx.quadraticCurveTo(cx, cy + 16 + 16 * thruster, cx + 7, cy + 16);
  ctx.closePath();
  ctx.fillStyle = linGrad(ctx, 0, cy + 14, 0, cy + 34, [[0, 'rgba(160,255,240,0.95)'], [1, 'rgba(47,214,181,0)']]);
  ctx.fill();
  // aletas
  ellipse(ctx, cx - 19, cy + 2, 5, 8, -0.3); fillStroke(ctx, '#2fd6b5', OUTLINE, 2);
  ellipse(ctx, cx + 19, cy + 2, 5, 8, 0.3); fillStroke(ctx, '#2fd6b5', OUTLINE, 2);
  // antena
  line(ctx, cx, cy - 18, cx + 2, cy - 27, OUTLINE, 3);
  glow(ctx, cx + 2, cy - 28, 9, '#f6c945', 0.7);
  circle(ctx, cx + 2, cy - 28, 3.8); fillStroke(ctx, '#f6c945', OUTLINE, 1.8);
  // cuerpo
  circle(ctx, cx, cy, 19);
  ctx.fillStyle = radGrad(ctx, cx - 6, cy - 8, 2, 24, [[0, '#ffffff'], [0.6, '#d6f4ff'], [1, '#8fcfe6']]);
  ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  // pantalla
  rr(ctx, cx - 13, cy - 8, 26, 17, 7); fillStroke(ctx, '#10283a', OUTLINE, 2);
  const eye = '#6ff7e0';
  ctx.fillStyle = eye; ctx.strokeStyle = eye; ctx.lineWidth = 2.6;
  if (emotion === 'happy') {
    ctx.beginPath(); ctx.arc(cx - 6, cy + 1.5, 3.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 6, cy + 1.5, 3.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy + 3, 2.5, 0.1, Math.PI - 0.1); ctx.stroke();
  } else if (emotion === 'surprised') {
    circle(ctx, cx - 6, cy, 3.6); ctx.fill();
    circle(ctx, cx + 6, cy, 3.6); ctx.fill();
    circle(ctx, cx, cy + 5.5, 1.6); ctx.fill();
  } else if (emotion === 'think') {
    line(ctx, cx - 9, cy, cx - 3, cy, eye, 2.6);
    circle(ctx, cx + 6, cy, 3); ctx.fill();
    line(ctx, cx - 2, cy + 5, cx + 3, cy + 4, eye, 2);
  } else {
    rr(ctx, cx - 8, cy - 3.5, 4.5, 7, 2); ctx.fill();
    rr(ctx, cx + 3.5, cy - 3.5, 4.5, 7, 2); ctx.fill();
  }
  // brillo
  ellipse(ctx, cx - 9, cy - 12, 4, 2.2, -0.5); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
}

// ---------- Luma (guardiana búho de luz) ----------
export function drawLuma(ctx, cx = 60, cy = 70, blink = false) {
  glow(ctx, cx, cy - 6, 64, '#f6e7a1', 0.45);
  // alas
  ellipse(ctx, cx - 30, cy + 8, 13, 26, 0.35); fillStroke(ctx, '#a99be8');
  ellipse(ctx, cx + 30, cy + 8, 13, 26, -0.35); fillStroke(ctx, '#a99be8');
  line(ctx, cx - 34, cy + 22, cx - 26, cy + 30, '#f6c945', 2.5);
  line(ctx, cx + 34, cy + 22, cx + 26, cy + 30, '#f6c945', 2.5);
  // cuerpo
  ellipse(ctx, cx, cy + 10, 30, 34);
  ctx.fillStyle = linGrad(ctx, 0, cy - 20, 0, cy + 44, [[0, '#f6f3ff'], [1, '#c9c0f4']]);
  ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  // plumas del pecho
  ctx.strokeStyle = 'rgba(150,130,220,0.7)'; ctx.lineWidth = 2;
  for (let r = 0; r < 3; r++) for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.arc(cx + i * 10 + (r % 2) * 5 - 2, cy + 8 + r * 9, 5, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  // orejas
  ctx.beginPath(); ctx.moveTo(cx - 22, cy - 34); ctx.lineTo(cx - 28, cy - 54); ctx.lineTo(cx - 10, cy - 42); ctx.closePath(); fillStroke(ctx, '#d8d0ff');
  ctx.beginPath(); ctx.moveTo(cx + 22, cy - 34); ctx.lineTo(cx + 28, cy - 54); ctx.lineTo(cx + 10, cy - 42); ctx.closePath(); fillStroke(ctx, '#d8d0ff');
  // cabeza
  circle(ctx, cx, cy - 26, 27);
  ctx.fillStyle = linGrad(ctx, 0, cy - 54, 0, cy, [[0, '#ffffff'], [1, '#e2dcff']]);
  ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  // discos faciales
  circle(ctx, cx - 11, cy - 24, 12); fillStroke(ctx, '#fffaf0', 'rgba(190,170,240,0.9)', 2);
  circle(ctx, cx + 11, cy - 24, 12); fillStroke(ctx, '#fffaf0', 'rgba(190,170,240,0.9)', 2);
  // ojos amables
  if (blink) {
    ctx.strokeStyle = '#2b2350'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx - 11, cy - 25, 6, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 11, cy - 25, 6, 0.2, Math.PI - 0.2); ctx.stroke();
  } else {
    circle(ctx, cx - 11, cy - 23, 7.5); ctx.fillStyle = '#2b2350'; ctx.fill();
    circle(ctx, cx + 11, cy - 23, 7.5); ctx.fill();
    circle(ctx, cx - 9, cy - 26, 2.6); ctx.fillStyle = '#fff'; ctx.fill();
    circle(ctx, cx + 13, cy - 26, 2.6); ctx.fill();
    circle(ctx, cx - 13, cy - 20, 1.2); ctx.fill();
    circle(ctx, cx + 9, cy - 20, 1.2); ctx.fill();
    // mejillas amables
    ellipse(ctx, cx - 20, cy - 14, 4, 2.4); ctx.fillStyle = 'rgba(255,140,170,0.55)'; ctx.fill();
    ellipse(ctx, cx + 20, cy - 14, 4, 2.4); ctx.fill();
  }
  // pico
  ctx.beginPath(); ctx.moveTo(cx - 4, cy - 14); ctx.lineTo(cx + 4, cy - 14); ctx.lineTo(cx, cy - 7); ctx.closePath(); fillStroke(ctx, '#f6c945', OUTLINE, 2);
  // estrella
  glow(ctx, cx, cy - 46, 12, '#fff3a0', 0.9);
  star(ctx, cx, cy - 46, 4, 7, 2.5); fillStroke(ctx, '#f6c945', OUTLINE, 1.5);
  // patitas
  ellipse(ctx, cx - 9, cy + 44, 5, 3); fillStroke(ctx, '#f6c945', OUTLINE, 1.8);
  ellipse(ctx, cx + 9, cy + 44, 5, 3); fillStroke(ctx, '#f6c945', OUTLINE, 1.8);
}

// ---------- Tiko (zorrito del bosque) ----------
export function drawTiko(ctx, mood = 'sad', cx = 44, cy = 52) {
  const fur = '#ff9a4d';
  const furDark = '#d9702a';
  // cola
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 20);
  ctx.quadraticCurveTo(cx - 44, cy + 16, cx - 34, cy - 10);
  ctx.quadraticCurveTo(cx - 24, cy + 6, cx - 6, cy + 12);
  ctx.closePath();
  fillStroke(ctx, fur);
  ctx.beginPath(); ctx.moveTo(cx - 34, cy - 10); ctx.quadraticCurveTo(cx - 40, cy - 2, cx - 36, cy + 4); ctx.quadraticCurveTo(cx - 30, cy - 4, cx - 34, cy - 10); fillStroke(ctx, '#fff6ea', OUTLINE, 1.6);
  // cuerpo
  ellipse(ctx, cx, cy + 14, 18, 16); fillStroke(ctx, fur);
  ellipse(ctx, cx + 2, cy + 17, 10, 11); ctx.fillStyle = '#fff6ea'; ctx.fill();
  ellipse(ctx, cx - 8, cy + 29, 6, 4); fillStroke(ctx, furDark, OUTLINE, 2);
  ellipse(ctx, cx + 10, cy + 29, 6, 4); fillStroke(ctx, furDark, OUTLINE, 2);
  // orejas
  const earDrop = mood === 'sad' ? 6 : 0;
  ctx.beginPath(); ctx.moveTo(cx - 16, cy - 16); ctx.lineTo(cx - 22 - earDrop, cy - 40 + earDrop * 2); ctx.lineTo(cx - 4, cy - 24); ctx.closePath(); fillStroke(ctx, fur);
  ctx.beginPath(); ctx.moveTo(cx + 16, cy - 16); ctx.lineTo(cx + 22 + earDrop, cy - 40 + earDrop * 2); ctx.lineTo(cx + 4, cy - 24); ctx.closePath(); fillStroke(ctx, fur);
  ctx.beginPath(); ctx.moveTo(cx - 15, cy - 20); ctx.lineTo(cx - 19 - earDrop, cy - 33 + earDrop * 2); ctx.lineTo(cx - 8, cy - 23); ctx.closePath(); ctx.fillStyle = '#ffd6c2'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + 15, cy - 20); ctx.lineTo(cx + 19 + earDrop, cy - 33 + earDrop * 2); ctx.lineTo(cx + 8, cy - 23); ctx.closePath(); ctx.fill();
  // cabeza
  ellipse(ctx, cx, cy - 8, 21, 18); fillStroke(ctx, fur);
  ctx.beginPath(); ctx.moveTo(cx - 17, cy - 2); ctx.quadraticCurveTo(cx, cy + 16, cx + 17, cy - 2); ctx.quadraticCurveTo(cx, cy + 4, cx - 17, cy - 2); ctx.fillStyle = '#fff6ea'; ctx.fill();
  // cara
  const ink = '#2a1d1a';
  if (mood === 'sad') {
    ellipse(ctx, cx - 8, cy - 8, 2.8, 3.4); ctx.fillStyle = ink; ctx.fill();
    ellipse(ctx, cx + 8, cy - 8, 2.8, 3.4); ctx.fill();
    line(ctx, cx - 13, cy - 13, cx - 5, cy - 16, ink, 2);
    line(ctx, cx + 13, cy - 13, cx + 5, cy - 16, ink, 2);
    ctx.strokeStyle = ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy + 5, 3.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    circle(ctx, cx - 9, cy - 3, 1.6); ctx.fillStyle = 'rgba(120,200,255,0.9)'; ctx.fill();
  } else {
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx - 8, cy - 7, 3.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 8, cy - 7, 3.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy + 1, 4, 0.2, Math.PI - 0.2); ctx.stroke();
    ellipse(ctx, cx - 14, cy - 1, 3, 2); ctx.fillStyle = 'rgba(255,110,120,0.5)'; ctx.fill();
    ellipse(ctx, cx + 14, cy - 1, 3, 2); ctx.fill();
  }
  ellipse(ctx, cx, cy - 1, 3, 2.2); ctx.fillStyle = ink; ctx.fill();
}

// ---------- Glitch (criatura de píxeles traviesa) ----------
export function drawGlitch(ctx, frame = 0, cx = 36, cy = 36, scale = 1) {
  const r = rng(7 + frame * 13);
  const cell = 5 * scale;
  const colors = ['#8f4bff', '#b07bff', '#7136e0', '#c9a6ff'];
  glow(ctx, cx, cy, 34 * scale, '#b07bff', 0.35);
  for (let gy = -6; gy <= 6; gy++) {
    for (let gx = -6; gx <= 6; gx++) {
      const d = Math.hypot(gx, gy * 1.05);
      const edge = 5.6 + r() * 1.4;
      if (d > edge) continue;
      const jitter = d > 4.6 && r() > 0.7 ? (frame ? 1 : -1) * cell * 0.4 : 0;
      ctx.fillStyle = r() > 0.92 ? '#6ff7e0' : colors[Math.floor(r() * colors.length)];
      ctx.fillRect(cx + gx * cell - cell / 2 + jitter, cy + gy * cell - cell / 2, cell - 0.5, cell - 0.5);
    }
  }
  // ojos
  const e = cell;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 3.2 * e, cy - 2 * e, 2 * e, 2.2 * e);
  ctx.fillRect(cx + 1.2 * e, cy - 2 * e, 2 * e, 2.2 * e);
  ctx.fillStyle = '#1a1030';
  ctx.fillRect(cx - 2.2 * e + (frame ? e * 0.5 : 0), cy - 1.2 * e, e, 1.2 * e);
  ctx.fillRect(cx + 2.2 * e + (frame ? e * 0.5 : 0), cy - 1.2 * e, e, 1.2 * e);
  // sonrisa traviesa
  ctx.fillStyle = '#1a1030';
  ctx.fillRect(cx - 2.6 * e, cy + 1.4 * e, 5.2 * e, 0.9 * e);
  ctx.fillRect(cx - 3.2 * e, cy + 0.8 * e, 0.8 * e, 0.8 * e);
  ctx.fillRect(cx + 2.4 * e, cy + 0.8 * e, 0.8 * e, 0.8 * e);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 1.6 * e, cy + 1.4 * e, 0.8 * e, 0.6 * e);
  ctx.fillRect(cx + 0.8 * e, cy + 1.4 * e, 0.8 * e, 0.6 * e);
}

// ---------- Eco (máscaras e ilusiones) ----------
export function drawEco(ctx, cx = 45, cy = 60) {
  glow(ctx, cx, cy, 50, '#ff7ad9', 0.25);
  ctx.beginPath();
  ctx.moveTo(cx, cy - 34);
  ctx.quadraticCurveTo(cx + 34, cy - 10, cx + 30, cy + 40);
  ctx.quadraticCurveTo(cx + 15, cy + 30, cx, cy + 42);
  ctx.quadraticCurveTo(cx - 15, cy + 30, cx - 30, cy + 40);
  ctx.quadraticCurveTo(cx - 34, cy - 10, cx, cy - 34);
  ctx.fillStyle = linGrad(ctx, cx - 30, 0, cx + 30, 0, [[0, '#3fc5d8'], [0.5, '#7a5cff'], [1, '#e468c8']]);
  ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  ellipse(ctx, cx, cy - 14, 17, 20); fillStroke(ctx, '#fff7fb');
  ctx.strokeStyle = '#2b2350'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(cx - 7, cy - 16, 3.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 7, cy - 16, 3.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy - 8, 6, 0.2, Math.PI - 0.2); ctx.stroke();
  star(ctx, cx + 22, cy - 30, 4, 6, 2); fillStroke(ctx, '#ffe36e', OUTLINE, 1.5);
}

// ---------- Nubarrón (nube de mensajes) ----------
export function drawNubarron(ctx, cx = 50, cy = 44) {
  const puff = [[-24, 6, 16], [-10, -6, 20], [10, -10, 22], [26, 2, 17], [0, 10, 20]];
  for (const [x, y, r] of puff) { circle(ctx, cx + x, cy + y, r + 2.5); ctx.fillStyle = OUTLINE; ctx.fill(); }
  for (const [x, y, r] of puff) { circle(ctx, cx + x, cy + y, r); ctx.fillStyle = '#9fb3cf'; ctx.fill(); }
  ellipse(ctx, cx - 4, cy - 12, 14, 7, -0.2); ctx.fillStyle = '#c7d6ea'; ctx.fill();
  ctx.fillStyle = '#2a3346';
  ellipse(ctx, cx - 8, cy + 2, 3, 3.6); ctx.fill();
  ellipse(ctx, cx + 8, cy + 2, 3, 3.6); ctx.fill();
  line(ctx, cx - 13, cy - 5, cx - 4, cy - 3, '#2a3346', 2.4);
  line(ctx, cx + 13, cy - 5, cx + 4, cy - 3, '#2a3346', 2.4);
  ctx.strokeStyle = '#2a3346'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(cx, cy + 14, 4, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
}

// ---------- Eco disfrazado («Estrella_Amistosa») ----------
export function drawEcoMask(ctx, cx = 45, cy = 60) {
  glow(ctx, cx, cy, 50, '#ffe36e', 0.35);
  star(ctx, cx, cy, 5, 40, 20);
  ctx.fillStyle = linGrad(ctx, cx, cy - 40, cx, cy + 40, [[0, '#fff3a0'], [1, '#f6b93b']]);
  ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  // máscara sonriente (el detalle que revela el disfraz)
  ellipse(ctx, cx, cy + 2, 17, 13); fillStroke(ctx, '#ffffff', OUTLINE, 2);
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(cx - 6, cy, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 6, cy, 3.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy + 4, 6, 0.25, Math.PI - 0.25); ctx.stroke();
  line(ctx, cx + 17, cy, cx + 26, cy - 6, '#ff7ad9', 2);
  ellipse(ctx, cx - 10, cy + 6, 3, 2); ctx.fillStyle = 'rgba(255,120,170,0.6)'; ctx.fill();
  ellipse(ctx, cx + 10, cy + 6, 3, 2); ctx.fill();
}

// ---------- Pío (pajarito azul) ----------
export function drawPio(ctx, mood = 'sad', cx = 40, cy = 44) {
  ellipse(ctx, cx - 18, cy + 4, 9, 14, 0.5); fillStroke(ctx, '#3f9ae0');
  circle(ctx, cx, cy, 22);
  ctx.fillStyle = radGrad(ctx, cx - 6, cy - 8, 2, 26, [[0, '#a8e2ff'], [1, '#5ab4f0']]); ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  ellipse(ctx, cx + 2, cy + 8, 12, 10); ctx.fillStyle = '#e6f6ff'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - 2, cy - 21); ctx.quadraticCurveTo(cx + 2, cy - 34, cx + 8, cy - 22); fillStroke(ctx, '#5ab4f0', OUTLINE, 2);
  ctx.beginPath(); ctx.moveTo(cx + 16, cy); ctx.lineTo(cx + 28, cy + 3); ctx.lineTo(cx + 16, cy + 7); ctx.closePath(); fillStroke(ctx, '#ffb347', OUTLINE, 2);
  const ink = '#1d2430';
  if (mood === 'sad') {
    ellipse(ctx, cx + 2, cy - 4, 2.6, 3.2); ctx.fillStyle = ink; ctx.fill();
    ellipse(ctx, cx + 12, cy - 4, 2.6, 3.2); ctx.fill();
    line(ctx, cx - 3, cy - 9, cx + 4, cy - 12, ink, 2); line(ctx, cx + 17, cy - 9, cx + 10, cy - 12, ink, 2);
    circle(ctx, cx + 1, cy + 2, 1.8); ctx.fillStyle = 'rgba(120,200,255,0.95)'; ctx.fill();
  } else {
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx + 2, cy - 3, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 12, cy - 3, 3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ellipse(ctx, cx - 4, cy + 3, 3, 2); ctx.fillStyle = 'rgba(255,120,150,0.6)'; ctx.fill();
  }
  line(ctx, cx - 6, cy + 21, cx - 6, cy + 30, '#ffb347', 3); line(ctx, cx + 6, cy + 21, cx + 6, cy + 30, '#ffb347', 3);
}

export function buildCharacters(scene) {
  ['neutral', 'happy', 'surprised', 'think'].forEach((e) => {
    canvasTexture(scene, `bit_${e}`, 64, 72, (ctx) => drawBit(ctx, e, 32, 34));
    canvasTexture(scene, `portrait_bit_${e}`, 150, 150, (ctx) => { ctx.scale(2.2, 2.2); drawBit(ctx, e, 34, 36, 0.6); });
  });
  canvasTexture(scene, 'bit_thrust', 64, 72, (ctx) => drawBit(ctx, 'neutral', 32, 34, 1.4));
  canvasTexture(scene, 'luma', 124, 132, (ctx) => drawLuma(ctx, 62, 78));
  canvasTexture(scene, 'luma_blink', 124, 132, (ctx) => drawLuma(ctx, 62, 78, true));
  canvasTexture(scene, 'portrait_luma', 150, 150, (ctx) => { ctx.scale(1.6, 1.6); drawLuma(ctx, 47, 72); });
  canvasTexture(scene, 'tiko_sad', 90, 90, (ctx) => drawTiko(ctx, 'sad', 48, 50));
  canvasTexture(scene, 'tiko_happy', 90, 90, (ctx) => drawTiko(ctx, 'happy', 48, 50));
  canvasTexture(scene, 'portrait_tiko', 150, 150, (ctx) => { ctx.scale(1.9, 1.9); drawTiko(ctx, 'sad', 42, 46); });
  canvasTexture(scene, 'portrait_tiko_happy', 150, 150, (ctx) => { ctx.scale(1.9, 1.9); drawTiko(ctx, 'happy', 42, 46); });
  canvasTexture(scene, 'glitch_0', 72, 72, (ctx) => drawGlitch(ctx, 0));
  canvasTexture(scene, 'glitch_1', 72, 72, (ctx) => drawGlitch(ctx, 1));
  canvasTexture(scene, 'portrait_glitch', 150, 150, (ctx) => drawGlitch(ctx, 0, 75, 78, 2));
  canvasTexture(scene, 'eco', 90, 110, (ctx) => drawEco(ctx));
  canvasTexture(scene, 'portrait_eco', 150, 150, (ctx) => { ctx.scale(1.6, 1.6); drawEco(ctx, 47, 58); });
  canvasTexture(scene, 'eco_mask', 90, 110, (ctx) => drawEcoMask(ctx, 45, 62));
  canvasTexture(scene, 'portrait_eco_mask', 150, 150, (ctx) => { ctx.scale(1.6, 1.6); drawEcoMask(ctx, 47, 50); });
  canvasTexture(scene, 'pio_sad', 80, 80, (ctx) => drawPio(ctx, 'sad', 40, 46));
  canvasTexture(scene, 'pio_happy', 80, 80, (ctx) => drawPio(ctx, 'happy', 40, 46));
  canvasTexture(scene, 'portrait_pio', 150, 150, (ctx) => { ctx.scale(2.2, 2.2); drawPio(ctx, 'sad', 32, 36); });
  canvasTexture(scene, 'portrait_nubarron', 150, 150, (ctx) => { ctx.scale(1.4, 1.4); drawNubarron(ctx, 53, 56); });
  canvasTexture(scene, 'nubarron', 100, 80, (ctx) => drawNubarron(ctx));
  if (!scene.anims.exists('glitch_jitter')) {
    scene.anims.create({ key: 'glitch_jitter', frames: [{ key: 'glitch_0' }, { key: 'glitch_1' }], frameRate: 6, repeat: -1 });
  }
}
