import { canvasTexture, rr, circle, ellipse, fillStroke, glow, star, line, linGrad, radGrad, shade, OUTLINE } from './draw.js';

// Íconos de herramientas, cristales, insignias, datos e interfaz.

function gem(ctx, cx, cy, w, h, c1, c2, c3) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy - h / 6);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy - h / 6);
  ctx.closePath();
  ctx.fillStyle = linGrad(ctx, cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2, [[0, c1], [0.5, c2], [1, c3]]);
  ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(cx - w / 2, cy - h / 6); ctx.lineTo(cx + w / 2, cy - h / 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - h / 2); ctx.lineTo(cx - w / 6, cy - h / 6); ctx.lineTo(cx, cy + h / 2); ctx.lineTo(cx + w / 6, cy - h / 6); ctx.closePath(); ctx.stroke();
}

const CRYSTALS = {
  crystal_knowledge: ['#e9fff2', '#3fe0a0', '#e5c040'],
  crystal_protection: ['#efe6ff', '#8f6bff', '#3fb5e0'],
  crystal_trust: ['#fff6e0', '#f6c945', '#ff8aa8']
};

function medal(ctx, color, drawSymbol) {
  // cintas
  ctx.beginPath(); ctx.moveTo(22, 4); ctx.lineTo(32, 26); ctx.lineTo(26, 30); ctx.lineTo(14, 8); ctx.closePath(); fillStroke(ctx, '#ff8a65', OUTLINE, 2);
  ctx.beginPath(); ctx.moveTo(42, 4); ctx.lineTo(32, 26); ctx.lineTo(38, 30); ctx.lineTo(50, 8); ctx.closePath(); fillStroke(ctx, '#4aa8ff', OUTLINE, 2);
  glow(ctx, 32, 40, 26, color, 0.4);
  circle(ctx, 32, 40, 20); ctx.fillStyle = radGrad(ctx, 26, 34, 2, 22, [[0, shade(color, 0.5)], [1, color]]); ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
  circle(ctx, 32, 40, 15); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  drawSymbol(ctx);
}

export function buildItems(scene) {
  // Lupa de la Verdad
  canvasTexture(scene, 'item_lupa', 64, 64, (ctx) => {
    glow(ctx, 26, 26, 30, '#7ff5dc', 0.4);
    line(ctx, 38, 38, 56, 56, OUTLINE, 12);
    line(ctx, 38, 38, 56, 56, '#c18f1c', 8);
    circle(ctx, 26, 26, 18); fillStroke(ctx, '#f6c945', OUTLINE, 2.5);
    circle(ctx, 26, 26, 13);
    ctx.fillStyle = radGrad(ctx, 22, 22, 1, 14, [[0, '#ffffff'], [1, '#8ff5e6']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke();
    ellipse(ctx, 21, 20, 4, 2.5, -0.7); ctx.fillStyle = '#ffffff'; ctx.fill();
    star(ctx, 30, 30, 4, 4, 1.3); ctx.fillStyle = '#2fd6b5'; ctx.fill();
  });
  // Escudo Antiphishing
  canvasTexture(scene, 'item_escudo', 64, 64, (ctx) => {
    glow(ctx, 32, 32, 30, '#8f6bff', 0.4);
    ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(54, 14); ctx.quadraticCurveTo(54, 44, 32, 58); ctx.quadraticCurveTo(10, 44, 10, 14); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 10, 6, 54, 58, [[0, '#b8a6ff'], [1, '#5a3fd0']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(48, 18); ctx.quadraticCurveTo(48, 40, 32, 51); ctx.quadraticCurveTo(16, 40, 16, 18); ctx.closePath();
    ctx.strokeStyle = '#f6c945'; ctx.lineWidth = 2.5; ctx.stroke();
    // anzuelo tachado
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(32, 20); ctx.lineTo(32, 34); ctx.arc(28, 34, 4, 0, Math.PI); ctx.stroke();
    line(ctx, 22, 40, 42, 22, '#ff8a65', 3.5);
  });
  // Espada de los Límites (sin filo: una vara de luz)
  canvasTexture(scene, 'item_espada', 64, 64, (ctx) => {
    glow(ctx, 32, 28, 30, '#7ff5dc', 0.45);
    ctx.beginPath(); ctx.moveTo(32, 4); ctx.lineTo(38, 12); ctx.lineTo(38, 40); ctx.lineTo(26, 40); ctx.lineTo(26, 12); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 26, 0, 38, 0, [[0, '#bff7ff'], [0.5, '#ffffff'], [1, '#6fe6e0']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    rr(ctx, 16, 40, 32, 7, 3); fillStroke(ctx, '#f6c945', OUTLINE, 2);
    rr(ctx, 28, 46, 8, 12, 3); fillStroke(ctx, '#8a5a3a', OUTLINE, 2);
    circle(ctx, 32, 59, 3.5); fillStroke(ctx, '#f6c945', OUTLINE, 1.8);
  });
  // Capa de Privacidad
  canvasTexture(scene, 'item_capa', 64, 64, (ctx) => {
    glow(ctx, 32, 32, 30, '#4aa8ff', 0.4);
    ctx.beginPath(); ctx.moveTo(18, 10); ctx.lineTo(46, 10); ctx.quadraticCurveTo(58, 36, 54, 58); ctx.quadraticCurveTo(44, 52, 38, 58); ctx.quadraticCurveTo(32, 52, 26, 58); ctx.quadraticCurveTo(20, 52, 10, 58); ctx.quadraticCurveTo(6, 36, 18, 10); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 0, 10, 0, 58, [[0, '#6fb8ff'], [1, '#3a55c8']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    rr(ctx, 16, 6, 32, 9, 4); fillStroke(ctx, '#f6c945', OUTLINE, 2);
    star(ctx, 32, 34, 4, 7, 2.4); ctx.fillStyle = '#ffffff'; ctx.fill();
  });
  // Llave Maestra
  canvasTexture(scene, 'item_llave', 64, 64, (ctx) => {
    glow(ctx, 32, 32, 30, '#f6c945', 0.45);
    circle(ctx, 22, 22, 13); fillStroke(ctx, '#f6c945', OUTLINE, 2.5);
    circle(ctx, 22, 22, 5); ctx.fillStyle = '#7a5a10'; ctx.fill();
    line(ctx, 30, 30, 54, 54, OUTLINE, 9); line(ctx, 30, 30, 54, 54, '#f6c945', 5.5);
    line(ctx, 46, 46, 40, 52, OUTLINE, 7); line(ctx, 46, 46, 40, 52, '#f6c945', 3.5);
    line(ctx, 52, 52, 46, 58, OUTLINE, 7); line(ctx, 52, 52, 46, 58, '#f6c945', 3.5);
  });

  // Cristales
  for (const [key, [c1, c2, c3]] of Object.entries(CRYSTALS)) {
    canvasTexture(scene, key, 64, 64, (ctx) => { glow(ctx, 32, 32, 32, c2, 0.5); gem(ctx, 32, 32, 36, 54, c1, c2, c3); });
    canvasTexture(scene, `${key}_big`, 110, 150, (ctx) => { glow(ctx, 55, 75, 60, c2, 0.6); gem(ctx, 55, 75, 64, 120, c1, c2, c3); });
    canvasTexture(scene, `${key}_empty`, 64, 64, (ctx) => {
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(32, 5); ctx.lineTo(50, 23); ctx.lineTo(32, 59); ctx.lineTo(14, 23); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
    });
  }
  // Fragmentos (3 piezas del cristal del nivel 1)
  const shard = (key, pts, c) => canvasTexture(scene, key, 48, 48, (ctx) => {
    glow(ctx, 24, 24, 24, c, 0.6);
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 0, 0, 48, 48, [[0, '#ffffff'], [1, c]]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.2; ctx.stroke();
  });
  shard('shard_a', [[24, 4], [40, 18], [26, 26], [10, 18]], '#3fe0a0');
  shard('shard_b', [[10, 14], [26, 22], [22, 44], [6, 24]], '#5fe8b0');
  shard('shard_c', [[38, 14], [42, 24], [26, 44], [24, 22]], '#e5c040');

  // Insignias
  const badges = {
    badge_truthseeker: ['#2fd6b5', (ctx) => { circle(ctx, 29, 37, 7); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke(); line(ctx, 34, 42, 41, 49, OUTLINE, 4); }],
    badge_secretkeeper: ['#4aa8ff', (ctx) => { rr(ctx, 23, 37, 18, 14, 3); fillStroke(ctx, '#f6c945', OUTLINE, 2); ctx.beginPath(); ctx.arc(32, 37, 6, Math.PI, 0); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke(); }],
    badge_bridge: ['#ff8a65', (ctx) => { ctx.beginPath(); ctx.arc(32, 50, 14, Math.PI * 1.15, Math.PI * 1.85); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 4; ctx.stroke(); line(ctx, 20, 46, 44, 46, OUTLINE, 3); for (let x = 22; x <= 42; x += 5) line(ctx, x, 40 + Math.abs(x - 32) * 0.3, x, 46, OUTLINE, 2); }],
    badge_sharpeye: ['#f6c945', (ctx) => { ellipse(ctx, 32, 40, 11, 7); fillStroke(ctx, '#ffffff', OUTLINE, 2.5); circle(ctx, 32, 40, 4); ctx.fillStyle = OUTLINE; ctx.fill(); }],
    badge_explorer: ['#3fe0a0', (ctx) => { star(ctx, 32, 40, 4, 12, 3.5); fillStroke(ctx, '#ffffff', OUTLINE, 2); circle(ctx, 32, 40, 3); ctx.fillStyle = '#ff8a65'; ctx.fill(); }],
    badge_protector: ['#8f6bff', (ctx) => { ctx.beginPath(); ctx.moveTo(32, 28); ctx.lineTo(42, 32); ctx.quadraticCurveTo(42, 46, 32, 52); ctx.quadraticCurveTo(22, 46, 22, 32); ctx.closePath(); fillStroke(ctx, '#ffffff', OUTLINE, 2); }],
    badge_guardian: ['#f6c945', (ctx) => { star(ctx, 32, 40, 5, 12, 5.5); fillStroke(ctx, '#ffffff', OUTLINE, 2); }]
  };
  for (const [key, [color, sym]] of Object.entries(badges)) {
    canvasTexture(scene, key, 64, 64, (ctx) => medal(ctx, color, sym));
  }
  canvasTexture(scene, 'badge_locked', 64, 64, (ctx) => {
    circle(ctx, 32, 40, 20); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', 32, 48);
  });
  canvasTexture(scene, 'item_locked', 64, 64, (ctx) => {
    rr(ctx, 8, 8, 48, 48, 12); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, 22, 30, 20, 16, 3); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
    ctx.beginPath(); ctx.arc(32, 30, 6, Math.PI, 0); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.stroke();
  });

  // Íconos de información (Misión 2)
  const info = {
    info_color: (ctx) => { ellipse(ctx, 32, 34, 22, 18); fillStroke(ctx, '#f3e2c4'); [['#ff6b6b', 22, 28], ['#4aa8ff', 32, 24], ['#5fd068', 42, 28], ['#f6c945', 42, 40]].forEach(([c, x, y]) => { circle(ctx, x, y, 4.5); fillStroke(ctx, c, OUTLINE, 1.5); }); circle(ctx, 26, 42, 5); ctx.fillStyle = '#ffffff'; ctx.fill(); },
    info_hobby: (ctx) => { circle(ctx, 32, 32, 20); fillStroke(ctx, '#ffffff'); star(ctx, 32, 32, 5, 8, 4); ctx.fillStyle = OUTLINE; ctx.fill(); },
    info_food: (ctx) => { ctx.beginPath(); ctx.moveTo(12, 30); ctx.lineTo(52, 30); ctx.quadraticCurveTo(50, 52, 32, 52); ctx.quadraticCurveTo(14, 52, 12, 30); ctx.closePath(); fillStroke(ctx, '#ffffff'); circle(ctx, 24, 26, 7); fillStroke(ctx, '#ff8a65', OUTLINE, 2); circle(ctx, 38, 24, 8); fillStroke(ctx, '#5fd068', OUTLINE, 2); },
    info_school: (ctx) => { rr(ctx, 12, 28, 40, 26, 3); fillStroke(ctx, '#ffd36e'); ctx.beginPath(); ctx.moveTo(8, 30); ctx.lineTo(32, 12); ctx.lineTo(56, 30); ctx.closePath(); fillStroke(ctx, '#ff8a65'); rr(ctx, 27, 38, 10, 16, 2); fillStroke(ctx, '#8a5a3a', OUTLINE, 2); },
    info_birthday: (ctx) => { rr(ctx, 14, 32, 36, 20, 4); fillStroke(ctx, '#ffb0de'); rr(ctx, 14, 30, 36, 6, 3); ctx.fillStyle = '#ffffff'; ctx.fill(); line(ctx, 32, 30, 32, 18, OUTLINE, 3); ellipse(ctx, 32, 14, 3, 5); ctx.fillStyle = '#f6c945'; ctx.fill(); },
    info_photo: (ctx) => { rr(ctx, 10, 16, 44, 34, 5); fillStroke(ctx, '#e6f3ff'); circle(ctx, 32, 30, 7); fillStroke(ctx, '#f1c6a0', OUTLINE, 2); rr(ctx, 22, 38, 20, 12, 4); fillStroke(ctx, '#4aa8ff', OUTLINE, 2); },
    info_password: (ctx) => { rr(ctx, 16, 28, 32, 24, 5); fillStroke(ctx, '#f6c945'); ctx.beginPath(); ctx.arc(32, 28, 10, Math.PI, 0); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 4; ctx.stroke(); circle(ctx, 32, 39, 3.5); ctx.fillStyle = OUTLINE; ctx.fill(); line(ctx, 32, 40, 32, 46, OUTLINE, 3); },
    info_address: (ctx) => { rr(ctx, 16, 30, 32, 22, 3); fillStroke(ctx, '#ffffff'); ctx.beginPath(); ctx.moveTo(10, 32); ctx.lineTo(32, 12); ctx.lineTo(54, 32); ctx.closePath(); fillStroke(ctx, '#4aa8ff'); rr(ctx, 28, 40, 9, 12, 2); fillStroke(ctx, '#ff8a65', OUTLINE, 2); },
    info_clock: (ctx) => { circle(ctx, 32, 32, 22); fillStroke(ctx, '#ffffff'); line(ctx, 32, 32, 32, 18, OUTLINE, 3.5); line(ctx, 32, 32, 42, 36, OUTLINE, 3.5); circle(ctx, 32, 32, 3); ctx.fillStyle = '#ff8a65'; ctx.fill(); },
    info_phone: (ctx) => { rr(ctx, 20, 8, 24, 48, 6); fillStroke(ctx, '#2b3440'); rr(ctx, 23, 14, 18, 32, 3); ctx.fillStyle = '#8ff5e6'; ctx.fill(); circle(ctx, 32, 51, 2.5); ctx.fillStyle = '#ffffff'; ctx.fill(); }
  };
  for (const [key, fn] of Object.entries(info)) canvasTexture(scene, key, 64, 64, fn);

  // Personas (Misión 3)
  const person = (ctx, x, y, s, skin, shirt) => {
    circle(ctx, x, y - 14 * s, 8 * s); fillStroke(ctx, skin, OUTLINE, 2);
    rr(ctx, x - 9 * s, y - 5 * s, 18 * s, 20 * s, 7 * s); fillStroke(ctx, shirt, OUTLINE, 2);
  };
  const people = {
    person_family: (ctx) => { person(ctx, 24, 36, 1.2, '#dca677', '#5fd068'); person(ctx, 44, 44, 0.85, '#f1c6a0', '#ff8a65'); },
    person_teacher: (ctx) => { person(ctx, 30, 38, 1.25, '#bd8152', '#6c8cff'); rr(ctx, 38, 34, 16, 12, 2); fillStroke(ctx, '#f6c945', OUTLINE, 2); line(ctx, 46, 34, 46, 46, OUTLINE, 1.5); },
    person_relative: (ctx) => { person(ctx, 30, 38, 1.25, '#f1c6a0', '#b07bff'); ctx.beginPath(); ctx.moveTo(48, 20); ctx.bezierCurveTo(56, 12, 60, 24, 48, 30); ctx.bezierCurveTo(36, 24, 40, 12, 48, 20); fillStroke(ctx, '#ff7aa8', OUTLINE, 1.8); },
    person_gamer: (ctx) => { rr(ctx, 12, 26, 40, 22, 10); fillStroke(ctx, '#5a6b70'); circle(ctx, 22, 37, 4); ctx.fillStyle = OUTLINE; ctx.fill(); circle(ctx, 42, 34, 2.5); ctx.fill(); circle(ctx, 46, 39, 2.5); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', 32, 22); },
    person_unknown: (ctx) => { rr(ctx, 12, 10, 40, 44, 8); fillStroke(ctx, '#d6dde0'); circle(ctx, 32, 26, 8); ctx.fillStyle = '#8a979c'; ctx.fill(); rr(ctx, 20, 36, 24, 12, 6); ctx.fill(); ctx.fillStyle = '#16303a'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', 32, 31); }
  };
  for (const [key, fn] of Object.entries(people)) canvasTexture(scene, key, 64, 64, fn);
}

export function buildUI(scene) {
  canvasTexture(scene, 'heart_full', 44, 40, (ctx) => {
    ctx.beginPath(); ctx.moveTo(22, 36); ctx.bezierCurveTo(-4, 18, 6, -2, 22, 10); ctx.bezierCurveTo(38, -2, 48, 18, 22, 36); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, 36, [[0, '#ff9aa8'], [1, '#e8455c']]); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    ellipse(ctx, 13, 13, 4, 2.5, -0.6); ctx.fillStyle = '#ffffff'; ctx.fill();
  });
  canvasTexture(scene, 'heart_empty', 44, 40, (ctx) => {
    ctx.beginPath(); ctx.moveTo(22, 36); ctx.bezierCurveTo(-4, 18, 6, -2, 22, 10); ctx.bezierCurveTo(38, -2, 48, 18, 22, 36); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.5; ctx.stroke();
  });
  const icon = (key, fn, size = 48) => canvasTexture(scene, key, size, size, fn);
  icon('icon_pause', (ctx) => { rr(ctx, 13, 10, 8, 28, 3); ctx.fillStyle = '#ffffff'; ctx.fill(); rr(ctx, 27, 10, 8, 28, 3); ctx.fill(); });
  icon('icon_bag', (ctx) => {
    rr(ctx, 9, 16, 30, 26, 8); fillStroke(ctx, '#f6c945', OUTLINE, 2.5);
    ctx.beginPath(); ctx.arc(24, 17, 7, Math.PI, 0); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke();
    rr(ctx, 16, 26, 16, 8, 3); fillStroke(ctx, '#c18f1c', OUTLINE, 2);
  });
  icon('icon_help', (ctx) => {
    ctx.fillStyle = '#ffffff'; ctx.font = '800 32px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 24, 27);
  });
  icon('icon_sound', (ctx) => {
    ctx.beginPath(); ctx.moveTo(8, 19); ctx.lineTo(16, 19); ctx.lineTo(26, 10); ctx.lineTo(26, 38); ctx.lineTo(16, 29); ctx.lineTo(8, 29); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(26, 24, 8, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(26, 24, 14, -0.9, 0.9); ctx.stroke();
  });
  icon('icon_mute', (ctx) => {
    ctx.beginPath(); ctx.moveTo(8, 19); ctx.lineTo(16, 19); ctx.lineTo(26, 10); ctx.lineTo(26, 38); ctx.lineTo(16, 29); ctx.lineTo(8, 29); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    line(ctx, 31, 18, 42, 30, '#ffffff', 3.5); line(ctx, 42, 18, 31, 30, '#ffffff', 3.5);
  });
  icon('icon_check', (ctx) => {
    circle(ctx, 24, 24, 20); fillStroke(ctx, '#4cd38a', OUTLINE, 2.5);
    ctx.beginPath(); ctx.moveTo(14, 25); ctx.lineTo(21, 32); ctx.lineTo(35, 16); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.stroke();
  });
  icon('icon_alert', (ctx) => {
    ctx.beginPath(); ctx.moveTo(24, 4); ctx.lineTo(45, 42); ctx.lineTo(3, 42); ctx.closePath(); fillStroke(ctx, '#ffb347', OUTLINE, 2.5);
    rr(ctx, 21, 15, 6, 15, 3); ctx.fillStyle = OUTLINE; ctx.fill(); circle(ctx, 24, 36, 3.2); ctx.fill();
  });
  icon('icon_retry', (ctx) => {
    circle(ctx, 24, 24, 20); fillStroke(ctx, '#6c8cff', OUTLINE, 2.5);
    ctx.beginPath(); ctx.arc(24, 24, 10, -0.3, Math.PI * 1.5); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(31, 14); ctx.lineTo(23, 19); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  });
  icon('icon_arrow_right', (ctx) => { ctx.beginPath(); ctx.moveTo(14, 10); ctx.lineTo(36, 24); ctx.lineTo(14, 38); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); });
  icon('icon_arrow_left', (ctx) => { ctx.beginPath(); ctx.moveTo(34, 10); ctx.lineTo(12, 24); ctx.lineTo(34, 38); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); });
  icon('icon_replay', (ctx) => {
    ctx.beginPath(); ctx.arc(24, 24, 13, 0.4, Math.PI * 1.8); ctx.strokeStyle = '#0b2e33'; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, 6); ctx.lineTo(38, 13); ctx.lineTo(28, 17); ctx.closePath(); ctx.fillStyle = '#0b2e33'; ctx.fill();
  });
  icon('icon_star', (ctx) => { star(ctx, 24, 24, 5, 20, 9); fillStroke(ctx, '#f6c945', OUTLINE, 2.5); });
  icon('icon_target', (ctx) => {
    circle(ctx, 24, 24, 18); fillStroke(ctx, '#ff8a65', OUTLINE, 2.5);
    circle(ctx, 24, 24, 11); fillStroke(ctx, '#ffffff', null, 0);
    circle(ctx, 24, 24, 5); ctx.fillStyle = '#ff8a65'; ctx.fill();
  }, 48);
  icon('icon_heart_help', (ctx) => {
    ctx.beginPath(); ctx.moveTo(24, 40); ctx.bezierCurveTo(-2, 22, 8, 2, 24, 14); ctx.bezierCurveTo(40, 2, 50, 22, 24, 40); ctx.closePath();
    fillStroke(ctx, '#ff8aa8', OUTLINE, 2.5);
  });

  // Controles táctiles
  const touchBtn = (key, drawSym, color = 'rgba(255,255,255,0.18)') => canvasTexture(scene, key, 120, 120, (ctx) => {
    circle(ctx, 60, 60, 54); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 4; ctx.stroke();
    drawSym(ctx);
  });
  touchBtn('touch_left', (ctx) => { ctx.beginPath(); ctx.moveTo(72, 34); ctx.lineTo(40, 60); ctx.lineTo(72, 86); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); });
  touchBtn('touch_right', (ctx) => { ctx.beginPath(); ctx.moveTo(48, 34); ctx.lineTo(80, 60); ctx.lineTo(48, 86); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); });
  touchBtn('touch_jump', (ctx) => { ctx.beginPath(); ctx.moveTo(60, 30); ctx.lineTo(88, 64); ctx.lineTo(70, 64); ctx.lineTo(70, 88); ctx.lineTo(50, 88); ctx.lineTo(50, 64); ctx.lineTo(32, 64); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); }, 'rgba(47,214,181,0.35)');
  touchBtn('touch_interact', (ctx) => {
    rr(ctx, 30, 30, 60, 46, 14); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(44, 74); ctx.lineTo(40, 90); ctx.lineTo(58, 74); ctx.closePath(); ctx.fill();
    rr(ctx, 56, 38, 8, 20, 4); ctx.fillStyle = '#16303a'; ctx.fill();
    circle(ctx, 60, 66, 4.5); ctx.fill();
  }, 'rgba(246,201,69,0.35)');
  touchBtn('touch_tool', (ctx) => {
    circle(ctx, 54, 54, 18); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.stroke();
    line(ctx, 67, 67, 84, 84, '#ffffff', 9);
  }, 'rgba(143,107,255,0.35)');

  canvasTexture(scene, 'prompt_key', 56, 56, (ctx) => {
    rr(ctx, 6, 6, 44, 44, 12); fillStroke(ctx, '#ffffff', OUTLINE, 3);
    rr(ctx, 6, 40, 44, 10, 6); ctx.fillStyle = '#c9e6e0'; ctx.fill();
  });
  canvasTexture(scene, 'bubble', 64, 64, (ctx) => {
    circle(ctx, 32, 28, 22); fillStroke(ctx, '#ffffff', OUTLINE, 3);
    ctx.beginPath(); ctx.moveTo(26, 46); ctx.lineTo(32, 60); ctx.lineTo(38, 46); ctx.closePath(); fillStroke(ctx, '#ffffff', OUTLINE, 3);
    circle(ctx, 32, 28, 19); ctx.fillStyle = '#ffffff'; ctx.fill();
  });
}
