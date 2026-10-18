import { canvasTexture, rr, circle, ellipse, fillStroke, glow, star, line, linGrad, radGrad, shade, hexA, OUTLINE, rng } from './draw.js';

// Paletas por mundo: preparadas para los tres niveles.
export const PALETTES = {
  1: {
    skyTop: '#06263a', skyMid: '#0f5560', skyLow: '#2fae98', horizon: '#c9f7c8',
    far: '#16676a', farDark: '#0f4e52', mid: '#0f4740', midCanopy: '#167a63', near: '#0b302c',
    glowA: '#f6e27a', glowB: '#7ff5dc', grass: '#57cf6a', grassLight: '#a8f07c', dirt: '#5c3f2f', stone: '#6c8088'
  },
  2: {
    skyTop: '#140a35', skyMid: '#2b1d6b', skyLow: '#3c5bb5', horizon: '#7fe9f0',
    far: '#30298a', farDark: '#221c66', mid: '#251f5e', midCanopy: '#3b3496', near: '#160f3a',
    glowA: '#b07bff', glowB: '#6ff7e0', grass: '#6ac2ff', grassLight: '#b8f4ff', dirt: '#2d2a5c', stone: '#5a5f9a'
  },
  3: {
    skyTop: '#071a3a', skyMid: '#0c3a63', skyLow: '#14806e', horizon: '#f7e7a0',
    far: '#174a7a', farDark: '#103a60', mid: '#0f3b4f', midCanopy: '#13695a', near: '#0a2638',
    glowA: '#f6c945', glowB: '#5ff0b8', grass: '#3fcf9a', grassLight: '#bff7d7', dirt: '#33405a', stone: '#7d8fa8'
  }
};

export function buildBackgrounds(scene, level) {
  const p = PALETTES[level];
  const L = `l${level}`;
  canvasTexture(scene, `bg_${L}_sky`, 1280, 720, (ctx, w, h) => {
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, h, [[0, p.skyTop], [0.45, p.skyMid], [0.8, p.skyLow], [1, p.horizon]]);
    ctx.fillRect(0, 0, w, h);
    const r = rng(level * 31);
    // auroras
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const y0 = 120 + i * 70;
      ctx.moveTo(0, y0);
      for (let x = 0; x <= w; x += 40) ctx.lineTo(x, y0 + Math.sin(x / 180 + i * 2) * 40 + Math.sin(x / 70 + i) * 12);
      ctx.strokeStyle = hexA(i % 2 ? p.glowA : p.glowB, 0.12);
      ctx.lineWidth = 50 - i * 10;
      ctx.stroke();
    }
    for (let i = 0; i < 140; i++) {
      const x = r() * w, y = r() * h * 0.6, s = r() * 1.8 + 0.4;
      ctx.fillStyle = `rgba(255,255,240,${0.3 + r() * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
    }
    glow(ctx, 980, 170, 170, p.glowA, 0.35);
    circle(ctx, 980, 170, 52);
    ctx.fillStyle = radGrad(ctx, 965, 155, 5, 60, [[0, '#ffffff'], [0.7, shade(p.glowA, 0.5)], [1, p.glowA]]);
    ctx.fill();
  });

  // Capas de parallax (1600 px, repetibles horizontalmente)
  const W = 1600, H = 900;
  canvasTexture(scene, `bg_${L}_far`, W, H, (ctx) => {
    const r = rng(level * 7 + 3);
    const hill = (base, amp, k1, k2, color) => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) {
        const y = base + Math.sin((x / W) * Math.PI * 2 * k1) * amp + Math.sin((x / W) * Math.PI * 2 * k2 + 1.3) * amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    // islas flotantes
    for (let i = 0; i < 4; i++) {
      const x = 200 + i * 400 + r() * 80, y = 230 + r() * 120, s = 0.6 + r() * 0.6;
      for (const dx of [0, -W, W]) {
        const ix = x + dx;
        glow(ctx, ix, y, 90 * s, p.glowB, 0.18);
        ctx.beginPath();
        ctx.moveTo(ix - 70 * s, y);
        ctx.quadraticCurveTo(ix, y + 90 * s, ix + 70 * s, y);
        ctx.closePath();
        ctx.fillStyle = p.farDark; ctx.fill();
        ellipse(ctx, ix, y, 72 * s, 12 * s); ctx.fillStyle = p.far; ctx.fill();
        for (let t = -2; t <= 2; t++) { circle(ctx, ix + t * 22 * s, y - 14 * s - Math.abs(t) * -4, 18 * s); ctx.fillStyle = p.midCanopy; ctx.fill(); }
        ctx.fillStyle = hexA(p.glowB, 0.35);
        ctx.fillRect(ix + 20 * s, y + 6 * s, 4 * s, 120 * s);
      }
    }
    hill(560, 60, 2, 5, shade(p.far, 0.08));
    hill(640, 45, 3, 7, p.far);
    hill(720, 30, 4, 9, p.farDark);
  });

  canvasTexture(scene, `bg_${L}_mid`, W, H, (ctx) => {
    const r = rng(level * 13 + 5);
    ctx.fillStyle = p.mid;
    ctx.fillRect(0, 780, W, H - 780);
    const tree = (x, y, s) => {
      ctx.fillStyle = shade(p.mid, -0.2);
      ctx.beginPath();
      ctx.moveTo(x - 14 * s, 790); ctx.quadraticCurveTo(x - 6 * s, y + 60 * s, x - 8 * s, y);
      ctx.lineTo(x + 8 * s, y); ctx.quadraticCurveTo(x + 6 * s, y + 60 * s, x + 14 * s, 790);
      ctx.closePath(); ctx.fill();
      const blobs = [[0, -20, 60], [-50, 10, 46], [50, 10, 46], [-26, -60, 44], [30, -56, 42], [0, 30, 50]];
      for (const [bx, by, br] of blobs) { circle(ctx, x + bx * s, y + by * s, br * s); ctx.fillStyle = p.midCanopy; ctx.fill(); }
      for (const [bx, by, br] of blobs) { circle(ctx, x + bx * s - 8 * s, y + by * s - 10 * s, br * s * 0.5); ctx.fillStyle = shade(p.midCanopy, 0.12); ctx.fill(); }
      for (let i = 0; i < 14; i++) {
        const gx = x + (r() - 0.5) * 160 * s, gy = y + (r() - 0.6) * 130 * s;
        glow(ctx, gx, gy, 9 * s, r() > 0.5 ? p.glowA : p.glowB, 0.8);
      }
    };
    const xs = [100, 420, 760, 1080, 1400];
    xs.forEach((x, i) => {
      const s = 0.8 + r() * 0.5, y = 420 + r() * 120;
      for (const dx of [0, -W, W]) tree(x + dx, y, s);
      if (i === 0) for (const dx of [W]) tree(x + dx, y, s);
    });
  });

  canvasTexture(scene, `bg_${L}_near`, W, H, (ctx) => {
    const r = rng(level * 17 + 11);
    ctx.fillStyle = p.near;
    ctx.fillRect(0, 840, W, H - 840);
    for (let i = 0; i < 22; i++) {
      const x = (i / 22) * W + r() * 40, s = 0.6 + r() * 0.8;
      for (const dx of [0, -W, W]) {
        const bx = x + dx;
        for (let k = 0; k < 4; k++) { circle(ctx, bx + (k - 1.5) * 26 * s, 830 - r() * 30 * s, (30 + r() * 16) * s); ctx.fillStyle = p.near; ctx.fill(); }
        if (r() > 0.5) glow(ctx, bx, 800, 8, p.glowA, 0.9);
      }
    }
    for (let x = 0; x < W; x += 9) {
      const hgt = 20 + r() * 40;
      line(ctx, x, 860, x + (r() - 0.5) * 12, 860 - hgt, p.near, 4);
    }
  });
}

export function buildForestProps(scene, level = 1) {
  const p = PALETTES[level];
  const L = `l${level}`;

  // Suelo
  canvasTexture(scene, `ground_top_${L}`, 64, 64, (ctx) => {
    const r = rng(level * 3);
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, 64, [[0, shade(p.dirt, 0.1)], [1, p.dirt]]);
    ctx.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 6; i++) { ellipse(ctx, r() * 64, 28 + r() * 32, 4 + r() * 4, 2.5 + r() * 2); ctx.fillStyle = shade(p.dirt, -0.25); ctx.fill(); }
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(64, 0); ctx.lineTo(64, 16);
    for (let x = 64; x >= 0; x -= 8) ctx.lineTo(x, 16 + (x % 16 === 0 ? 6 : 0));
    ctx.closePath();
    ctx.fillStyle = p.grass; ctx.fill();
    ctx.fillStyle = shade(p.grass, -0.25);
    for (let x = 0; x < 64; x += 16) { ctx.beginPath(); ctx.moveTo(x, 16); ctx.lineTo(x + 8, 24); ctx.lineTo(x + 16, 16); ctx.fill(); }
    ctx.fillStyle = p.grass;
    for (let x = 0; x < 64; x += 16) { ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x + 8, 21); ctx.lineTo(x + 16, 14); ctx.fill(); }
    ctx.fillStyle = p.grassLight; ctx.fillRect(0, 0, 64, 4);
    for (let x = 4; x < 64; x += 12) line(ctx, x, 6, x + 2, 1, p.grassLight, 2);
  });
  canvasTexture(scene, `ground_fill_${L}`, 64, 64, (ctx) => {
    const r = rng(level * 5);
    ctx.fillStyle = p.dirt; ctx.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 7; i++) { ellipse(ctx, r() * 64, r() * 64, 4 + r() * 5, 3 + r() * 2); ctx.fillStyle = shade(p.dirt, -0.22); ctx.fill(); }
    for (let i = 0; i < 2; i++) { ellipse(ctx, r() * 64, r() * 64, 5, 3.5); ctx.fillStyle = shade(p.stone, -0.1); ctx.fill(); }
  });
  canvasTexture(scene, `ground_cap_${L}`, 28, 70, (ctx) => {
    ctx.fillStyle = p.dirt;
    rr(ctx, 4, 6, 22, 64, 10); ctx.fill();
    rr(ctx, 0, 0, 28, 22, 11); fillStroke(ctx, p.grass, shade(p.grass, -0.35), 2);
    ctx.fillStyle = p.grassLight; ctx.fillRect(5, 2, 18, 4);
  });

  // Decoración
  canvasTexture(scene, `tree_${L}`, 300, 420, (ctx) => {
    const r = rng(level * 23);
    ctx.fillStyle = linGrad(ctx, 120, 0, 180, 0, [[0, '#4a2f22'], [0.5, '#6b4630'], [1, '#3d261b']]);
    ctx.beginPath();
    ctx.moveTo(110, 420); ctx.quadraticCurveTo(135, 300, 128, 170); ctx.lineTo(172, 170); ctx.quadraticCurveTo(165, 300, 190, 420);
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke();
    line(ctx, 150, 250, 105, 210, '#5a3a28', 12); line(ctx, 150, 230, 205, 190, '#5a3a28', 12);
    const blobs = [[150, 120, 92], [72, 165, 64], [228, 165, 64], [95, 80, 62], [205, 80, 62], [150, 40, 58]];
    for (const [bx, by, br] of blobs) { circle(ctx, bx, by, br + 3); ctx.fillStyle = OUTLINE; ctx.fill(); }
    for (const [bx, by, br] of blobs) { circle(ctx, bx, by, br); ctx.fillStyle = shade(p.midCanopy, 0.1); ctx.fill(); }
    for (const [bx, by, br] of blobs) { circle(ctx, bx - br * 0.25, by - br * 0.3, br * 0.55); ctx.fillStyle = shade(p.midCanopy, 0.3); ctx.fill(); }
    for (let i = 0; i < 24; i++) glow(ctx, 40 + r() * 220, 20 + r() * 200, 8, r() > 0.4 ? p.glowA : p.glowB, 0.95);
  });

  canvasTexture(scene, 'mushroom', 56, 56, (ctx) => {
    glow(ctx, 28, 24, 26, p.glowB, 0.5);
    rr(ctx, 23, 26, 10, 26, 5); fillStroke(ctx, '#f3ead6');
    ctx.beginPath(); ctx.arc(28, 28, 20, Math.PI, Math.PI * 2); ctx.closePath(); fillStroke(ctx, '#3fd6c0');
    circle(ctx, 20, 18, 3.5); ctx.fillStyle = '#e6fffa'; ctx.fill();
    circle(ctx, 33, 14, 3); ctx.fill(); circle(ctx, 38, 22, 2.4); ctx.fill();
  });

  canvasTexture(scene, 'flower', 40, 48, (ctx) => {
    line(ctx, 20, 48, 20, 22, '#2f8a4c', 3.5);
    ellipse(ctx, 14, 36, 6, 3, -0.5); ctx.fillStyle = '#4cc96a'; ctx.fill();
    glow(ctx, 20, 18, 18, p.glowA, 0.5);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ellipse(ctx, 20 + Math.cos(a) * 7, 18 + Math.sin(a) * 7, 6, 4, a); fillStroke(ctx, '#ffd36e', OUTLINE, 1.5);
    }
    circle(ctx, 20, 18, 4.5); fillStroke(ctx, '#ff8a65', OUTLINE, 1.5);
  });

  canvasTexture(scene, 'fern', 80, 60, (ctx) => {
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(40, 60);
      ctx.quadraticCurveTo(40 + i * 8, 30, 40 + i * 14, 8 + Math.abs(i) * 6);
      ctx.strokeStyle = i % 2 ? '#2f9a5d' : '#3fbf6a'; ctx.lineWidth = 6; ctx.stroke();
    }
  });

  canvasTexture(scene, 'rock', 70, 44, (ctx) => {
    ctx.beginPath(); ctx.moveTo(6, 42); ctx.quadraticCurveTo(2, 12, 30, 8); ctx.quadraticCurveTo(62, 4, 66, 42); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 0, 6, 0, 42, [[0, shade(p.stone, 0.2)], [1, shade(p.stone, -0.25)]]);
    ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    ellipse(ctx, 26, 16, 10, 4, -0.2); ctx.fillStyle = '#5fd068'; ctx.fill();
  });

  // Árbol Mensajero
  canvasTexture(scene, 'tree_messenger', 320, 420, (ctx) => {
    const r = rng(99);
    glow(ctx, 160, 150, 170, p.glowA, 0.25);
    ctx.fillStyle = linGrad(ctx, 110, 0, 210, 0, [[0, '#4a2f22'], [0.5, '#7a5236'], [1, '#3d261b']]);
    ctx.beginPath();
    ctx.moveTo(90, 420); ctx.quadraticCurveTo(130, 330, 125, 200); ctx.lineTo(195, 200); ctx.quadraticCurveTo(190, 330, 230, 420);
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke();
    // hueco brillante
    ellipse(ctx, 160, 320, 26, 36); ctx.fillStyle = '#1c1020'; ctx.fill(); ctx.stroke();
    glow(ctx, 160, 325, 30, p.glowA, 0.8);
    // raíces
    line(ctx, 100, 414, 60, 420, '#4a2f22', 12); line(ctx, 220, 414, 262, 420, '#4a2f22', 12);
    const blobs = [[160, 120, 100], [70, 170, 66], [250, 170, 66], [90, 80, 64], [230, 80, 64], [160, 30, 60]];
    for (const [bx, by, br] of blobs) { circle(ctx, bx, by, br + 3); ctx.fillStyle = OUTLINE; ctx.fill(); }
    for (const [bx, by, br] of blobs) { circle(ctx, bx, by, br); ctx.fillStyle = '#1f8f6c'; ctx.fill(); }
    for (const [bx, by, br] of blobs) { circle(ctx, bx - br * 0.25, by - br * 0.3, br * 0.55); ctx.fillStyle = '#35b783'; ctx.fill(); }
    for (let i = 0; i < 30; i++) glow(ctx, 30 + r() * 260, 10 + r() * 220, 8, r() > 0.5 ? p.glowA : '#ffffff', 0.9);
  });

  canvasTexture(scene, 'envelope', 40, 30, (ctx) => {
    glow(ctx, 20, 15, 20, '#fff3a0', 0.6);
    rr(ctx, 5, 6, 30, 19, 3); fillStroke(ctx, '#fffaf0', OUTLINE, 2);
    ctx.beginPath(); ctx.moveTo(5, 7); ctx.lineTo(20, 18); ctx.lineTo(35, 7); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke();
    circle(ctx, 20, 18, 3.5); fillStroke(ctx, '#ff8a65', OUTLINE, 1.5);
  });
  canvasTexture(scene, 'envelope_glitch', 40, 30, (ctx) => {
    glow(ctx, 20, 15, 20, '#b07bff', 0.6);
    rr(ctx, 5, 6, 30, 19, 3); fillStroke(ctx, '#e8dcff', OUTLINE, 2);
    ctx.beginPath(); ctx.moveTo(5, 7); ctx.lineTo(20, 18); ctx.lineTo(35, 7); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#8f4bff'; ctx.fillRect(25, 18, 4, 4); ctx.fillRect(9, 10, 3, 3);
  });

  // Farol de control
  const lantern = (lit) => (ctx) => {
    if (lit) glow(ctx, 25, 22, 26, '#f6e27a', 0.9);
    rr(ctx, 14, 36, 22, 60, 5); fillStroke(ctx, shade(p.stone, 0.1));
    rr(ctx, 8, 88, 34, 10, 4); fillStroke(ctx, shade(p.stone, -0.1));
    rr(ctx, 10, 30, 30, 8, 3); fillStroke(ctx, shade(p.stone, -0.1));
    ctx.beginPath(); ctx.moveTo(25, 4); ctx.lineTo(36, 18); ctx.lineTo(25, 32); ctx.lineTo(14, 18); ctx.closePath();
    fillStroke(ctx, lit ? '#fff1a0' : '#6f8c9a', OUTLINE, 2.2);
    if (lit) { ctx.beginPath(); ctx.moveTo(25, 8); ctx.lineTo(30, 18); ctx.lineTo(25, 26); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); }
    line(ctx, 18, 52, 32, 52, shade(p.stone, -0.3), 2);
    line(ctx, 18, 64, 32, 64, shade(p.stone, -0.3), 2);
  };
  canvasTexture(scene, 'lantern_off', 50, 100, lantern(false));
  canvasTexture(scene, 'lantern_on', 50, 100, lantern(true));

  // Señales
  const sign = (fake) => (ctx) => {
    rr(ctx, 70, 50, 14, 90, 4); fillStroke(ctx, '#6b4630');
    ctx.beginPath();
    ctx.moveTo(10, 14); ctx.lineTo(134, 14); ctx.lineTo(152, 42); ctx.lineTo(134, 70); ctx.lineTo(10, 70); ctx.closePath();
    ctx.fillStyle = fake ? linGrad(ctx, 0, 14, 0, 70, [[0, '#ffd9f2'], [1, '#ffb0de']]) : linGrad(ctx, 0, 14, 0, 70, [[0, '#d8a46a'], [1, '#b47a45']]);
    ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke();
    if (fake) {
      star(ctx, 22, 22, 5, 9, 4); fillStroke(ctx, '#ffe36e', OUTLINE, 1.5);
      star(ctx, 128, 62, 5, 7, 3); fillStroke(ctx, '#ffe36e', OUTLINE, 1.5);
    } else {
      line(ctx, 18, 26, 120, 26, 'rgba(0,0,0,0.12)', 2);
      line(ctx, 18, 58, 120, 58, 'rgba(0,0,0,0.12)', 2);
    }
  };
  canvasTexture(scene, 'sign_real', 160, 140, sign(false));
  canvasTexture(scene, 'sign_fake', 160, 140, sign(true));
  canvasTexture(scene, 'sign_down', 120, 150, (ctx) => {
    rr(ctx, 53, 10, 14, 90, 4); fillStroke(ctx, '#6b4630');
    ctx.beginPath();
    ctx.moveTo(14, 60); ctx.lineTo(106, 60); ctx.lineTo(106, 108); ctx.lineTo(60, 140); ctx.lineTo(14, 108); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 0, 60, 0, 140, [[0, '#ffd9f2'], [1, '#ffb0de']]);
    ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 3; ctx.stroke();
  });
  canvasTexture(scene, 'glitch_overlay', 170, 90, (ctx) => {
    const r = rng(5);
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = ['#8f4bff', '#b07bff', '#6ff7e0', '#1a1030'][Math.floor(r() * 4)];
      const s = 4 + Math.floor(r() * 3) * 2;
      ctx.fillRect(Math.floor(r() * 160), Math.floor(r() * 80), s, s);
    }
  });

  // Peligros
  canvasTexture(scene, 'bramble', 128, 60, (ctx) => {
    const r = rng(41);
    glow(ctx, 64, 40, 60, '#b07bff', 0.3);
    for (let i = 0; i < 9; i++) {
      const x = 10 + i * 13.5, hgt = 26 + r() * 22;
      ctx.beginPath(); ctx.moveTo(x - 9, 60); ctx.lineTo(x, 60 - hgt); ctx.lineTo(x + 9, 60); ctx.closePath();
      fillStroke(ctx, i % 2 ? '#5b2bb5' : '#7136e0', OUTLINE, 2);
    }
    ellipse(ctx, 64, 52, 60, 12); fillStroke(ctx, '#3e1f7a', OUTLINE, 2);
    for (let i = 0; i < 7; i++) { ctx.fillStyle = r() > 0.5 ? '#6ff7e0' : '#e6d4ff'; ctx.fillRect(10 + r() * 108, 14 + r() * 30, 4, 4); }
  });
  canvasTexture(scene, 'spark', 40, 40, (ctx) => {
    glow(ctx, 20, 20, 20, '#b07bff', 0.9);
    star(ctx, 20, 20, 4, 15, 5); fillStroke(ctx, '#d9c2ff', OUTLINE, 2);
    ctx.fillStyle = '#6ff7e0'; ctx.fillRect(17, 17, 6, 6);
  });

  // Coleccionable
  canvasTexture(scene, 'orb', 32, 32, (ctx) => {
    glow(ctx, 16, 16, 16, '#fff3a0', 0.9);
    star(ctx, 16, 16, 4, 11, 4); ctx.fillStyle = '#fff8d0'; ctx.fill();
    circle(ctx, 16, 16, 5); ctx.fillStyle = '#ffffff'; ctx.fill();
  });

  // Cofres
  const chest = (open, scale = 1, kind = 'main') => (ctx) => {
    ctx.scale(scale, scale);
    const wood = kind === 'main' ? '#2f8f8a' : '#8a5a3a';
    const trim = '#f6c945';
    if (open) {
      glow(ctx, 60, 40, 60, '#fff3a0', 0.8);
      ctx.fillStyle = 'rgba(255,243,160,0.35)';
      ctx.beginPath(); ctx.moveTo(30, 46); ctx.lineTo(4, 0); ctx.lineTo(116, 0); ctx.lineTo(90, 46); ctx.closePath(); ctx.fill();
      rr(ctx, 16, 8, 88, 22, 8); fillStroke(ctx, shade(wood, -0.15));
      rr(ctx, 16, 24, 88, 8, 3); ctx.fillStyle = trim; ctx.fill();
    }
    rr(ctx, 12, 44, 96, 50, 8); fillStroke(ctx, wood);
    rr(ctx, 12, 44, 96, 10, 4); ctx.fillStyle = shade(wood, -0.2); ctx.fill();
    rr(ctx, 26, 44, 10, 50, 3); fillStroke(ctx, trim, OUTLINE, 2);
    rr(ctx, 84, 44, 10, 50, 3); fillStroke(ctx, trim, OUTLINE, 2);
    if (!open) {
      ctx.beginPath(); ctx.moveTo(12, 46); ctx.quadraticCurveTo(60, 8, 108, 46); ctx.closePath(); fillStroke(ctx, shade(wood, 0.1));
      ctx.beginPath(); ctx.moveTo(26, 40); ctx.quadraticCurveTo(31, 26, 36, 22); ctx.lineTo(36, 46); ctx.lineTo(26, 46); ctx.closePath(); ctx.fillStyle = trim; ctx.fill();
      ctx.beginPath(); ctx.moveTo(84, 22); ctx.quadraticCurveTo(89, 26, 94, 40); ctx.lineTo(94, 46); ctx.lineTo(84, 46); ctx.closePath(); ctx.fill();
      glow(ctx, 60, 54, 14, '#6ff7e0', 0.9);
      rr(ctx, 52, 44, 16, 20, 4); fillStroke(ctx, trim, OUTLINE, 2);
      circle(ctx, 60, 52, 3); ctx.fillStyle = OUTLINE; ctx.fill();
    }
  };
  canvasTexture(scene, 'chest_closed', 120, 100, chest(false));
  canvasTexture(scene, 'chest_open', 120, 100, chest(true));
  canvasTexture(scene, 'chest_small_closed', 84, 70, chest(false, 0.7, 'wood'));
  canvasTexture(scene, 'chest_small_open', 84, 70, chest(true, 0.7, 'wood'));

  // Enredaderas de estática
  canvasTexture(scene, 'vines', 110, 300, (ctx) => {
    const r = rng(77);
    glow(ctx, 55, 150, 90, '#b07bff', 0.25);
    for (let v = 0; v < 4; v++) {
      ctx.beginPath();
      ctx.moveTo(20 + v * 22, 300);
      for (let y = 300; y >= 0; y -= 10) ctx.lineTo(20 + v * 22 + Math.sin(y / 30 + v) * 12, y);
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 12; ctx.stroke();
      ctx.strokeStyle = v % 2 ? '#3f8f5a' : '#6a3fc0'; ctx.lineWidth = 8; ctx.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const x = 10 + r() * 90, y = r() * 290;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y - 4); ctx.lineTo(x + 2, y + 6); ctx.closePath(); fillStroke(ctx, '#b07bff', OUTLINE, 1.5);
    }
    for (let i = 0; i < 16; i++) { ctx.fillStyle = r() > 0.5 ? '#6ff7e0' : '#e6d4ff'; ctx.fillRect(r() * 100, r() * 290, 5, 5); }
  });

  // Puente y río
  canvasTexture(scene, 'plank', 48, 18, (ctx) => {
    rr(ctx, 2, 2, 44, 14, 4); fillStroke(ctx, '#b47a45');
    line(ctx, 8, 9, 40, 9, 'rgba(0,0,0,0.18)', 2);
    circle(ctx, 8, 9, 1.6); ctx.fillStyle = OUTLINE; ctx.fill(); circle(ctx, 40, 9, 1.6); ctx.fill();
  });
  canvasTexture(scene, 'bridge_post', 24, 90, (ctx) => {
    rr(ctx, 4, 10, 16, 80, 4); fillStroke(ctx, '#7a5236');
    glow(ctx, 12, 10, 12, '#f6e27a', 0.9);
    circle(ctx, 12, 10, 5); fillStroke(ctx, '#fff1a0', OUTLINE, 2);
  });
  canvasTexture(scene, 'water', 128, 64, (ctx) => {
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, 64, [[0, '#3fd6d0'], [0.3, '#1f8fb0'], [1, '#0f3f6a']]);
    ctx.fillRect(0, 0, 128, 64);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= 128; x += 4) ctx.lineTo(x, 6 + Math.sin((x / 128) * Math.PI * 4) * 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= 128; x += 4) ctx.lineTo(x, 26 + Math.sin((x / 128) * Math.PI * 2 + 1) * 4);
    ctx.stroke();
  });

  // Pedestal y portal
  canvasTexture(scene, 'pedestal', 150, 130, (ctx) => {
    glow(ctx, 75, 30, 60, p.glowB, 0.4);
    rr(ctx, 20, 110, 110, 18, 6); fillStroke(ctx, shade(p.stone, -0.15));
    ctx.beginPath(); ctx.moveTo(40, 112); ctx.lineTo(50, 40); ctx.lineTo(100, 40); ctx.lineTo(110, 112); ctx.closePath();
    ctx.fillStyle = linGrad(ctx, 40, 0, 110, 0, [[0, shade(p.stone, -0.1)], [0.5, shade(p.stone, 0.2)], [1, shade(p.stone, -0.2)]]);
    ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    rr(ctx, 30, 28, 90, 16, 6); fillStroke(ctx, shade(p.stone, 0.1));
    ctx.strokeStyle = p.glowB; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(62, 60); ctx.lineTo(75, 52); ctx.lineTo(88, 60); ctx.lineTo(75, 92); ctx.closePath(); ctx.stroke();
    circle(ctx, 75, 70, 4); ctx.fillStyle = p.glowB; ctx.fill();
  });
  canvasTexture(scene, 'portal_arch', 230, 270, (ctx) => {
    ctx.lineWidth = 34;
    ctx.strokeStyle = OUTLINE;
    ctx.beginPath(); ctx.moveTo(40, 270); ctx.lineTo(40, 115); ctx.arc(115, 115, 75, Math.PI, 0); ctx.lineTo(190, 270); ctx.stroke();
    ctx.lineWidth = 28;
    ctx.strokeStyle = linGrad(ctx, 0, 0, 230, 0, [[0, shade(p.stone, -0.1)], [0.5, shade(p.stone, 0.25)], [1, shade(p.stone, -0.1)]]);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      const x = 115 + Math.cos(a) * 75, y = 115 + Math.sin(a) * 75;
      ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 5, y); ctx.closePath();
      ctx.fillStyle = p.glowB; ctx.fill();
    }
    rr(ctx, 14, 248, 52, 22, 6); fillStroke(ctx, shade(p.stone, -0.2));
    rr(ctx, 164, 248, 52, 22, 6); fillStroke(ctx, shade(p.stone, -0.2));
  });
  canvasTexture(scene, 'portal_swirl', 200, 200, (ctx) => {
    ctx.fillStyle = radGrad(ctx, 100, 100, 4, 100, [[0, '#ffffff'], [0.3, hexA(p.glowB, 0.95)], [0.8, hexA(p.skyMid, 0.85)], [1, hexA(p.skyMid, 0)]]);
    circle(ctx, 100, 100, 100); ctx.fill();
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let t = 0; t < 1; t += 0.02) {
        const a = arm * (Math.PI / 2) + t * Math.PI * 2.2;
        const rr2 = 8 + t * 86;
        const x = 100 + Math.cos(a) * rr2, y = 100 + Math.sin(a) * rr2;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = arm % 2 ? hexA(p.glowA, 0.8) : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 6; ctx.stroke();
    }
  });
}

export function buildCommonFx(scene) {
  canvasTexture(scene, 'p_glow', 32, 32, (ctx) => glow(ctx, 16, 16, 16, '#ffffff', 1));
  canvasTexture(scene, 'p_star', 24, 24, (ctx) => { star(ctx, 12, 12, 4, 11, 3); ctx.fillStyle = '#ffffff'; ctx.fill(); });
  canvasTexture(scene, 'p_dot', 8, 8, (ctx) => { circle(ctx, 4, 4, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); });
  canvasTexture(scene, 'p_pixel', 6, 6, (ctx) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 6, 6); });
  canvasTexture(scene, 'pulse_ring', 256, 256, (ctx) => {
    circle(ctx, 128, 128, 120);
    ctx.strokeStyle = 'rgba(160,255,240,0.9)'; ctx.lineWidth = 8; ctx.stroke();
    circle(ctx, 128, 128, 108);
    ctx.strokeStyle = 'rgba(246,201,69,0.5)'; ctx.lineWidth = 4; ctx.stroke();
  });
  canvasTexture(scene, 'rays', 512, 512, (ctx) => {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(256, 256);
      ctx.arc(256, 256, 256, a, a + Math.PI / 16);
      ctx.closePath();
      ctx.fillStyle = radGrad(ctx, 256, 256, 0, 256, [[0, 'rgba(255,243,160,0.7)'], [1, 'rgba(255,243,160,0)']]);
      ctx.fill();
    }
  });
  canvasTexture(scene, 'shadow', 64, 20, (ctx) => { ellipse(ctx, 32, 10, 30, 8); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill(); });
}

// Plataforma flotante con musgo, generada por ancho.
export function platformTexture(scene, width, level = 1, kind = 'stone') {
  const key = `plat_${kind}_${level}_${width}`;
  const p = PALETTES[level];
  return canvasTexture(scene, key, width, 64, (ctx, w) => {
    const r = rng(width + level);
    if (kind === 'crystal') {
      glow(ctx, w / 2, 20, w / 2, '#8ff5ff', 0.35);
      ctx.beginPath();
      ctx.moveTo(6, 10); ctx.lineTo(w - 6, 10); ctx.lineTo(w - 18, 34); ctx.lineTo(w / 2, 44); ctx.lineTo(18, 34); ctx.closePath();
      ctx.fillStyle = linGrad(ctx, 0, 10, 0, 44, [[0, 'rgba(210,255,255,0.95)'], [1, 'rgba(80,200,230,0.8)']]);
      ctx.fill(); ctx.strokeStyle = '#1c6f8a'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
      for (let x = 24; x < w - 20; x += 26) { ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x + 10, 30); ctx.stroke(); }
      for (let i = 0; i < w / 30; i++) { star(ctx, 10 + r() * (w - 20), 14 + r() * 20, 4, 4, 1.4); ctx.fillStyle = '#ffffff'; ctx.fill(); }
      return;
    }
    rr(ctx, 4, 12, w - 8, 30, 13);
    ctx.fillStyle = linGrad(ctx, 0, 12, 0, 42, [[0, shade(p.stone, 0.1)], [1, shade(p.stone, -0.3)]]);
    ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.5; ctx.stroke();
    for (let i = 0; i < w / 28; i++) { ellipse(ctx, 14 + r() * (w - 28), 28 + r() * 8, 5, 2.5); ctx.fillStyle = shade(p.stone, -0.25); ctx.fill(); }
    ctx.beginPath();
    ctx.moveTo(2, 18);
    ctx.quadraticCurveTo(2, 4, 16, 4);
    ctx.lineTo(w - 16, 4);
    ctx.quadraticCurveTo(w - 2, 4, w - 2, 18);
    for (let x = w - 6; x >= 6; x -= 10) ctx.lineTo(x, 18 + ((x / 10) % 2 ? 5 : 0));
    ctx.closePath();
    fillStroke(ctx, p.grass, shade(p.grass, -0.4), 2);
    ctx.fillStyle = p.grassLight; ctx.fillRect(10, 6, w - 20, 3);
    for (let x = 16; x < w - 10; x += 34 + r() * 20) {
      const len = 6 + r() * 10;
      line(ctx, x, 40, x, 40 + len, '#3f9a5a', 3);
      circle(ctx, x, 42 + len, 2.5); ctx.fillStyle = r() > 0.5 ? p.glowA : p.glowB; ctx.fill();
    }
  });
}
