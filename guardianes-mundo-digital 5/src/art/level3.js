import { canvasTexture, rr, circle, ellipse, fillStroke, glow, star, line, linGrad, radGrad, hexA, OUTLINE } from './draw.js';

// Elementos propios de la Fortaleza de los Secretos (nivel 3).
export function buildLevel3Props(scene) {
  // Piedra de la fortaleza con ribete dorado
  canvasTexture(scene, 'block_l3', 64, 64, (ctx) => {
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, 64, [[0, '#4d6488'], [1, '#3a4e6e']]);
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#2a3852'; ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 61, 29); ctx.strokeRect(-30, 32.5, 61, 30); ctx.strokeRect(32, 32.5, 61, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(3, 3, 58, 6); ctx.fillRect(3, 35, 58, 5);
    circle(ctx, 48, 16, 2.5); ctx.fillStyle = hexA('#5ff0b8', 0.8); ctx.fill();
  });

  // Puerta monumental (cerrada)
  canvasTexture(scene, 'gate_l3', 170, 320, (ctx) => {
    glow(ctx, 85, 170, 110, '#f6c945', 0.25);
    ctx.beginPath(); ctx.moveTo(10, 320); ctx.lineTo(10, 90); ctx.arc(85, 90, 75, Math.PI, 0); ctx.lineTo(160, 320); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 0, 0, 170, 0, [[0, '#13695a'], [0.5, '#1f9a80'], [1, '#13695a']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#f6c945'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(22, 316); ctx.lineTo(22, 94); ctx.arc(85, 94, 63, Math.PI, 0); ctx.lineTo(148, 316); ctx.stroke();
    line(ctx, 85, 30, 85, 316, '#0e4d42', 4);
    for (const y of [130, 210, 280]) { line(ctx, 22, y, 148, y, '#f6c945', 4); for (const x of [40, 130]) { circle(ctx, x, y, 4); ctx.fillStyle = '#fff3a0'; ctx.fill(); } }
    // cerradura mágica
    glow(ctx, 85, 170, 30, '#5ff0b8', 0.9);
    circle(ctx, 85, 165, 18); fillStroke(ctx, '#f6c945', OUTLINE, 3);
    circle(ctx, 85, 160, 6); ctx.fillStyle = OUTLINE; ctx.fill();
    ctx.beginPath(); ctx.moveTo(81, 162); ctx.lineTo(89, 162); ctx.lineTo(87, 176); ctx.lineTo(83, 176); ctx.closePath(); ctx.fill();
  });

  // Placas de presión (paso 1 y paso 2)
  const plate = (lit) => (ctx) => {
    if (lit) glow(ctx, 50, 18, 46, '#5ff0b8', 0.9);
    ellipse(ctx, 50, 24, 44, 10); fillStroke(ctx, '#3a4e6e', OUTLINE, 2.5);
    ellipse(ctx, 50, 20, 34, 7); fillStroke(ctx, lit ? '#b6ffe6' : '#6d7f9a', OUTLINE, 2);
    star(ctx, 50, 20, 4, 6, 2); ctx.fillStyle = lit ? '#ffffff' : '#9aa7ba'; ctx.fill();
  };
  canvasTexture(scene, 'plate_off', 100, 36, plate(false));
  canvasTexture(scene, 'plate_on', 100, 36, plate(true));

  // Consola de verificación
  canvasTexture(scene, 'console', 90, 120, (ctx) => {
    rr(ctx, 25, 50, 40, 70, 6); fillStroke(ctx, '#3a4e6e');
    ctx.beginPath(); ctx.moveTo(5, 20); ctx.lineTo(85, 20); ctx.lineTo(75, 56); ctx.lineTo(15, 56); ctx.closePath(); fillStroke(ctx, '#4d6488');
    rr(ctx, 18, 26, 54, 22, 4); ctx.fillStyle = '#0d2a3a'; ctx.fill();
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { rr(ctx, 24 + i * 16, 29 + j * 9, 11, 6, 2); ctx.fillStyle = '#5ff0b8'; ctx.fill(); }
    circle(ctx, 45, 82, 9); fillStroke(ctx, '#f6c945', OUTLINE, 2);
  });

  // Pilares del Consejo
  const pillar = (lit) => (ctx) => {
    if (lit) glow(ctx, 40, 30, 40, '#f6c945', 0.9);
    rr(ctx, 18, 50, 44, 160, 6); ctx.fillStyle = linGrad(ctx, 18, 0, 62, 0, [[0, '#4d6488'], [0.5, '#7d90b0'], [1, '#4d6488']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    rr(ctx, 10, 40, 60, 14, 4); fillStroke(ctx, '#5a6f92');
    rr(ctx, 10, 206, 60, 14, 4); fillStroke(ctx, '#5a6f92');
    ctx.beginPath(); ctx.moveTo(40, 6); ctx.lineTo(54, 24); ctx.lineTo(40, 42); ctx.lineTo(26, 24); ctx.closePath();
    fillStroke(ctx, lit ? '#fff1a0' : '#6d7f9a', OUTLINE, 2.2);
  };
  canvasTexture(scene, 'pillar_off', 80, 222, pillar(false));
  canvasTexture(scene, 'pillar_on', 80, 222, pillar(true));

  // Corazón de la Fortaleza
  canvasTexture(scene, 'fortress_heart', 240, 200, (ctx) => {
    glow(ctx, 120, 80, 120, '#f6c945', 0.35);
    rr(ctx, 30, 160, 180, 36, 10); fillStroke(ctx, '#3a4e6e');
    ctx.beginPath(); ctx.moveTo(60, 162); ctx.lineTo(80, 90); ctx.lineTo(160, 90); ctx.lineTo(180, 162); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 60, 0, 180, 0, [[0, '#4d6488'], [0.5, '#7d90b0'], [1, '#4d6488']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke();
    for (const [x, c] of [[95, '#3fe0a0'], [120, '#8f6bff'], [145, '#f6c945']]) {
      ctx.beginPath(); ctx.moveTo(x, 104); ctx.lineTo(x + 8, 118); ctx.lineTo(x, 140); ctx.lineTo(x - 8, 118); ctx.closePath();
      ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.stroke();
    }
  });
}
