import Phaser from 'phaser';
import Player from '../systems/PlayerController.js';
import Bit from '../entities/Bit.js';
import Interactable from '../entities/Interactable.js';
import { buildLevelArt } from '../art/index.js';
import { platformTexture } from '../art/environment.js';
import { input } from '../systems/InputManager.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';
import { quests } from '../systems/QuestManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { PLAYER } from '../config.js';
import { reducedMotion, makeText } from '../ui/helpers.js';

// Motor de aventura compartido por los tres niveles: mundo, físicas,
// plataformas, peligros, coleccionables, puntos de control, interacción,
// cámara con parallax y comunicación con la interfaz (UIScene).
export default class BaseLevelScene extends Phaser.Scene {
  constructor(key, levelId) {
    super(key);
    this.levelId = levelId;
  }

  // Los niveles definen: worldWidth, worldHeight, music y buildLevel().
  get worldWidth() { return 3000; }
  get worldHeight() { return 1100; }
  get music() { return 'forest'; }

  create() {
    this._leaving = false;
    this.cutscene = false;
    this.puzzleOpen = false;
    this.hearts = PLAYER.maxHearts;
    this.orbCount = 0;
    this.orbTotal = 0;
    this.interactables = [];
    this.triggers = [];
    this.checkpoints = [];
    this.lupaTargets = [];
    this.movers = [];
    this.updaters = [];
    this.L = `l${this.levelId}`;

    buildLevelArt(this, this.levelId);
    save.progress.currentLevel = this.levelId;
    save.progress.started = true;
    save.saveProgress();

    const W = this.worldWidth, H = this.worldHeight;
    this.physics.world.setBounds(0, -400, W, H + 800);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.buildParallax();
    this.solids = this.physics.add.staticGroup();
    this.oneWays = this.physics.add.staticGroup();
    this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });
    this.orbs = this.physics.add.group({ allowGravity: false, immovable: true });
    this.moverGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    this.buildLevel();

    const cp = this.checkpoints[Math.min(save.getCheckpoint(this.levelId), this.checkpoints.length - 1)] || { x: 160, y: H - 140 };
    this.player = new Player(this, cp.x + 40, cp.y);
    this.bit = new Bit(this, cp.x - 40, cp.y - 140);
    this.checkpoints.forEach((c, i) => { if (i <= save.getCheckpoint(this.levelId)) this.lightCheckpoint(c, false); });

    this.physics.add.collider(this.player, this.solids);
    const oneWayCheck = (player, plat) => {
      const b = player.body;
      return b.velocity.y >= 0 && b.prev.y + b.height <= plat.body.top + 10;
    };
    this.physics.add.collider(this.player, this.oneWays, null, oneWayCheck);
    this.physics.add.collider(this.player, this.moverGroup, null, oneWayCheck);
    this.physics.add.overlap(this.player, this.hazards, (p, h) => this.onHazard(h));
    this.physics.add.overlap(this.player, this.orbs, (p, o) => this.collectOrb(o));

    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, H);
    cam.startFollow(this.player, true, 0.1, 0.12, 0, 90);
    cam.setDeadzone(120, 90);
    cam.fadeIn(500, 6, 26, 30);

    this.ambient();

    // Interfaz
    if (this.scene.isActive('UIScene')) this.scene.stop('UIScene');
    this.ui = this.scene.get('UIScene');
    this.uiReady = new Promise((resolve) => this.ui.events.once('create', resolve));
    this.scene.launch('UIScene', { levelKey: this.scene.key, levelId: this.levelId });
    this.events.once('shutdown', () => this.onShutdown());

    audio.music(this.music);
    this.uiReady.then(() => {
      this.ui.setHearts(this.hearts);
      this.ui.setOrbs(0, this.orbTotal);
      this.refreshObjective();
      this.time.delayedCall(350, () => this.onStart());
    });
  }

  onShutdown() {
    // Los objetos del mundo se destruyen con la escena; aquí solo se cierra la interfaz.
    this.scene.stop('UIScene');
    this.player = null;
    input.releaseAll();
  }

  // Ganchos para los niveles
  buildLevel() {}
  onStart() {}
  refreshObjective() {}

  isBusy() {
    return this.cutscene || this.puzzleOpen || !this.ui?.sys?.isActive() || this.ui.isBusy();
  }

  // ---------- Fondo con profundidad ----------
  buildParallax() {
    const { width, height } = this.scale;
    this.add.image(0, 0, `bg_${this.L}_sky`).setOrigin(0).setScrollFactor(0).setDepth(-100).setDisplaySize(width, height);
    this.layers = [
      { key: 'far', f: 0.15, depth: -90 },
      { key: 'mid', f: 0.35, depth: -80 },
      { key: 'near', f: 0.6, depth: -70 }
    ].map((l) => ({
      ...l,
      sprite: this.add.tileSprite(0, 0, width, 900, `bg_${this.L}_${l.key}`).setOrigin(0).setScrollFactor(0).setDepth(l.depth)
    }));
  }

  updateParallax() {
    const cam = this.cameras.main;
    const maxScroll = Math.max(1, this.worldHeight - this.scale.height);
    for (const l of this.layers) {
      l.sprite.tilePositionX = cam.scrollX * l.f;
      l.sprite.y = this.scale.height - 900 + (maxScroll - cam.scrollY) * l.f * 0.5;
    }
  }

  ambient() {
    const W = this.worldWidth, H = this.worldHeight;
    this.fireflies = this.add.particles(0, 0, 'p_glow', {
      x: { min: 0, max: W }, y: { min: 120, max: H - 120 },
      lifespan: 5000, speedX: { min: -12, max: 12 }, speedY: { min: -18, max: 6 },
      scale: { start: 0.35, end: 0.1 }, alpha: { start: 0.9, end: 0 },
      tint: [0xf6e27a, 0x7ff5dc], blendMode: 'ADD', frequency: reducedMotion() ? 500 : 110, maxAliveParticles: 70
    }).setDepth(-5);
  }

  // ---------- Constructores de mundo ----------
  addGround(x, w, top, { caps = true } = {}) {
    const H = this.worldHeight;
    this.add.tileSprite(x, top, w, 64, `ground_top_${this.L}`).setOrigin(0).setDepth(2);
    this.add.tileSprite(x, top + 64, w, H - top + 40, `ground_fill_${this.L}`).setOrigin(0).setDepth(2);
    if (caps) {
      this.add.image(x - 12, top - 4, `ground_cap_${this.L}`).setOrigin(0).setDepth(3);
      this.add.image(x + w - 16, top - 4, `ground_cap_${this.L}`).setOrigin(0).setDepth(3).setFlipX(true);
    }
    const zone = this.add.zone(x, top + 6, w, H - top + 200).setOrigin(0);
    this.physics.add.existing(zone, true);
    this.solids.add(zone);
    return zone;
  }

  addWall(x, top, w, h) {
    const zone = this.add.zone(x, top, w, h).setOrigin(0);
    this.physics.add.existing(zone, true);
    this.solids.add(zone);
    return zone;
  }

  addPlatform(x, y, w, { kind = 'stone', hidden = false } = {}) {
    const key = platformTexture(this, w, this.levelId, kind);
    const img = this.add.image(x, y - 4, key).setOrigin(0).setDepth(4);
    const zone = this.add.zone(x + 6, y + 4, w - 12, 24).setOrigin(0);
    this.physics.add.existing(zone, true);
    this.oneWays.add(zone);
    if (hidden) {
      img.setAlpha(0);
      zone.body.enable = false;
    }
    return { img, zone };
  }

  addMovingPlatform(x, y, w, { dx = 0, dy = 0, speed = 80 } = {}) {
    const key = platformTexture(this, w, this.levelId, 'stone');
    const img = this.moverGroup.create(x, y - 4, key).setOrigin(0).setDepth(4);
    img.body.setSize(w - 12, 24).setOffset(6, 8);
    img.body.setAllowGravity(false).setImmovable(true);
    img.body.friction.x = 1;
    const m = { img, x0: x, y0: y - 4, dx, dy, speed, dir: 1 };
    const len = Math.hypot(dx, dy) || 1;
    img.body.setVelocity((dx / len) * speed, (dy / len) * speed);
    this.movers.push(m);
    return m;
  }

  updateMovers() {
    for (const m of this.movers) {
      const b = m.img.body;
      const px = m.img.x - m.x0, py = m.img.y - m.y0;
      const t = m.dx ? px / m.dx : py / m.dy;
      const len = Math.hypot(m.dx, m.dy) || 1;
      if ((t >= 1 && m.dir > 0) || (t <= 0 && m.dir < 0)) {
        m.dir *= -1;
        b.setVelocity((m.dx / len) * m.speed * m.dir, (m.dy / len) * m.speed * m.dir);
      }
    }
  }

  addDecor(key, x, y, { scale = 1, depth = 1, flip = false, alpha = 1, origin = [0.5, 1], sway = false } = {}) {
    const img = this.add.image(x, y, key).setOrigin(...origin).setScale(scale).setDepth(depth).setFlipX(flip).setAlpha(alpha);
    if (sway && !reducedMotion()) this.tweens.add({ targets: img, angle: { from: -2, to: 2 }, duration: 1800 + Math.random() * 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return img;
  }

  addBramble(x, groundY, scale = 1) {
    const b = this.hazards.create(x, groundY + 4, 'bramble').setOrigin(0.5, 1).setScale(scale).setDepth(5);
    b.body.setSize(100, 34).setOffset(14, 26);
    return b;
  }

  addSpark(x, y, { dx = 0, dy = 120, ms = 1600 } = {}) {
    const s = this.hazards.create(x, y, 'spark').setDepth(6);
    s.body.setCircle(13, 7, 7);
    s.setBlendMode('ADD');
    this.tweens.add({ targets: s, x: x + dx, y: y + dy, duration: ms, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: s, angle: 360, duration: 2000, repeat: -1 });
    return s;
  }

  addOrb(x, y) {
    const o = this.orbs.create(x, y, 'orb').setDepth(6).setBlendMode('ADD');
    o.body.setCircle(14, 2, 2);
    if (!reducedMotion()) this.tweens.add({ targets: o, y: y - 8, duration: 900 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.orbTotal += 1;
    return o;
  }

  addOrbArc(x, y, n = 5, spacing = 44, height = 40) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      this.addOrb(x + i * spacing, y - Math.sin(t * Math.PI) * height);
    }
  }

  addCheckpoint(x, groundY) {
    const img = this.add.image(x, groundY + 4, 'lantern_off').setOrigin(0.5, 1).setDepth(3);
    const cp = { x, y: groundY - 10, img, lit: false, index: this.checkpoints.length };
    this.checkpoints.push(cp);
    return cp;
  }

  lightCheckpoint(cp, announce = true) {
    if (cp.lit) return;
    cp.lit = true;
    cp.img.setTexture('lantern_on');
    const glow = this.add.image(cp.x, cp.y - 74, 'p_glow').setScale(3).setTint(0xf6e27a).setBlendMode('ADD').setDepth(2).setAlpha(0.7);
    if (!reducedMotion()) this.tweens.add({ targets: glow, alpha: 0.35, scale: 2.4, duration: 1100, yoyo: true, repeat: -1 });
    if (announce) {
      audio.sfx('checkpoint');
      save.setCheckpoint(this.levelId, cp.index);
      this.ui.toast('¡Punto de control!', 'icon_star', 1500);
      this.onCheckpoint?.(cp);
    }
  }

  addInteractable(opts) {
    const it = new Interactable(this, opts);
    this.interactables.push(it);
    return it;
  }

  // Zona que se activa al pasar (una vez por defecto).
  addTrigger(x1, x2, fn, { once = true, cond = null, y1 = -Infinity, y2 = Infinity } = {}) {
    const t = { x1, x2, y1, y2, fn, once, cond, fired: false, inside: false };
    this.triggers.push(t);
    return t;
  }

  // ---------- Bucle ----------
  update(time, delta) {
    if (!this.player) return;
    this.updateParallax();
    this.updateMovers();
    this.bit.follow(this.player, time, delta);
    for (const u of this.updaters) u(time, delta);

    const busy = this.isBusy();
    this.player.controlsEnabled = !busy;
    if (busy) input.clearPressed();
    this.player.update(time, delta);
    if (busy) return;

    // Puntos de control
    for (const cp of this.checkpoints) {
      if (!cp.lit && Math.abs(this.player.x - cp.x) < 50 && this.player.onGround) this.lightCheckpoint(cp);
    }

    // Disparadores
    for (const t of this.triggers) {
      const inside = this.player.x >= t.x1 && this.player.x <= t.x2 && this.player.y >= t.y1 && this.player.y <= t.y2;
      if (inside && !t.inside && !(t.once && t.fired) && (!t.cond || t.cond())) {
        t.fired = true;
        t.fn();
      }
      t.inside = inside;
      if (this.isBusy()) return;
    }

    // Interacción
    let nearest = null, best = Infinity;
    for (const it of this.interactables) {
      if (!it.enabled) { it.setNear(false); continue; }
      const d = it.distanceTo(this.player);
      if (d < it.radius && d < best) { best = d; nearest = it; }
    }
    for (const it of this.interactables) it.setNear(it === nearest);
    this.ui.setInteractAvailable(!!nearest);
    this.bit.showAlert(!!nearest);
    if (input.justPressed('interact') && nearest) {
      this.player.playInteract();
      this.player.stop();
      nearest.onInteract(nearest);
    }

    if (input.justPressed('tool')) this.useTool();
    if (input.justPressed('pause')) this.ui.openOverlay('PauseScene');
    if (input.justPressed('inventory')) this.ui.openOverlay('InventoryScene');
    if (input.justPressed('hint')) this.ui.playHint();

    // Caída
    if (this.player.y > this.worldHeight + 120) this.onFall();
  }

  // ---------- Herramientas ----------
  useTool() {
    if (!inventory.has('lupa')) {
      this.bit.say('Aún no tenemos herramientas.', 1800, 'think');
      return;
    }
    const now = this.time.now;
    if (now < (this.toolCooldown || 0)) return;
    this.toolCooldown = now + 700;
    this.player.playInteract();
    audio.sfx('reveal');
    const ring = this.add.image(this.player.x, this.player.y - 50, 'pulse_ring').setScale(0.1).setDepth(20).setBlendMode('ADD');
    this.tweens.add({ targets: ring, scale: 3.6, alpha: 0, duration: 800, ease: 'Cubic.Out', onComplete: () => ring.destroy() });
    let found = 0;
    for (const t of this.lupaTargets) {
      if (t.revealed) continue;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y) < (t.radius || 520)) {
        t.revealed = true;
        found += 1;
        this.time.delayedCall(250, () => t.reveal());
      }
    }
    if (!found) this.bit.say('La lupa no ve nada escondido aquí.', 1800, 'think');
    this.onToolUsed?.(found);
  }

  addLupaTarget({ x, y, radius = 520, reveal, hintSparkle = true }) {
    const t = { x, y, radius, revealed: false, reveal };
    if (hintSparkle) {
      t.sparkle = this.add.particles(x, y, 'p_star', {
        lifespan: 900, speed: { min: 10, max: 40 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.8, end: 0 },
        tint: 0x9ff5ff, frequency: 500, blendMode: 'ADD', emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-60, -20, 120, 40) }
      }).setDepth(7);
      const orig = reveal;
      t.reveal = () => { t.sparkle.stop(); orig(); };
    }
    this.lupaTargets.push(t);
    return t;
  }

  revealPlatform(p, delay = 0) {
    this.time.delayedCall(delay, () => {
      p.zone.body.enable = true;
      this.tweens.add({ targets: p.img, alpha: 1, duration: 500 });
      const burst = this.add.particles(p.img.x + p.img.width / 2, p.img.y + 20, 'p_star', {
        speed: { min: 40, max: 160 }, lifespan: 700, scale: { start: 0.7, end: 0 }, tint: [0x9ff5ff, 0xffffff], emitting: false, blendMode: 'ADD'
      }).setDepth(20);
      burst.explode(18);
      this.time.delayedCall(900, () => burst.destroy());
    });
  }

  // ---------- Daño, caída y coleccionables ----------
  onHazard(h) {
    if (this.isBusy()) return;
    if (this.player.hurt(h.x)) this.loseHeart();
  }

  loseHeart() {
    this.hearts -= 1;
    this.ui.setHearts(this.hearts);
    if (this.hearts <= 0) {
      this.hearts = PLAYER.maxHearts;
      this.time.delayedCall(400, () => this.respawn(true));
    }
  }

  onFall() {
    if (this.falling) return;
    this.falling = true;
    audio.sfx('hurt');
    this.hearts = Math.max(0, this.hearts - 1);
    this.ui.setHearts(this.hearts);
    const all = this.hearts <= 0;
    if (all) this.hearts = PLAYER.maxHearts;
    this.respawn(all);
  }

  respawn(withMessage) {
    const cam = this.cameras.main;
    cam.fadeOut(250, 6, 26, 30);
    cam.once('camerafadeoutcomplete', () => {
      const idx = Math.min(save.getCheckpoint(this.levelId), this.checkpoints.length - 1);
      const cp = this.checkpoints[idx];
      this.player.respawn(cp.x + 40, cp.y);
      this.bit.setPosition(cp.x - 40, cp.y - 140);
      cam.fadeIn(300, 6, 26, 30);
      this.falling = false;
      this.ui.setHearts(this.hearts);
      if (withMessage) this.say('l1_fallen');
    });
  }

  collectOrb(o) {
    if (!o.active) return;
    o.disableBody(true, false);
    audio.sfx('orb');
    this.tweens.add({ targets: o, y: o.y - 40, scale: 1.6, alpha: 0, duration: 300, onComplete: () => o.destroy() });
    this.orbCount += 1;
    save.progress.stats.orbs += 1;
    this.ui.setOrbs(this.orbCount, this.orbTotal);
    if (this.orbCount === this.orbTotal) this.ui.toast('¡Encontraste todas las chispas de luz!', 'orb', 2500);
  }

  // ---------- Narrativa ----------
  say(idOrLines) {
    this.player.stop();
    return this.ui.dialogue.play(idOrLines);
  }

  async cut(fn) {
    this.cutscene = true;
    this.player.stop();
    try {
      await fn();
    } finally {
      this.cutscene = false;
      input.clearPressed();
    }
  }

  wait(ms) {
    return new Promise((r) => this.time.delayedCall(ms, r));
  }

  tween(cfg) {
    return new Promise((r) => this.tweens.add({ ...cfg, onComplete: r }));
  }

  floatText(x, y, text, color = '#ffffff') {
    const t = makeText(this, x, y, text, { size: 24, weight: '800', color, stroke: '#16303a', strokeThickness: 6 }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, y: y - 60, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  // Abre un acertijo en pantalla completa y espera su resultado.
  openPuzzle(key, data = {}) {
    return new Promise((resolve) => {
      this.puzzleOpen = true;
      this.player.stop();
      input.releaseAll();
      this.ui.setHudVisible(false);
      this.scene.pause();
      this.scene.launch(key, {
        ...data,
        onDone: (result) => {
          this.scene.resume();
          this.ui.setHudVisible(true);
          this.puzzleOpen = false;
          input.releaseAll();
          resolve(result || { completed: false });
        }
      });
      this.scene.bringToTop(key);
    });
  }

  completeMission(id) {
    return quests.complete(id);
  }
}
