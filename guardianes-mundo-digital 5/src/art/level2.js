import { canvasTexture, rr, circle, ellipse, fillStroke, glow, star, line, linGrad, radGrad, hexA, OUTLINE, rng } from './draw.js';

// Elementos propios del Laberinto de las Trampas (nivel 2).
export function buildLevel2Props(scene) {
  // Bloque tecnológico del laberinto (repetible)
  canvasTexture(scene, 'block_l2', 64, 64, (ctx) => {
    ctx.fillStyle = linGrad(ctx, 0, 0, 64, 64, [[0, '#3b3a8a'], [1, '#2a2766']]);
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#1a1745'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, 61, 61);
    ctx.strokeStyle = hexA('#6ff7e0', 0.55); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(10, 54); ctx.lineTo(10, 30); ctx.lineTo(30, 30); ctx.lineTo(30, 12); ctx.lineTo(54, 12); ctx.stroke();
    circle(ctx, 54, 12, 3); ctx.fillStyle = '#6ff7e0'; ctx.fill();
    circle(ctx, 10, 54, 3); ctx.fillStyle = '#b07bff'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(3, 3, 58, 8);
  });

  // Portal del premio (Glitch)
  canvasTexture(scene, 'prize_portal', 200, 240, (ctx) => {
    const r = rng(12);
    glow(ctx, 100, 120, 110, '#f6c945', 0.45);
    ellipse(ctx, 100, 120, 70, 100);
    ctx.fillStyle = radGrad(ctx, 100, 120, 5, 100, [[0, '#ffffff'], [0.4, '#ffe36e'], [1, '#b07bff']]); ctx.fill();
    ctx.lineWidth = 12; ctx.strokeStyle = '#f6c945'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = OUTLINE; ellipse(ctx, 100, 120, 76, 106); ctx.stroke();
    for (let i = 0; i < 40; i++) { ctx.fillStyle = ['#8f4bff', '#ff7ad9', '#6ff7e0'][i % 3]; ctx.fillRect(30 + r() * 140, 20 + r() * 200, 6, 6); }
    for (let i = 0; i < 6; i++) { star(ctx, 30 + r() * 140, 20 + r() * 200, 5, 9, 4); fillStroke(ctx, '#fff3a0', OUTLINE, 1.5); }
  });

  // Portal engañoso que bloquea el camino
  canvasTexture(scene, 'fake_portal', 140, 260, (ctx) => {
    const r = rng(33);
    glow(ctx, 70, 130, 80, '#b07bff', 0.5);
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const rad = 1 + (i % 2 ? 0.08 : -0.04);
      const x = 70 + Math.cos(a) * 52 * rad, y = 130 + Math.sin(a) * 118 * rad;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = radGrad(ctx, 70, 130, 5, 118, [[0, '#ff7ad9'], [0.5, '#7136e0'], [1, '#2a1060']]); ctx.fill();
    ctx.strokeStyle = '#d9c2ff'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 50; i++) { ctx.fillStyle = r() > 0.5 ? '#6ff7e0' : '#fff3a0'; ctx.fillRect(25 + r() * 90, 20 + r() * 220, 5, 5); }
  });

  // Cadenas de presión
  canvasTexture(scene, 'chains', 110, 300, (ctx) => {
    glow(ctx, 55, 150, 80, '#ff7ad9', 0.25);
    for (const x of [28, 82]) {
      for (let y = 6; y < 300; y += 26) {
        ellipse(ctx, x, y + 12, 9, 14); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 8; ctx.stroke();
        ctx.strokeStyle = (y / 26) % 2 ? '#b07bff' : '#d9c2ff'; ctx.lineWidth = 5; ctx.stroke();
      }
    }
    for (let y = 40; y < 300; y += 70) { line(ctx, 10, y, 100, y + 20, OUTLINE, 9); line(ctx, 10, y, 100, y + 20, '#c9a6ff', 5); }
    rr(ctx, 35, 130, 40, 34, 6); fillStroke(ctx, '#ff7ad9', OUTLINE, 2.5);
    ctx.beginPath(); ctx.arc(55, 130, 11, Math.PI, 0); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 5; ctx.stroke();
    circle(ctx, 55, 146, 4); ctx.fillStyle = OUTLINE; ctx.fill();
  });

  // Burbuja de mensaje hiriente (sin palabras ofensivas: solo símbolos)
  canvasTexture(scene, 'msg_bubble', 64, 50, (ctx) => {
    rr(ctx, 4, 4, 56, 32, 12); fillStroke(ctx, '#d6dde6', OUTLINE, 2.5);
    ctx.beginPath(); ctx.moveTo(16, 34); ctx.lineTo(12, 46); ctx.lineTo(26, 35); ctx.closePath(); fillStroke(ctx, '#d6dde6', OUTLINE, 2.5);
    rr(ctx, 6, 6, 52, 28, 11); ctx.fillStyle = '#d6dde6'; ctx.fill();
    ctx.fillStyle = '#5a3d7a'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('#@!', 32, 21);
  });
  canvasTexture(scene, 'kind_bubble', 64, 50, (ctx) => {
    rr(ctx, 4, 4, 56, 32, 12); fillStroke(ctx, '#fff3c4', OUTLINE, 2.5);
    ctx.beginPath(); ctx.moveTo(16, 34); ctx.lineTo(12, 46); ctx.lineTo(26, 35); ctx.closePath(); fillStroke(ctx, '#fff3c4', OUTLINE, 2.5);
    rr(ctx, 6, 6, 52, 28, 11); ctx.fillStyle = '#fff3c4'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(32, 30); ctx.bezierCurveTo(20, 22, 24, 10, 32, 16); ctx.bezierCurveTo(40, 10, 44, 22, 32, 30); ctx.fillStyle = '#ff7aa8'; ctx.fill();
  });

  // Aura de la Capa de Privacidad
  canvasTexture(scene, 'cape_aura', 140, 160, (ctx) => {
    ellipse(ctx, 70, 80, 60, 74);
    ctx.fillStyle = radGrad(ctx, 70, 80, 20, 74, [[0, 'rgba(110,180,255,0)'], [0.75, 'rgba(110,180,255,0.18)'], [1, 'rgba(160,210,255,0.7)']]);
    ctx.fill();
  });
}
