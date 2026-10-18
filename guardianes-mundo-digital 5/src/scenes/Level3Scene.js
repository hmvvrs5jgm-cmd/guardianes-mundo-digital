import BaseLevelScene from './BaseLevelScene.js';
import { quests } from '../systems/QuestManager.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';
import { reducedMotion, fadeTo } from '../ui/helpers.js';

const G = 860;

// NIVEL 3 — La Fortaleza de los Secretos
// Misión 7: El código secreto (contraseña ficticia fuerte) → abre la cerradura mágica
// Misión 8: La llave de dos pasos (dos placas + código)    → Llave Maestra
// Misión 9: El Consejo de Guardianes (desafío integrador)
// Final: Cristal de la Confianza → Corazón de la Fortaleza → EndingScene
export default class Level3Scene extends BaseLevelScene {
  constructor() {
    super('Level3Scene', 3);
  }

  get worldWidth() { return 6300; }
  get music() { return 'calm'; }
  get shardKeys() { return ['shard3_a', 'shard3_b', 'shard3_c']; }

  done(id) { return quests.isComplete(id); }

  buildLevel() {
    this.buildScenery();
    this.buildEntrance();
    this.buildTwoStepHall();
    this.buildCouncil();
    this.buildHeart();
  }

  buildScenery() {
    // muros de la fortaleza al fondo
    [[200, 360], [900, 420], [2000, 460], [3100, 420], [4300, 480], [5600, 440]].forEach(([x, h]) => {
      this.add.tileSprite(x, G - h, 260, h, 'block_l3').setOrigin(0).setDepth(-15).setAlpha(0.55).setTint(0x9fb3d6);
    });
    [700, 2400, 3800, 5200].forEach((x, i) => this.addDecor('tree_l3', x, G + 14, { depth: -20, scale: 0.8, flip: i % 2 === 1 }));
    [380, 1250, 2900, 4100, 5350, 6000].forEach((x, i) => this.addDecor(i % 2 ? 'mushroom' : 'flower', x, G + 4, { depth: 3, sway: true }));
    this.voids = [this.add.tileSprite(4200, G + 110, 260, this.worldHeight - G, 'water').setOrigin(0).setDepth(1).setTint(0x9ff0ff)];
    this.updaters.push((time) => this.voids.forEach((v) => { v.tilePositionX = time * 0.03; }));
  }

  // ---------- Entrada y cerradura mágica (Misión 7) ----------
  buildEntrance() {
    this.addGround(0, 1720, G);
    this.addCheckpoint(150, G);
    this.addBlock(420, G - 90, 128, 90, 'block_l3');
    this.addOrbArc(430, G - 140, 3, 50, 10);
    this.addPlatform(620, G - 195, 150);
    this.addOrbArc(640, G - 245, 3, 50, 10);
    this.addSpark(900, G - 220, { dy: 100, ms: 1500 });
    this.addBramble(1100, G);
    this.addOrbArc(1050, G - 110, 3, 55, 60);
    this.addCheckpoint(1250, G);

    this.luma = this.add.image(1300, G - 260, 'luma').setDepth(7);
    if (!reducedMotion()) this.tweens.add({ targets: this.luma, y: G - 274, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.gate1 = this.add.image(1500, G + 8, 'gate_l3').setOrigin(0.5, 1).setDepth(6);
    this.gate1Wall = this.addWall(1470, G - 430, 60, 440);
    if (save.getFlag('l3_gate1')) this.openGateInstant(this.gate1, this.gate1Wall);
    this.lockIt = this.addInteractable({ x: 1440, y: G - 140, radius: 170, label: 'Cerradura', promptY: -120, enabled: !save.getFlag('l3_gate1'), onInteract: () => this.missionSeven() });
  }

  openGateInstant(gate, wall) {
    gate.setVisible(false);
    wall.body.enable = false;
  }

  openGate(gate, wall) {
    audio.sfx('portal');
    wall.body.enable = false;
    const burst = this.add.particles(gate.x, G - 160, 'p_star', { speed: { min: 60, max: 220 }, lifespan: 900, tint: [0xf6c945, 0x5ff0b8, 0xffffff], emitting: false, blendMode: 'ADD' }).setDepth(20);
    burst.explode(40);
    this.cameras.main.shake(reducedMotion() ? 1 : 400, 0.004);
    return this.tween({ targets: gate, y: gate.y - 340, alpha: 0, duration: 1400, ease: 'Sine.In' });
  }

  // ---------- Sala de los dos pasos (Misión 8) ----------
  buildTwoStepHall() {
    this.addGround(1720, 2480, G);
    this.addCheckpoint(1760, G);
    this.plates = [
      { id: 'l3_plateA', x: 1980, y: G, img: null },
      { id: 'l3_plateB', x: 2850, y: G - 390, img: null }
    ];
    this.addBlock(2150, G - 90, 128, 90, 'block_l3');
    this.addPlatform(2340, G - 195, 140);
    this.addOrbArc(2360, G - 245, 3, 45, 10);
    this.addPlatform(2540, G - 295, 130);
    this.addPlatform(2760, G - 390, 180);
    this.addSpark(3060, G - 230, { dy: 100, ms: 1500 });
    this.plates.forEach((p) => {
      p.img = this.add.image(p.x, p.y + 6, save.getFlag(p.id) ? 'plate_on' : 'plate_off').setOrigin(0.5, 1).setDepth(5);
    });
    this.addTrigger(1800, 1880, () => this.say('l3_plates'), { cond: () => !this.done('m8') });
    this.updaters.push(() => this.checkPlates());

    this.addDecor('console', 3240, G + 6, { depth: 4 });
    this.addInteractable({ x: 3240, y: G - 60, radius: 140, label: 'Consola', promptY: -110, onInteract: () => this.missionEight() });
    this.gate2 = this.add.image(3420, G + 8, 'gate_l3').setOrigin(0.5, 1).setDepth(6).setTint(0xd8f0ff);
    this.gate2Wall = this.addWall(3390, G - 430, 60, 440);
    if (save.getFlag('l3_gate2')) this.openGateInstant(this.gate2, this.gate2Wall);
    this.addOrbArc(3550, G - 60, 4, 60, 30);
  }

  checkPlates() {
    if (!this.player || this.done('m8')) return;
    for (const p of this.plates) {
      if (save.getFlag(p.id)) continue;
      if (Math.abs(this.player.x - p.x) < 50 && Math.abs(this.player.y - p.y) < 30 && this.player.onGround) {
        save.setFlag(p.id);
        p.img.setTexture('plate_on');
        audio.sfx('checkpoint');
        const both = this.plates.every((q) => save.getFlag(q.id));
        this.ui.toast(both ? '¡Los dos pasos están activos!' : 'Paso activado (1 de 2)', 'icon_check', 1800);
        this.refreshObjective();
      }
    }
  }

  // ---------- Sala del Consejo (Misión 9) ----------
  buildCouncil() {
    this.addCheckpoint(3700, G);
    this.addBramble(3900, G);
    this.addSpark(4080, G - 200, { dy: 110, ms: 1500 });
    this.addMovingPlatform(4220, G - 30, 120, { dx: 110, speed: 70 });
    this.addOrbArc(4260, G - 110, 3, 50, 25);
    this.addGround(4460, 1840, G);
    this.addCheckpoint(4520, G);

    this.councilPillars = [4760, 4880, 5000, 5120, 5240, 5360].map((x) =>
      this.add.image(x, G + 6, this.done('m9') ? 'pillar_on' : 'pillar_off').setOrigin(0.5, 1).setDepth(-2).setScale(0.8));
    this.councilLuma = this.add.image(5060, G - 280, 'luma').setDepth(7).setVisible(!!save.getFlag('l3_gate2'));
    if (!reducedMotion()) this.tweens.add({ targets: this.councilLuma, y: G - 295, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addInteractable({ x: 5060, y: G - 80, radius: 180, label: 'Consejo', promptY: -130, onInteract: () => this.missionNine() });
  }

  // ---------- Cristal y Corazón de la Fortaleza ----------
  buildHeart() {
    this.addDecor('pedestal', 5560, G + 6, { depth: 3 });
    this.crystalBig = this.add.image(5560, G - 200, 'crystal_trust_big').setDepth(4).setScale(0.8).setVisible(save.getFlag('l3_crystal'));
    if (!reducedMotion()) this.tweens.add({ targets: this.crystalBig, y: G - 215, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.addInteractable({ x: 5560, y: G - 70, radius: 150, label: 'Pedestal', promptY: -120, onInteract: () => this.crystalCeremony() });

    this.addDecor('fortress_heart', 6000, G + 8, { depth: 2 });
    this.heartGlow = this.add.image(6000, G - 120, 'rays').setScale(0.6).setBlendMode('ADD').setDepth(1).setAlpha(save.getFlag('l3_crystal') ? 0.7 : 0);
    if (!reducedMotion()) this.tweens.add({ targets: this.heartGlow, angle: 360, duration: 16000, repeat: -1 });
    this.heartIt = this.addInteractable({ x: 6000, y: G - 90, radius: 180, label: 'Corazón', promptY: -170, enabled: save.getFlag('l3_crystal'), onInteract: () => this.uniteCrystals() });
  }

  // ---------- Inicio y objetivos ----------
  onStart() {
    this.ui.setShards(this.shardCount(), this.crystalId, this.shardKeys);
    if (!save.getFlag('l3_intro')) {
      this.cut(async () => {
        this.bit.setPosition(this.player.x + 500, this.player.y - 300);
        await this.wait(500);
        await this.say('l3_intro');
        save.setFlag('l3_intro');
      });
    } else {
      this.bit.say('¡Sigamos por la Fortaleza!', 1800, 'happy');
    }
  }

  refreshObjective() {
    const m = (id) => ({ text: quests.get(id).objective, hint: quests.get(id).hint });
    const plates = this.plates?.filter((p) => save.getFlag(p.id)).length ?? 0;
    let o;
    if (!this.done('m7')) o = m('m7');
    else if (!this.done('m8') && plates < 2) o = { text: `Activa las dos placas (${plates}/2)`, hint: 'Una placa está al inicio de la sala y otra en la plataforma más alta. Pisa cada una.' };
    else if (!this.done('m8')) o = { text: 'Usa la consola de dos pasos', hint: 'La consola está junto a la segunda puerta. Acércate y usa {INTERACT}.' };
    else if (!this.done('m9')) o = m('m9');
    else if (!save.getFlag('l3_crystal')) o = { text: 'Lleva los fragmentos al Pedestal de la Confianza', hint: 'El pedestal está después de la sala del Consejo.' };
    else o = { text: 'Une los tres cristales en el Corazón de la Fortaleza', hint: 'El Corazón está al final del pasillo. Acércate y usa {INTERACT}.' };
    quests.setObjective(o);
  }

  // ---------- Misión 7 ----------
  missionSeven() {
    this.cut(async () => {
      if (this.done('m7')) { await this.say('l3_lock_after'); return; }
      await this.say('l3_lock_before');
      const r = await this.openPuzzle('PasswordPuzzleScene', { mission: 'm7' });
      if (!r.completed) { this.bit.say('¡Volvamos cuando quieras!', 2200, 'happy'); return; }
      this.completeMission('m7');
      save.setFlag('l3_gate1');
      this.lockIt.setEnabled(false);
      await this.openGate(this.gate1, this.gate1Wall);
      this.awardBadge('badge_password');
      this.gainShard();
      await this.say('l3_m7_done');
      this.tweens.add({ targets: this.luma, alpha: 0, y: G - 500, duration: 1200 });
      this.refreshObjective();
    });
  }

  // ---------- Misión 8 ----------
  missionEight() {
    this.cut(async () => {
      if (this.done('m8')) { await this.say('l3_console_after'); return; }
      if (!this.plates.every((p) => save.getFlag(p.id))) { await this.say('l3_console_wait'); return; }
      await this.say('l3_console_before');
      const r = await this.openPuzzle('TwoStepPuzzleScene', { mission: 'm8' });
      if (!r.completed) { this.bit.say('La consola nos espera. ¡Vuelve cuando quieras!', 2200, 'think'); return; }
      this.completeMission('m8');
      save.setFlag('l3_gate2');
      await this.openGate(this.gate2, this.gate2Wall);
      await this.ui.reward.give('llave');
      this.awardBadge('badge_twostep');
      this.gainShard();
      await this.say('l3_m8_done');
      this.councilLuma.setVisible(true);
      this.refreshObjective();
    });
  }

  // ---------- Misión 9 ----------
  missionNine() {
    this.cut(async () => {
      if (this.done('m9')) { await this.say('l3_council_after'); return; }
      if (!this.done('m8')) { await this.say('l3_door_locked'); return; }
      await this.say('l3_council_before');
      const r = await this.openPuzzle('CouncilPuzzleScene', { mission: 'm9' });
      if (!r.completed) { this.bit.say('El Consejo nos esperará. ¡Tómate tu tiempo!', 2200, 'think'); return; }
      this.completeMission('m9');
      for (let i = 0; i < this.councilPillars.length; i++) {
        this.councilPillars[i].setTexture('pillar_on');
        audio.sfx('click');
        await this.wait(180);
      }
      audio.sfx('reward');
      this.awardBadge('badge_council');
      this.gainShard();
      await this.say('l3_m9_done');
      this.refreshObjective();
    });
  }

  // ---------- Cristal de la Confianza ----------
  crystalCeremony() {
    this.cut(async () => {
      if (save.getFlag('l3_crystal')) { this.bit.say('¡Al Corazón de la Fortaleza!', 1800, 'happy'); return; }
      if (this.shardCount() < 3) { await this.say('l3_pedestal_missing'); return; }
      await this.say('l3_pedestal');
      const shards = this.shardKeys.map((k) => this.add.image(this.player.x, this.player.y - 60, k).setDepth(30).setScale(1.2).setAlpha(0));
      shards.forEach((s, i) => this.tweens.add({ targets: s, alpha: 1, x: 5560 + (i - 1) * 70, y: G - 300 - (i % 2) * 30, duration: 800, delay: i * 200, ease: 'Sine.Out' }));
      await this.wait(1400);
      audio.sfx('crystal');
      await this.tween({ targets: shards, x: 5560, y: G - 200, angle: 360, duration: 900, ease: 'Cubic.In' });
      shards.forEach((s) => s.destroy());
      this.cameras.main.flash(500, 255, 240, 200);
      this.crystalBig.setVisible(true).setScale(0.2);
      this.tweens.add({ targets: this.crystalBig, scale: 0.8, duration: 700, ease: 'Back.Out' });
      const burst = this.add.particles(5560, G - 200, 'p_star', { speed: { min: 100, max: 300 }, lifespan: 1100, scale: { start: 1, end: 0 }, tint: [0xf6c945, 0xff8aa8, 0xffffff], emitting: false, blendMode: 'ADD' }).setDepth(30);
      burst.explode(60);
      save.setFlag('l3_crystal');
      this.ui.setShards(0, this.crystalId, this.shardKeys);
      await this.wait(800);
      await this.ui.reward.give('crystal_trust');
      this.tweens.add({ targets: this.heartGlow, alpha: 0.7, duration: 900 });
      this.heartIt.setEnabled(true);
      await this.say('l3_crystal_done');
      this.refreshObjective();
    });
  }

  // ---------- Los tres cristales se unen ----------
  uniteCrystals() {
    this.cut(async () => {
      await this.say('l3_heart');
      const keys = ['crystal_knowledge_big', 'crystal_protection_big', 'crystal_trust_big'];
      const cs = keys.map((k) => this.add.image(this.player.x, this.player.y - 80, k).setDepth(30).setScale(0.2));
      cs.forEach((c, i) => this.tweens.add({ targets: c, x: 6000 + (i - 1) * 90, y: G - 300, scale: 0.6, duration: 900, delay: i * 250, ease: 'Sine.Out' }));
      await this.wait(1700);
      audio.sfx('crystal');
      await this.tween({ targets: cs, x: 6000, y: G - 220, duration: 900, ease: 'Cubic.In' });
      this.cameras.main.flash(900, 255, 250, 230);
      this.player.cheering = true;
      save.completeLevel(3);
      await this.wait(1200);
      fadeTo(this, 'EndingScene', {}, 900);
    });
  }
}
