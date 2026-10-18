import BaseLevelScene from './BaseLevelScene.js';
import { quests } from '../systems/QuestManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';
import { makeText, reducedMotion, fadeTo } from '../ui/helpers.js';

const G = 860;
const STORM = { x1: 4560, x2: 5060 };

// NIVEL 2 — El Laberinto de las Trampas
// Misión 4: Portal del premio (phishing)        → Escudo Antiphishing (rompe portales engañosos)
// Misión 5: Visitante misterioso (Eco)           → Espada de los Límites (corta cadenas de presión)
// Misión 6: Las palabras que pesan (Nubarrón)    → Capa de Privacidad (cruza la tormenta de mensajes)
// Final: Pedestal de la Protección → Cristal → Portal a la Fortaleza
export default class Level2Scene extends BaseLevelScene {
  constructor() {
    super('Level2Scene', 2);
  }

  get worldWidth() { return 6500; }
  get music() { return 'calm'; }
  get shardKeys() { return ['shard2_a', 'shard2_b', 'shard2_c']; }

  done(id) { return quests.isComplete(id); }

  buildLevel() {
    this.buildScenery();
    this.buildSectionPrize();
    this.buildSectionMaze();
    this.buildSectionEco();
    this.buildSectionStorm();
    this.buildSectionCrystal();
  }

  buildScenery() {
    [[300, 0.9], [1250, 1], [2700, 0.85], [3900, 1.05], [5450, 0.95], [6300, 1]].forEach(([x, s], i) => this.addDecor('tree_l2', x, G + 14, { scale: s, depth: -20, flip: i % 2 === 1 }));
    [520, 1700, 2900, 3700, 4400, 5600, 6050].forEach((x, i) => this.addDecor(i % 2 ? 'mushroom' : 'flower', x, G + 4, { depth: 3, sway: true }));
    this.voids = [];
    const voidBand = (x1, x2) => this.voids.push(this.add.tileSprite(x1, G + 110, x2 - x1, this.worldHeight - G, 'water').setOrigin(0).setDepth(1).setTint(0xb8a6ff));
    voidBand(2400, 2660);
    this.updaters.push((time) => this.voids.forEach((v) => { v.tilePositionX = time * 0.03; }));
  }

  // ---------- Sección 1: el portal del premio ----------
  buildSectionPrize() {
    this.addGround(0, 2400, G);
    this.addCheckpoint(150, G);
    this.addBlock(380, G - 120, 128, 120);
    this.addOrbArc(390, G - 170, 3, 50, 10);
    this.addPlatform(560, G - 230, 150);
    this.addOrbArc(580, G - 280, 3, 50, 10);

    // Portal del premio de Glitch (Misión 4)
    this.prizePortal = this.add.image(900, G + 8, 'prize_portal').setOrigin(0.5, 1).setDepth(1);
    this.prizeText = makeText(this, 900, G - 260, '¡PREMIO!', { size: 30, weight: '800', color: '#fff3a0', stroke: '#7136e0', strokeThickness: 8 }).setOrigin(0.5).setDepth(2);
    if (!reducedMotion()) this.tweens.add({ targets: this.prizeText, scale: 1.12, duration: 500, yoyo: true, repeat: -1 });
    this.glitch = this.add.sprite(1010, G - 170, 'glitch_0').setDepth(6).play('glitch_jitter');
    if (!reducedMotion()) this.tweens.add({ targets: this.glitch, y: G - 195, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    if (this.done('m4')) this.calmPrizePortal();
    this.addInteractable({ x: 900, y: G - 100, radius: 170, label: 'Inspeccionar', promptY: -190, onInteract: () => this.missionFour() });

    this.addBramble(1200, G);
    this.addOrbArc(1150, G - 110, 3, 55, 60);
    this.addPlatform(1300, G - 140, 150);
    this.addCheckpoint(1360, G);

    // Portal engañoso que bloquea el paso (se rompe con el Escudo)
    this.fakePortal = this.add.image(1580, G + 8, 'fake_portal').setOrigin(0.5, 1).setDepth(6);
    this.fakeWall = this.addWall(1550, G - 420, 60, 430);
    if (save.getFlag('l2_portal1')) { this.fakePortal.setVisible(false); this.fakeWall.body.enable = false; }
    else {
      if (!reducedMotion()) this.tweens.add({ targets: this.fakePortal, scaleX: 1.06, duration: 300, yoyo: true, repeat: -1 });
      this.addToolTarget({ tool: 'escudo', x: 1580, y: G - 120, radius: 320, tint: 0xd9c2ff, reveal: () => this.breakFakePortal() });
    }
    this.addTrigger(1440, 1550, () => {
      if (inventory.has('escudo')) this.bit.say('¡Usa el Escudo Antiphishing! ' + this.toolHint(), 2600, 'think');
      else this.say('l2_fake_portal');
    }, { once: false, cond: () => !save.getFlag('l2_portal1') });
  }

  toolHint() {
    return this.ui?.touch?.visible ? '(botón de herramienta)' : '(tecla Q)';
  }

  calmPrizePortal() {
    this.glitch.setVisible(false);
    this.prizePortal.setTint(0x8a8aa8).setAlpha(0.7);
    this.prizeText.setText('CERRADO').setColor('#d8d8f0');
    this.tweens.killTweensOf(this.prizeText);
    this.prizeText.setScale(1);
  }

  breakFakePortal() {
    save.setFlag('l2_portal1');
    audio.sfx('crystal');
    this.tweens.killTweensOf(this.fakePortal);
    const burst = this.add.particles(1580, G - 130, 'p_pixel', { speed: { min: 80, max: 260 }, lifespan: 900, tint: [0xb07bff, 0xff7ad9, 0x6ff7e0, 0xffffff], emitting: false }).setDepth(20);
    burst.explode(70);
    this.cameras.main.flash(250, 220, 200, 255);
    this.tweens.add({ targets: this.fakePortal, scaleX: 0, scaleY: 1.3, alpha: 0, duration: 500, ease: 'Back.In', onComplete: () => this.fakePortal.setVisible(false) });
    this.fakeWall.body.enable = false;
    this.time.delayedCall(600, () => {
      this.bit.say('¡Portal engañoso desactivado!', 2200, 'happy');
      this.refreshObjective();
    });
  }

  // ---------- Sección 2: laberinto con pasadizo secreto ----------
  buildSectionMaze() {
    this.addCheckpoint(1760, G);
    this.addBlock(1900, G - 150, 160, 150);
    this.addOrbArc(1910, G - 200, 3, 55, 10);
    this.addPlatform(2120, G - 270, 140);
    // pasadizo secreto (Lupa)
    const h1 = this.addPlatform(2300, G - 380, 120, { kind: 'crystal', hidden: true });
    const h2 = this.addPlatform(2470, G - 470, 130, { kind: 'crystal', hidden: true });
    this.secretChest = this.add.image(2535, G - 470, 'chest_small_closed').setOrigin(0.5, 1).setDepth(5).setAlpha(0);
    const chestIt = this.addInteractable({ x: 2535, y: G - 505, radius: 110, label: 'Abrir', promptY: -90, enabled: false, onInteract: (it) => this.openSecret(it) });
    const reveal = (instant) => {
      [h1, h2].forEach((p, i) => (instant ? (p.img.setAlpha(1), p.zone.body.enable = true) : this.revealPlatform(p, i * 250)));
      if (instant) this.secretChest.setAlpha(1); else this.tweens.add({ targets: this.secretChest, alpha: 1, duration: 600, delay: 500 });
      if (save.getFlag('l2_secretChest')) this.secretChest.setTexture('chest_small_open');
      chestIt.setEnabled(!save.getFlag('l2_secretChest'));
      save.setFlag('l2_secretRevealed');
    };
    if (save.getFlag('l2_secretRevealed')) reveal(true);
    else this.addLupaTarget({ x: 2390, y: G - 420, radius: 420, reveal: () => reveal(false) });

    // vacío de datos con plataforma móvil
    this.addMovingPlatform(2420, G - 30, 120, { dx: 120, speed: 70 });
    this.addOrbArc(2470, G - 110, 3, 50, 25);
  }

  openSecret(it) {
    if (save.getFlag('l2_secretChest')) return;
    this.cut(async () => {
      it.setEnabled(false);
      save.setFlag('l2_secretChest');
      audio.sfx('open');
      this.secretChest.setTexture('chest_small_open');
      for (let i = 0; i < 6; i++) this.addOrb(this.secretChest.x - 75 + i * 30, this.secretChest.y - 90 - (i % 2) * 22);
      this.ui.setOrbs(this.orbCount, this.orbTotal);
      await this.say('l2_hidden');
    });
  }

  // ---------- Sección 3: el visitante misterioso ----------
  buildSectionEco() {
    this.addGround(2660, 1700, G);
    this.addCheckpoint(2760, G);
    this.addSpark(2950, G - 230, { dy: 100, ms: 1500 });
    this.addBlock(3200, G - 110, 128, 110);
    this.addOrbArc(3210, G - 160, 3, 50, 10);

    this.eco = this.add.image(3480, G - 70, this.done('m5') ? 'eco' : 'eco_mask').setDepth(5).setVisible(!this.done('m5'));
    if (!reducedMotion()) this.tweens.add({ targets: this.eco, y: G - 90, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addInteractable({ x: 3480, y: G - 70, radius: 160, label: 'Hablar', promptY: -110, onInteract: () => this.missionFive() });

    // Cadenas de presión (se cortan con la Espada)
    this.chains = this.add.image(3760, G + 8, 'chains').setOrigin(0.5, 1).setDepth(6);
    this.chainWall = this.addWall(3730, G - 420, 60, 430);
    if (save.getFlag('l2_chains')) { this.chains.setVisible(false); this.chainWall.body.enable = false; }
    else this.addToolTarget({ tool: 'espada', x: 3760, y: G - 140, radius: 320, tint: 0x9ff5ff, reveal: () => this.cutChains() });
    this.addTrigger(3620, 3730, () => {
      if (inventory.has('espada')) this.bit.say('¡Usa la Espada de los Límites! ' + this.toolHint(), 2600, 'think');
      else if (!inventory.has('escudo')) this.bit.say('Primero hay que atravesar el portal engañoso del inicio.', 2600, 'think');
      else this.say('l2_chains');
    }, { once: false, cond: () => !save.getFlag('l2_chains') });
  }

  cutChains() {
    save.setFlag('l2_chains');
    audio.sfx('vines');
    const slash = this.add.image(3760, G - 150, 'item_espada').setScale(2).setAngle(-60).setDepth(25).setBlendMode('ADD');
    this.tweens.add({ targets: slash, angle: 60, alpha: 0, duration: 450, onComplete: () => slash.destroy() });
    const burst = this.add.particles(3760, G - 150, 'p_star', { speed: { min: 80, max: 240 }, lifespan: 800, tint: [0x9ff5ff, 0xd9c2ff, 0xffffff], emitting: false, blendMode: 'ADD' }).setDepth(20);
    burst.explode(40);
    this.tweens.add({ targets: this.chains, y: G + 300, alpha: 0, angle: 8, duration: 900, ease: 'Quad.In', onComplete: () => this.chains.setVisible(false) });
    this.chainWall.body.enable = false;
    this.time.delayedCall(700, () => {
      this.bit.say('¡Cadenas cortadas! Nadie puede obligarte a nada.', 2600, 'happy');
      this.refreshObjective();
    });
  }

  // ---------- Sección 4: Pío y la tormenta de Nubarrón ----------
  buildSectionStorm() {
    this.addCheckpoint(3900, G);
    this.addPlatform(4000, G - 160, 150);
    this.addOrbArc(4020, G - 210, 3, 50, 10);
    this.pio = this.add.image(4200, G + 6, this.done('m6') ? 'pio_happy' : 'pio_sad').setOrigin(0.5, 1).setDepth(5).setScale(1.1);
    this.cloud = this.add.image(4230, G - 230, 'nubarron').setDepth(6).setScale(1.2);
    if (!reducedMotion()) this.tweens.add({ targets: this.cloud, x: 4260, y: G - 245, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.drops = this.add.particles(0, 0, 'msg_bubble', {
      x: { min: 4170, max: 4290 }, y: G - 200, speedY: { min: 60, max: 110 }, lifespan: 1500,
      scale: { start: 0.55, end: 0.4 }, alpha: { start: 1, end: 0 }, frequency: reducedMotion() ? 1200 : 600
    }).setDepth(6);
    this.addInteractable({ x: 4200, y: G - 50, radius: 150, label: 'Ayudar', promptY: -100, onInteract: () => this.missionSix() });

    this.addGround(4360, 2140, G);
    this.addCheckpoint(4420, G);

    // Tormenta de mensajes hirientes (sin daño: empuja hacia atrás)
    this.stormClouds = [4650, 4820, 4990].map((x, i) => {
      const c = this.add.image(x, G - 330 + (i % 2) * 40, 'nubarron').setScale(1.6).setDepth(5).setTint(0x8a96b8);
      if (!reducedMotion()) this.tweens.add({ targets: c, y: c.y - 20, duration: 1200 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      return c;
    });
    this.storm = this.add.particles(0, 0, 'msg_bubble', {
      x: { min: STORM.x1, max: STORM.x2 + 80 }, y: { min: G - 300, max: G - 40 },
      speedX: { min: -260, max: -160 }, speedY: { min: -20, max: 20 }, lifespan: 2200,
      scale: { start: 0.6, end: 0.4 }, alpha: { start: 0.95, end: 0 }, frequency: reducedMotion() ? 260 : 90
    }).setDepth(15);
    this.aura = this.add.image(0, 0, 'cape_aura').setDepth(11).setVisible(false).setBlendMode('ADD');
    if (save.getFlag('l2_stormClear')) this.clearStorm(true);
    this.updaters.push(() => this.updateStorm());
    this.addOrbArc(4700, G - 60, 6, 60, 30);
  }

  updateStorm() {
    if (!this.player || save.getFlag('l2_stormClear')) return;
    const inside = this.player.x > STORM.x1 && this.player.x < STORM.x2;
    const protectedByCape = inventory.has('capa');
    this.aura.setVisible(inside && protectedByCape);
    if (inside && protectedByCape) {
      this.aura.setPosition(this.player.x, this.player.y - 50);
      if (!this.capeToldOnce) { this.capeToldOnce = true; this.bit.say('¡La Capa de Privacidad nos protege!', 2200, 'happy'); }
    } else if (inside && !this.isBusy()) {
      // el viento de mensajes empuja suavemente hacia atrás
      this.player.body.setVelocityX(Math.min(this.player.body.velocity.x, -230));
      if (!this.stormToldOnce) { this.stormToldOnce = true; this.say('l2_storm'); }
    }
    if (this.player.x > STORM.x2 + 40 && protectedByCape) this.clearStorm(false);
  }

  clearStorm(instant) {
    save.setFlag('l2_stormClear');
    this.storm.stop();
    this.aura.setVisible(false);
    this.stormClouds.forEach((c) => (instant ? c.setVisible(false) : this.tweens.add({ targets: c, alpha: 0, y: c.y - 120, duration: 1200 })));
    if (!instant) this.bit.say('¡Cruzamos la tormenta!', 2000, 'happy');
  }

  // ---------- Sección 5: cristal y portal ----------
  buildSectionCrystal() {
    this.addCheckpoint(5200, G);
    this.addPlatform(5350, G - 140, 150);
    this.addOrbArc(5370, G - 190, 3, 50, 10);
    this.luma = this.add.image(5560, G - 260, 'luma').setDepth(7).setVisible(this.done('m6'));
    if (!reducedMotion()) this.tweens.add({ targets: this.luma, y: this.luma.y - 14, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.addDecor('pedestal', 5800, G + 6, { depth: 3 });
    this.crystalBig = this.add.image(5800, G - 200, 'crystal_protection_big').setDepth(4).setScale(0.8).setVisible(save.getFlag('l2_crystal'));
    if (!reducedMotion()) this.tweens.add({ targets: this.crystalBig, y: G - 215, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addInteractable({ x: 5800, y: G - 70, radius: 150, label: 'Pedestal', promptY: -120, onInteract: () => this.crystalCeremony() });

    this.addDecor('portal_arch', 6250, G + 8, { depth: 2 });
    this.portal = this.add.container(6250, G - 128).setDepth(1).setScale(0.62, 0.86);
    this.portalSwirl = this.add.image(0, 0, 'portal_swirl').setBlendMode('ADD');
    this.portal.add(this.portalSwirl);
    this.portal.setVisible(save.getFlag('l2_crystal'));
    this.updaters.push((t, d) => { if (this.portal.visible && !reducedMotion()) this.portalSwirl.angle += d * 0.09; });
    this.portalIt = this.addInteractable({ x: 6250, y: G - 90, radius: 180, label: 'Entrar', promptY: -150, enabled: save.getFlag('l2_crystal'), onInteract: () => this.enterPortal() });
  }

  // ---------- Inicio y objetivos ----------
  onStart() {
    this.ui.setShards(this.shardCount(), this.crystalId, this.shardKeys);
    if (!save.getFlag('l2_intro')) {
      this.cut(async () => {
        this.bit.setPosition(this.player.x + 500, this.player.y - 300);
        await this.wait(500);
        await this.say('l2_intro');
        save.setFlag('l2_intro');
      });
    } else {
      this.bit.say('¡Sigamos por el laberinto!', 1800, 'happy');
    }
  }

  refreshObjective() {
    const m = (id) => ({ text: quests.get(id).objective, hint: quests.get(id).hint });
    let o;
    if (!this.done('m4')) o = m('m4');
    else if (!save.getFlag('l2_portal1')) o = { text: 'Rompe el portal engañoso con el Escudo', hint: 'Acércate al portal violeta que bloquea el camino y usa {TOOL}.' };
    else if (!this.done('m5')) o = m('m5');
    else if (!save.getFlag('l2_chains')) o = { text: 'Corta las cadenas de presión con la Espada', hint: 'Acércate a las cadenas violetas y usa {TOOL}. La espada no ataca a nadie: corta la presión.' };
    else if (!this.done('m6')) o = m('m6');
    else if (!save.getFlag('l2_crystal')) o = { text: 'Cruza la tormenta y lleva los fragmentos al Pedestal', hint: 'La Capa de Privacidad te protege en la tormenta. El pedestal está al final del laberinto.' };
    else o = { text: 'Entra al portal', hint: 'El portal está al final del laberinto. Acércate y usa {INTERACT}.' };
    quests.setObjective(o);
  }

  // ---------- Misión 4 ----------
  missionFour() {
    this.cut(async () => {
      if (this.done('m4')) { await this.say('l2_prize_after'); return; }
      await this.say('l2_prize_before');
      const r = await this.openPuzzle('PortalPuzzleScene', { mission: 'm4' });
      if (!r.completed) { this.bit.say('¡Podemos volver cuando quieras!', 2200, 'happy'); return; }
      this.completeMission('m4');
      audio.sfx('correct');
      await this.say([{ s: 'glitch', t: '¡Nooo! ¡Descubrieron mi truco! ¡Jijiji... me voy!' }]);
      const burst = this.add.particles(this.glitch.x, this.glitch.y, 'p_pixel', { speed: { min: 60, max: 220 }, lifespan: 600, tint: [0x8f4bff, 0xb07bff, 0x6ff7e0], emitting: false }).setDepth(9);
      burst.explode(30);
      this.calmPrizePortal();
      await this.ui.reward.give('escudo');
      this.ui.applyTouchVisibility();
      this.awardBadge('badge_antiphishing');
      this.gainShard();
      await this.say([{ s: 'bit', e: 'happy', t: 'Con el Escudo Antiphishing podemos romper los portales engañosos que bloquean el laberinto. Úsalo con {TOOL}.' }]);
      this.refreshObjective();
    });
  }

  // ---------- Misión 5 ----------
  missionFive() {
    this.cut(async () => {
      if (this.done('m5')) { await this.say('l2_eco_after'); return; }
      await this.say('l2_eco_before');
      const r = await this.openPuzzle('ChatPuzzleScene', { mission: 'm5' });
      if (!r.completed) { this.bit.say('Tómate tu tiempo. ¡Volvemos cuando quieras!', 2200, 'think'); return; }
      this.completeMission('m5');
      this.eco.setTexture('eco');
      audio.sfx('reveal');
      this.luma.setVisible(true).setPosition(3480, G - 520).setAlpha(0);
      this.tweens.add({ targets: this.luma, y: G - 250, alpha: 1, duration: 1000, ease: 'Sine.Out' });
      await this.wait(900);
      await this.say('l2_m5_done');
      this.tweens.killTweensOf(this.eco);
      this.tweens.add({ targets: this.eco, alpha: 0, scale: 0.3, y: G - 300, duration: 800, onComplete: () => this.eco.setVisible(false) });
      await this.ui.reward.give('espada');
      this.awardBadge('badge_limits');
      this.gainShard();
      this.tweens.add({ targets: this.luma, x: 5560, y: G - 260, alpha: 0, duration: 1600 });
      this.refreshObjective();
    });
  }

  // ---------- Misión 6 ----------
  missionSix() {
    this.cut(async () => {
      if (this.done('m6')) { await this.say('l2_pio_after'); return; }
      await this.say('l2_pio_before');
      const r = await this.openPuzzle('WordsPuzzleScene', { mission: 'm6' });
      if (!r.completed) { this.bit.say('Pío nos espera. ¡Volvamos pronto!', 2200, 'think'); return; }
      this.completeMission('m6');
      audio.sfx('correct');
      this.pio.setTexture('pio_happy');
      this.drops.stop();
      this.tweens.killTweensOf(this.cloud);
      this.tweens.add({ targets: this.cloud, y: G - 420, scale: 0.6, alpha: 0.3, duration: 1500 });
      await this.say('l2_m6_done');
      await this.ui.reward.give('capa');
      this.awardBadge('badge_kindness');
      this.gainShard();
      this.luma.setVisible(true).setAlpha(1);
      this.refreshObjective();
    });
  }

  // ---------- Cristal y portal ----------
  crystalCeremony() {
    this.cut(async () => {
      if (save.getFlag('l2_crystal')) { this.bit.say('¡El portal nos espera!', 1800, 'happy'); return; }
      if (this.shardCount() < 3) { await this.say('l2_pedestal_missing'); return; }
      await this.say('l2_pedestal');
      const shards = this.shardKeys.map((k) => this.add.image(this.player.x, this.player.y - 60, k).setDepth(30).setScale(1.2).setAlpha(0));
      shards.forEach((s, i) => this.tweens.add({ targets: s, alpha: 1, x: 5800 + (i - 1) * 70, y: G - 300 - (i % 2) * 30, duration: 800, delay: i * 200, ease: 'Sine.Out' }));
      await this.wait(1400);
      audio.sfx('crystal');
      await this.tween({ targets: shards, x: 5800, y: G - 200, angle: 360, duration: 900, ease: 'Cubic.In' });
      shards.forEach((s) => s.destroy());
      this.cameras.main.flash(500, 230, 220, 255);
      this.crystalBig.setVisible(true).setScale(0.2);
      this.tweens.add({ targets: this.crystalBig, scale: 0.8, duration: 700, ease: 'Back.Out' });
      const burst = this.add.particles(5800, G - 200, 'p_star', { speed: { min: 100, max: 300 }, lifespan: 1100, scale: { start: 1, end: 0 }, tint: [0x8f6bff, 0x3fb5e0, 0xffffff], emitting: false, blendMode: 'ADD' }).setDepth(30);
      burst.explode(60);
      save.setFlag('l2_crystal');
      this.ui.setShards(0, this.crystalId, this.shardKeys);
      await this.wait(800);
      await this.ui.reward.give('crystal_protection');
      this.portal.setVisible(true).setAlpha(0);
      this.tweens.add({ targets: this.portal, alpha: 1, duration: 900 });
      audio.sfx('portal');
      this.portalIt.setEnabled(true);
      await this.say('l2_crystal_done');
      this.refreshObjective();
    });
  }

  enterPortal() {
    this.cut(async () => {
      const p = this.player;
      p.body.setVelocity(0, 0);
      p.body.setAllowGravity(false);
      audio.sfx('portal');
      await this.tween({ targets: p, x: 6250, y: G - 60, scale: 0.2, alpha: 0, angle: 360, duration: 1000, ease: 'Cubic.In' });
      await this.say('l2_complete');
      await this.ui.reward.give('badge_protector');
      save.completeLevel(2);
      const choice = await this.ui.showLevelComplete({
        title: '¡Nivel completado!',
        subtitle: 'El Laberinto de las Trampas ya no engaña a nadie',
        skills: quests.forLevel(2).map((m) => m.learning),
        badge: 'badge_protector',
        nextLabel: 'Ir a la Fortaleza'
      });
      fadeTo(this, choice === 'next' ? 'Level3Scene' : 'MapScene');
    });
  }
}

