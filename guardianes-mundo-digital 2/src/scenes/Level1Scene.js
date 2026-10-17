import Phaser from 'phaser';
import BaseLevelScene from './BaseLevelScene.js';
import { quests } from '../systems/QuestManager.js';
import { inventory } from '../systems/InventoryManager.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';
import { makeText, reducedMotion, fadeTo } from '../ui/helpers.js';

const G = 860; // altura del suelo principal

// NIVEL 1 — El Bosque de las Señales
// Misión 1: Árbol Mensajero (mensajes)  → Lupa de la Verdad
// Misión 2: Cofre de los Secretos (clasificar información)
// Misión 3: Puente de confianza (ayudar a Tiko)
// Final: Pedestal del Conocimiento → Cristal → Portal al nivel 2
export default class Level1Scene extends BaseLevelScene {
  constructor() {
    super('Level1Scene', 1);
  }

  get worldWidth() { return 6700; }
  get worldHeight() { return 1100; }
  get music() { return 'forest'; }

  done(id) { return quests.isComplete(id); }

  buildLevel() {
    this.buildScenery();
    this.buildSectionStart();
    this.buildSectionFork();
    this.buildSectionChest();
    this.buildSectionBridge();
    this.buildSectionCrystal();
    this.updaters.push((time) => {
      this.water.forEach((w) => { w.tilePositionX = time * 0.03; });
    });
  }

  // ---------- Escenografía ----------
  buildScenery() {
    const trees = [[60, 0.95], [560, 1.1], [1350, 0.85], [2780, 1], [3480, 0.8], [4380, 1.05], [5520, 0.95], [6150, 0.9], [6600, 1.05]];
    trees.forEach(([x, s], i) => this.addDecor('tree_l1', x, G + 14, { scale: s, depth: -20, flip: i % 2 === 1 }));
    const flowers = [250, 520, 940, 1610, 2700, 3120, 3700, 4080, 4700, 5450, 5980, 6450];
    flowers.forEach((x, i) => this.addDecor(i % 3 === 0 ? 'mushroom' : 'flower', x, G + 4, { depth: 3, scale: 0.9 + (i % 2) * 0.2, sway: true }));
    [180, 1180, 2950, 3900, 5600, 6250].forEach((x) => this.addDecor('fern', x, G + 6, { depth: 3 }));
    [330, 1820, 3560, 4780, 6050].forEach((x) => this.addDecor('rock', x, G + 6, { depth: 3, scale: 0.9 }));
    // primer plano para dar profundidad
    [700, 2900, 5250].forEach((x) => this.addDecor('fern', x, G + 30, { depth: 25, scale: 1.6, alpha: 0.9 }));

    this.water = [];
    const waterBand = (x1, x2) => {
      const w = this.add.tileSprite(x1, G + 110, x2 - x1, this.worldHeight - G, 'water').setOrigin(0).setDepth(1).setAlpha(0.95);
      this.water.push(w);
    };
    waterBand(2040, 2630);
    waterBand(5000, 5350);
  }

  buildSectionStart() {
    this.addGround(0, 2050, G);
    this.addCheckpoint(150, G);

    // Árbol Mensajero (Misión 1)
    this.addDecor('tree_messenger', 820, G + 10, { depth: -4 });
    this.envelopes = [];
    if (!this.done('m1')) {
      ['envelope', 'envelope_glitch', 'envelope_glitch'].forEach((k, i) => {
        const e = this.add.image(820, G - 250, k).setDepth(-3);
        this.envelopes.push({ img: e, phase: (i * Math.PI * 2) / 3 });
      });
      this.updaters.push((time) => {
        for (const e of this.envelopes) {
          const a = time / 900 + e.phase;
          e.img.setPosition(820 + Math.cos(a) * 95, G - 250 + Math.sin(a) * 40);
          e.img.setDepth(Math.sin(a) > 0 ? 8 : -3);
        }
      });
    }
    this.addInteractable({ x: 820, y: G - 80, radius: 160, label: 'Revisar', promptY: -150, onInteract: () => this.missionOne() });

    // tutorial de salto
    this.addPlatform(400, G - 120, 170);
    this.addOrbArc(420, G - 170, 4, 40, 18);
    this.addOrbArc(230, G - 40, 3, 50, 0);
    this.addBramble(1100, G);
    this.addOrbArc(1040, G - 110, 3, 60, 60);
    this.addTrigger(960, 1040, () => this.say('l1_brambles'));
    this.addPlatform(1220, G - 130, 170);
    this.addOrbArc(1250, G - 180, 3, 50, 10);

    // Plataforma y cofre escondidos (se revelan con la Lupa)
    const hidden = this.addPlatform(1430, G - 255, 170, { kind: 'crystal', hidden: true });
    this.hiddenChest = this.add.image(1515, G - 255, 'chest_small_closed').setOrigin(0.5, 1).setDepth(5).setAlpha(0);
    const chestIt = this.addInteractable({ x: 1515, y: G - 290, radius: 110, label: 'Abrir', promptY: -90, enabled: false, onInteract: (it) => this.openHiddenChest(it) });
    const revealHidden = (instant) => {
      if (instant) { hidden.img.setAlpha(1); hidden.zone.body.enable = true; this.hiddenChest.setAlpha(1); }
      else { this.revealPlatform(hidden); this.tweens.add({ targets: this.hiddenChest, alpha: 1, duration: 600, delay: 300 }); }
      chestIt.setEnabled(!save.getFlag('l1_hiddenChest'));
      if (save.getFlag('l1_hiddenChest')) this.hiddenChest.setTexture('chest_small_open');
      save.setFlag('l1_hiddenRevealed');
    };
    if (save.getFlag('l1_hiddenRevealed')) revealHidden(true);
    else this.addLupaTarget({ x: 1510, y: G - 240, radius: 470, reveal: () => revealHidden(false) });
  }

  buildSectionFork() {
    this.addCheckpoint(1580, G);
    // Señal real (tapada por Glitch) y señal falsa junto al abismo
    this.realSign = this.add.image(1700, G + 6, 'sign_real').setOrigin(0.5, 1).setDepth(3);
    this.realSignText = makeText(this, 1690, G - 98, 'Sendero de\ncristal', { size: 19, color: '#3d2412', weight: '800', align: 'center' }).setOrigin(0.5).setDepth(4).setLineSpacing(-6);
    this.fakeSign = this.add.image(1965, G + 6, 'sign_down').setOrigin(0.5, 1).setDepth(3);
    this.fakeSignText = makeText(this, 1965, G - 50, '¡Premios!\nSalta aquí', { size: 18, color: '#8a1f5c', weight: '800', align: 'center' }).setOrigin(0.5).setDepth(4).setLineSpacing(-6);
    this.signGlitch = this.add.image(1690, G - 96, 'glitch_overlay').setDepth(5).setScale(0.82, 0.62).setAlpha(0.95);
    this.updaters.push((time) => { if (this.signGlitch.visible) this.signGlitch.x = (this.signGlitch.baseX ?? 1690) + (Math.floor(time / 120) % 3) - 1; });

    // Plataformas de cristal ocultas sobre el abismo
    this.crystalPath = [
      this.addPlatform(2110, G - 40, 130, { kind: 'crystal', hidden: true }),
      this.addPlatform(2290, G - 110, 130, { kind: 'crystal', hidden: true }),
      this.addPlatform(2470, G - 50, 120, { kind: 'crystal', hidden: true })
    ];
    this.addOrbArc(2300, G - 170, 3, 50, 12);

    if (save.getFlag('l1_revealed')) this.revealFork(true);
    else this.addLupaTarget({ x: 2150, y: G - 80, radius: 640, reveal: () => this.revealFork(false) });

    // Glitch aparece cuando ya tienes la Lupa
    this.addTrigger(1480, 1620, () => this.glitchCameo(), {
      cond: () => inventory.has('lupa') && !save.getFlag('l1_revealed') && !save.getFlag('l1_glitchSeen')
    });
    // Recordatorio si aún no tienes la Lupa
    this.addTrigger(1860, 2040, () => this.bit.say('El abismo es muy ancho... Primero revisemos el Árbol Mensajero.', 3000, 'think'), {
      once: false, cond: () => !inventory.has('lupa')
    });
    this.addTrigger(1860, 2040, () => this.bit.say('¡Usa la Lupa de la Verdad! ' + (this.toolHint()), 2600, 'think'), {
      once: false, cond: () => inventory.has('lupa') && !save.getFlag('l1_revealed')
    });
  }

  toolHint() {
    return this.ui ? (this.ui.touch?.visible ? '(botón de lupa)' : '(tecla Q)') : '';
  }

  buildSectionChest() {
    this.addGround(2620, 400, G);
    this.addCheckpoint(2700, G);
    this.addBramble(2860, G, 0.9);
    this.addOrbArc(2700, G - 50, 3, 55, 0);
    this.addOrbArc(2810, G - 120, 3, 50, 50);
    this.addSpark(3000, G - 240, { dy: 90, ms: 1500 });

    // meseta con el cofre
    this.addGround(3000, 520, G - 100);
    this.addPlatform(3080, G - 250, 150);
    this.addOrbArc(3100, G - 300, 3, 50, 10);
    this.addPlatform(3330, G - 370, 140);
    this.addOrbArc(3350, G - 420, 3, 45, 10);

    this.chest = this.add.image(3260, G - 96, this.done('m2') ? 'chest_open' : 'chest_closed').setOrigin(0.5, 1).setDepth(4);
    this.chestGlow = this.add.image(3260, G - 140, 'p_glow').setScale(5).setTint(0x6ff7e0).setBlendMode('ADD').setDepth(3).setAlpha(0.4);
    if (!reducedMotion()) this.tweens.add({ targets: this.chestGlow, alpha: 0.15, duration: 1200, yoyo: true, repeat: -1 });
    this.addInteractable({ x: 3260, y: G - 160, radius: 150, label: 'Abrir', promptY: -110, onInteract: () => this.missionTwo() });

    this.addGround(3520, 730, G);
    this.addSpark(3640, G - 250, { dy: 120, ms: 1700 });

    // Enredaderas de estática (se abren con la Misión 2)
    this.vines = this.add.image(3800, G + 8, 'vines').setOrigin(0.5, 1).setDepth(6);
    this.vinesWall = this.addWall(3770, G - 420, 60, 430);
    if (this.done('m2')) { this.vines.setVisible(false); this.vinesWall.body.enable = false; }
    this.addTrigger(3640, 3770, () => this.bit.say('Unas enredaderas de estática bloquean el paso. ¡La luz del cofre podría deshacerlas!', 3200, 'think'), {
      once: false, cond: () => !this.done('m2')
    });
  }

  buildSectionBridge() {
    this.addCheckpoint(3950, G);
    this.addPlatform(4000, G - 150, 150);
    this.addOrbArc(4020, G - 200, 3, 50, 10);
    this.addPlatform(4180, G - 280, 140);
    this.addOrbArc(4200, G - 330, 3, 45, 10);
    // hoja flotante móvil sobre el barranco
    this.addMovingPlatform(4270, G - 30, 130, { dx: 190, speed: 75 });
    this.addOrbArc(4330, G - 110, 3, 60, 30);

    this.addGround(4600, 400, G);
    this.addCheckpoint(4660, G);
    this.addBramble(4790, G, 0.85);

    // Tiko junto al puente roto (Misión 3)
    this.tiko = this.add.image(4935, G + 6, this.done('m3') ? 'tiko_happy' : 'tiko_sad').setOrigin(0.5, 1).setDepth(5);
    if (!reducedMotion()) this.tweens.add({ targets: this.tiko, scaleY: 0.97, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addInteractable({ x: 4935, y: G - 50, radius: 140, label: 'Hablar', promptY: -100, onInteract: () => this.missionThree() });

    // Puente
    this.addDecor('bridge_post', 5000, G + 6, { depth: 6 });
    this.addDecor('bridge_post', 5350, G + 6, { depth: 6 });
    this.planks = [];
    for (let x = 5004; x < 5346; x += 46) {
      const p = this.add.image(x, G + 2, 'plank').setOrigin(0, 0.5).setDepth(5);
      this.planks.push(p);
    }
    this.bridgeZone = this.addWall(5000, G + 6, 350, 30);
    this.bridgeBlock = this.addWall(4990, G - 500, 20, 510);
    if (this.done('m3')) {
      this.bridgeBlock.body.enable = false;
    } else {
      this.bridgeZone.body.enable = false;
      // tablones rotos: solo quedan los extremos
      this.planks.forEach((p, i) => {
        if (i === 0) p.setAngle(12);
        else if (i === this.planks.length - 1) p.setAngle(-12);
        else p.setVisible(false);
      });
    }
    this.addTrigger(4950, 5000, () => this.bit.say('El puente está roto. Tiko parece necesitar ayuda.', 2600, 'think'), {
      once: false, cond: () => !this.done('m3')
    });
  }

  buildSectionCrystal() {
    this.addGround(5350, 1350, G);
    this.addCheckpoint(5440, G);
    this.addOrbArc(5520, G - 60, 5, 60, 40);

    // Luma aparece tras ayudar a Tiko
    this.luma = this.add.image(5640, G - 250, 'luma').setDepth(7).setVisible(this.done('m3'));
    if (!reducedMotion()) this.tweens.add({ targets: this.luma, y: this.luma.y - 14, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { if (this.luma.visible) { this.luma.setTexture('luma_blink'); this.time.delayedCall(160, () => this.luma.setTexture('luma')); } } });

    // Pedestal del Conocimiento
    this.addDecor('pedestal', 5850, G + 6, { depth: 3 });
    this.crystalBig = this.add.image(5850, G - 200, 'crystal_knowledge_big').setDepth(4).setScale(0.8).setVisible(save.getFlag('l1_crystal'));
    if (!reducedMotion()) this.tweens.add({ targets: this.crystalBig, y: G - 215, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addInteractable({ x: 5850, y: G - 70, radius: 150, label: 'Pedestal', promptY: -120, onInteract: () => this.crystalCeremony() });

    // Portal
    this.addDecor('portal_arch', 6380, G + 8, { depth: 2 });
    this.portal = this.add.container(6380, G - 128).setDepth(1).setScale(0.62, 0.86);
    this.portalSwirl = this.add.image(0, 0, 'portal_swirl').setBlendMode('ADD');
    this.portal.add(this.portalSwirl);
    this.portal.setVisible(save.getFlag('l1_crystal'));
    this.updaters.push((time, delta) => { if (this.portal.visible && !reducedMotion()) this.portalSwirl.angle += delta * 0.09; });
    this.portalIt = this.addInteractable({ x: 6380, y: G - 90, radius: 180, label: 'Entrar', promptY: -150, enabled: save.getFlag('l1_crystal'), onInteract: () => this.enterPortal() });
  }

  // ---------- Inicio y objetivos ----------
  onStart() {
    this.ui.setShards(this.shardCount());
    if (!save.getFlag('l1_intro')) {
      this.cut(async () => {
        this.bit.setPosition(this.player.x + 500, this.player.y - 300);
        await this.wait(500);
        await this.say('l1_intro');
        save.setFlag('l1_intro');
        save.setFlag('introSeen');
      });
    } else {
      this.bit.say('¡Sigamos explorando!', 1800, 'happy');
    }
  }

  shardCount() {
    return ['m1', 'm2', 'm3'].filter((m) => this.done(m)).length;
  }

  refreshObjective() {
    const m = (id) => {
      const q = quests.get(id);
      return { text: q.objective, hint: q.hint };
    };
    let o;
    if (!this.done('m1')) o = m('m1');
    else if (!save.getFlag('l1_revealed')) o = { text: 'Usa la Lupa de la Verdad junto al abismo', hint: 'Ve hacia las señales junto al abismo y usa {TOOL}. La lupa revela caminos escondidos.' };
    else if (!this.done('m2')) o = m('m2');
    else if (!this.done('m3')) o = m('m3');
    else if (!save.getFlag('l1_crystal')) o = { text: 'Lleva los fragmentos al Pedestal', hint: 'Cruza el puente y busca el pedestal de piedra al final del bosque.' };
    else o = { text: 'Entra al portal', hint: 'El portal está al final del bosque. Acércate y usa {INTERACT}.' };
    quests.setObjective(o);
  }

  gainShard() {
    const n = this.shardCount();
    this.ui.setShards(n);
    this.ui.toast(`¡Fragmento de cristal ${n}/3!`, ['shard_a', 'shard_b', 'shard_c'][n - 1] || 'shard_a', 2200);
  }

  awardBadge(id) {
    if (inventory.addBadge(id)) this.ui.toast(`Insignia: ${inventory.badge(id).name}`, id, 2400);
  }

  // ---------- Misión 1 ----------
  missionOne() {
    this.cut(async () => {
      if (this.done('m1')) { await this.say('l1_tree_after'); return; }
      await this.say('l1_tree_before');
      const r = await this.openPuzzle('MessagePuzzleScene', { mission: 'm1' });
      if (!r.completed) { this.bit.say('¡Podemos volver cuando quieras!', 2200, 'happy'); return; }
      this.completeMission('m1');
      audio.sfx('correct');
      this.envelopes.forEach((e, i) => this.tweens.add({ targets: e.img, y: -200, alpha: 0, duration: 900, delay: i * 120 }));
      this.envelopes = [];
      await this.ui.reward.give('lupa');
      this.ui.applyTouchVisibility();
      this.awardBadge('badge_truthseeker');
      this.gainShard();
      await this.say('l1_m1_done');
      this.refreshObjective();
    });
  }

  glitchCameo() {
    save.setFlag('l1_glitchSeen');
    this.cut(async () => {
      const g = this.add.sprite(1965, G - 240, 'glitch_0').setDepth(9).setScale(0).play('glitch_jitter');
      audio.sfx('vines');
      await this.tween({ targets: g, scale: 1.2, duration: 350, ease: 'Back.Out' });
      if (!reducedMotion()) this.tweens.add({ targets: g, y: g.y - 16, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      await this.say('l1_glitch_fork');
      const burst = this.add.particles(g.x, g.y, 'p_pixel', { speed: { min: 60, max: 220 }, lifespan: 600, tint: [0x8f4bff, 0xb07bff, 0x6ff7e0], emitting: false }).setDepth(9);
      burst.explode(30);
      this.tweens.killTweensOf(g);
      await this.tween({ targets: g, scale: 0, alpha: 0, duration: 250 });
      g.destroy();
    });
  }

  revealFork(instant) {
    save.setFlag('l1_revealed');
    // La señal real queda limpia; la señal falsa muestra el truco de Glitch.
    this.signGlitch.baseX = 1965;
    this.signGlitch.setPosition(1965, G - 52).setScale(0.62, 0.6).setAlpha(0.55);
    this.fakeStamp = makeText(this, 1965, G - 52, '¡FALSO!', { size: 30, color: '#ffffff', weight: '800', stroke: '#8a1f5c', strokeThickness: 8 }).setOrigin(0.5).setDepth(6).setAngle(-12);
    this.realSignText.setText('Sendero\nseguro');
    if (instant) {
      this.crystalPath.forEach((p) => { p.img.setAlpha(1); p.zone.body.enable = true; });
      return;
    }
    this.fakeStamp.setScale(3).setAlpha(0);
    this.tweens.add({ targets: this.fakeStamp, scale: 1, alpha: 1, duration: 400, ease: 'Back.Out' });
    this.crystalPath.forEach((p, i) => this.revealPlatform(p, 300 + i * 260));
    this.time.delayedCall(1300, () => {
      this.cut(async () => {
        await this.say('l1_fork_revealed');
        this.refreshObjective();
      });
    });
  }

  openHiddenChest(it) {
    if (save.getFlag('l1_hiddenChest')) return;
    this.cut(async () => {
      it.setEnabled(false);
      save.setFlag('l1_hiddenChest');
      audio.sfx('open');
      this.hiddenChest.setTexture('chest_small_open');
      for (let i = 0; i < 5; i++) this.addOrb(this.hiddenChest.x - 60 + i * 30, this.hiddenChest.y - 90 - (i % 2) * 20);
      this.ui.setOrbs(this.orbCount, this.orbTotal);
      await this.say('l1_hidden_chest');
      await this.ui.reward.give('badge_sharpeye');
    });
  }

  // ---------- Misión 2 ----------
  missionTwo() {
    this.cut(async () => {
      if (this.done('m2')) { await this.say('l1_chest_after'); return; }
      if (!this.done('m1')) {
        await this.say([{ s: 'bit', e: 'think', t: 'Este cofre parece importante. Primero revisemos los mensajes del Árbol Mensajero.' }]);
        return;
      }
      await this.say('l1_chest_before');
      const r = await this.openPuzzle('SortPuzzleScene', { mission: 'm2' });
      if (!r.completed) { this.bit.say('El cofre esperará. ¡Vuelve cuando quieras!', 2200, 'happy'); return; }
      this.completeMission('m2');
      audio.sfx('open');
      this.chest.setTexture('chest_open');
      const burst = this.add.particles(3260, G - 160, 'p_star', { speed: { min: 80, max: 260 }, lifespan: 900, scale: { start: 0.8, end: 0 }, tint: [0xf6c945, 0x6ff7e0, 0xffffff], emitting: false, blendMode: 'ADD' }).setDepth(20);
      burst.explode(40);
      this.awardBadge('badge_secretkeeper');
      this.gainShard();
      await this.wait(500);
      await this.openVines();
      await this.say('l1_m2_done');
      this.refreshObjective();
    });
  }

  async openVines() {
    const cam = this.cameras.main;
    cam.stopFollow();
    await this.tween({ targets: cam, scrollX: 3800 - this.scale.width / 2, duration: 900, ease: 'Sine.InOut' });
    audio.sfx('vines');
    const p = this.add.particles(3800, G - 150, 'p_pixel', {
      speed: { min: 50, max: 200 }, lifespan: 800, tint: [0x8f4bff, 0x6ff7e0, 0x3f8f5a], emitting: false,
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-50, -150, 100, 300) }
    }).setDepth(20);
    p.explode(60);
    await this.tween({ targets: this.vines, scaleY: 0, alpha: 0, duration: 900, ease: 'Cubic.In' });
    this.vinesWall.body.enable = false;
    await this.wait(300);
    await this.tween({ targets: cam, scrollX: Phaser.Math.Clamp(this.player.x - this.scale.width / 2, 0, this.worldWidth), duration: 700, ease: 'Sine.InOut' });
    cam.startFollow(this.player, true, 0.1, 0.12, 0, 90);
  }

  // ---------- Misión 3 ----------
  missionThree() {
    this.cut(async () => {
      if (this.done('m3')) { await this.say('l1_tiko_after'); return; }
      await this.say('l1_tiko_before');
      const r = await this.openPuzzle('BridgePuzzleScene', { mission: 'm3' });
      if (!r.completed) { this.bit.say('Tiko nos esperará aquí. ¡Volvamos pronto!', 2200, 'think'); return; }
      this.completeMission('m3');
      audio.sfx('correct');
      this.tiko.setTexture('tiko_happy');
      // reconstrucción del puente
      this.planks.forEach((p, i) => {
        p.setAngle(0).setVisible(true).setScale(0);
        this.tweens.add({ targets: p, scale: 1, duration: 260, delay: i * 110, ease: 'Back.Out', onStart: () => audio.sfx('click') });
      });
      await this.wait(this.planks.length * 110 + 300);
      this.bridgeZone.body.enable = true;
      this.bridgeBlock.body.enable = false;
      // llega Luma
      this.luma.setVisible(true).setPosition(5180, G - 520).setAlpha(0);
      await this.tween({ targets: this.luma, y: G - 240, alpha: 1, duration: 1100, ease: 'Sine.Out' });
      audio.sfx('reveal');
      await this.say('l1_m3_done');
      this.awardBadge('badge_bridge');
      this.gainShard();
      this.tweens.add({ targets: this.luma, x: 5640, y: G - 250, duration: 1600, ease: 'Sine.InOut' });
      this.refreshObjective();
    });
  }

  // ---------- Cristal y portal ----------
  crystalCeremony() {
    this.cut(async () => {
      if (save.getFlag('l1_crystal')) {
        this.bit.say('¡El portal nos espera!', 1800, 'happy');
        return;
      }
      if (this.shardCount() < 3) { await this.say('l1_pedestal_missing'); return; }
      await this.say('l1_pedestal');
      const keys = ['shard_a', 'shard_b', 'shard_c'];
      const shards = keys.map((k, i) => this.add.image(this.player.x, this.player.y - 60, k).setDepth(30).setScale(1.2).setAlpha(0));
      shards.forEach((s, i) => {
        this.tweens.add({ targets: s, alpha: 1, x: 5850 + (i - 1) * 70, y: G - 300 - (i % 2) * 30, duration: 800, delay: i * 200, ease: 'Sine.Out' });
      });
      await this.wait(1400);
      audio.sfx('crystal');
      await this.tween({ targets: shards, x: 5850, y: G - 200, angle: 360, duration: 900, ease: 'Cubic.In' });
      shards.forEach((s) => s.destroy());
      this.cameras.main.flash(500, 255, 250, 200);
      this.crystalBig.setVisible(true).setScale(0.2);
      this.tweens.add({ targets: this.crystalBig, scale: 0.8, duration: 700, ease: 'Back.Out' });
      const burst = this.add.particles(5850, G - 200, 'p_star', { speed: { min: 100, max: 300 }, lifespan: 1100, scale: { start: 1, end: 0 }, tint: [0x3fe0a0, 0xe5c040, 0xffffff], emitting: false, blendMode: 'ADD' }).setDepth(30);
      burst.explode(60);
      save.setFlag('l1_crystal');
      this.ui.setShards(0);
      await this.wait(800);
      await this.ui.reward.give('crystal_knowledge');
      // el portal se enciende
      this.portal.setVisible(true).setAlpha(0);
      this.tweens.add({ targets: this.portal, alpha: 1, duration: 900 });
      audio.sfx('portal');
      this.portalIt.setEnabled(true);
      await this.say('l1_crystal_done');
      this.refreshObjective();
    });
  }

  enterPortal() {
    this.cut(async () => {
      const p = this.player;
      p.body.setVelocity(0, 0);
      p.body.setAllowGravity(false);
      audio.sfx('portal');
      p.cheering = true;
      await this.tween({ targets: p, x: 6380, y: G - 60, scale: 0.2, alpha: 0, angle: 360, duration: 1000, ease: 'Cubic.In' });
      p.cheering = false;
      await this.say('l1_complete');
      await this.ui.reward.give('badge_explorer');
      save.completeLevel(1);
      const skills = quests.forLevel(1).map((m) => m.learning);
      const choice = await this.ui.showLevelComplete({
        title: '¡Nivel completado!',
        subtitle: 'El Bosque de las Señales vuelve a brillar',
        skills,
        badge: 'badge_explorer',
        nextLabel: 'Ir al Laberinto'
      });
      fadeTo(this, choice === 'next' ? 'Level2Scene' : 'MapScene');
    });
  }
}
