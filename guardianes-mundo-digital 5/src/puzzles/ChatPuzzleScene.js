import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

const CHAT = { x: 60, y: 118, w: 580, h: 478 };

// MISIÓN 5 — El visitante misterioso: conversación de práctica (ficticia)
// con alguien que pide datos y secretos. Cada respuesta segura revela una
// señal de alerta y rompe un eslabón de la cadena de presión.
export default class ChatPuzzleScene extends PuzzleScene {
  constructor() {
    super('ChatPuzzleScene');
  }

  create() {
    this.d = quests.content('m5');
    this.buildFrame(this.d.title, this.d.instruction, 0xff7ad9);
    this.step = 0;
    this.log = [];

    // «Teléfono» de la conversación
    const g = this.add.graphics();
    drawPanel(g, CHAT.x, CHAT.y, CHAT.w, CHAT.h, { fill: 0xf4f1fb, border: 0xff7ad9, radius: 22, borderWidth: 4, glow: false });
    g.fillStyle(0xffd6f0, 1);
    g.fillRoundedRect(CHAT.x + 4, CHAT.y + 4, CHAT.w - 8, 62, { tl: 18, tr: 18, bl: 0, br: 0 });
    this.avatar = this.add.image(CHAT.x + 44, CHAT.y + 35, 'portrait_eco_mask').setScale(0.36);
    this.chatName = makeText(this, CHAT.x + 80, CHAT.y + 24, this.d.visitor, { size: 22, weight: '800', color: '#16303a' }).setOrigin(0, 0.5);
    makeText(this, CHAT.x + 80, CHAT.y + 48, 'Conversación de práctica', { size: 15, weight: '600', color: '#7a5a8a' }).setOrigin(0, 0.5);
    this.logLayer = this.add.container(0, 0);
    const mask = this.make.graphics({ add: false });
    mask.fillStyle(0xffffff).fillRect(CHAT.x + 6, CHAT.y + 70, CHAT.w - 12, CHAT.h - 76);
    this.logLayer.setMask(mask.createGeometryMask());

    // Panel de señales de alerta
    const p = this.add.graphics();
    drawPanel(p, 670, 118, 580, 200, { fill: 0x10343d, border: 0xff7ad9, radius: 20 });
    makeText(this, 960, 142, 'Señales de alerta', { size: 22, weight: '800', color: '#f6c945' }).setOrigin(0.5);
    this.signals = this.d.steps.map((s, i) => {
      const x = 700 + (i % 2) * 270, y = 182 + Math.floor(i / 2) * 42;
      const icon = this.add.image(x, y, 'icon_alert').setScale(0.48).setAlpha(0.25);
      const t = makeText(this, x + 22, y, '· · ·', { size: 17, weight: '700', color: '#7f9aa0' }).setOrigin(0, 0.5);
      return { icon, t, label: s.signal };
    });
    this.optionLayer = this.add.container(0, 0);
    this.feedback('Practiquemos: lee cada mensaje y elige la respuesta más segura. ¡Sin prisa!', 'info');
    this.time.delayedCall(500, () => this.showStep());
  }

  addBubble(text, mine) {
    const maxW = 380;
    const t = makeText(this, 0, 0, text, { size: 19, weight: '600', color: mine ? '#ffffff' : '#16303a', wrap: maxW - 30, scaleWithSetting: true });
    const w = Math.min(maxW, t.width + 30), h = t.height + 22;
    const bg = this.add.graphics();
    bg.fillStyle(mine ? 0x2fa88f : 0xffffff, 1);
    bg.fillRoundedRect(0, 0, w, h, 16);
    bg.lineStyle(2, mine ? 0x1f7a68 : 0xd9c8e6, 1);
    bg.strokeRoundedRect(0, 0, w, h, 16);
    t.setPosition(15, 11);
    const c = this.add.container(0, 0, [bg, t]);
    c.bubbleW = w; c.bubbleH = h; c.mine = mine;
    this.logLayer.add(c);
    this.log.push(c);
    this.layoutLog();
    if (!reducedMotion()) this.tweens.add({ targets: c, alpha: { from: 0, to: 1 }, duration: 250 });
    audio.sfx('blip');
  }

  layoutLog() {
    let y = CHAT.y + CHAT.h - 14;
    for (let i = this.log.length - 1; i >= 0; i--) {
      const c = this.log[i];
      y -= c.bubbleH;
      c.setPosition(c.mine ? CHAT.x + CHAT.w - 18 - c.bubbleW : CHAT.x + 18, y);
      y -= 12;
    }
  }

  showStep() {
    const s = this.d.steps[this.step];
    this.addBubble(s.msg, false);
    this.optionLayer.removeAll(true);
    this.options = s.options.map((o, i) => {
      const c = new Card(this, 960, 370 + i * 78, { width: 580, height: 68, text: o.text, size: 18, fill: 0xfff6dc, onClick: (card) => this.choose(o, card) });
      this.optionLayer.add(c);
      return c;
    });
    this.activateFocus(this.options, this.options[0]);
  }

  choose(o, card) {
    if (this.busy) return;
    if (!o.correct) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(o.feedback, 'retry');
      return;
    }
    this.busy = true;
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    this.addBubble(o.text.replace(/^«|»$/g, ''), true);
    const sig = this.signals[this.step];
    sig.icon.setAlpha(1);
    sig.t.setText(sig.label).setColor('#ffffff');
    if (!reducedMotion()) this.tweens.add({ targets: sig.t, scale: { from: 1.2, to: 1 }, duration: 250 });
    this.feedback(o.feedback, 'good');
    this.step += 1;
    this.time.delayedCall(1300, () => {
      this.busy = false;
      if (this.step < this.d.steps.length) this.showStep();
      else this.reveal();
    });
  }

  reveal() {
    this.optionLayer.removeAll(true);
    audio.sfx('reveal');
    // cae la máscara: era Eco
    this.tweens.add({
      targets: this.avatar, scale: 0, duration: 250, onComplete: () => {
        this.avatar.setTexture('portrait_eco');
        this.chatName.setText('Eco');
        this.tweens.add({ targets: this.avatar, scale: 0.36, duration: 300, ease: 'Back.Out' });
      }
    });
    const eco = this.add.image(960, 450, 'eco').setScale(0);
    this.tweens.add({ targets: eco, scale: 1.6, duration: 600, ease: 'Back.Out' });
    if (!reducedMotion()) this.tweens.add({ targets: eco, angle: { from: -4, to: 4 }, duration: 500, yoyo: true, repeat: -1 });
    const mask = this.add.image(1040, 400, 'eco_mask').setScale(0.7);
    this.tweens.add({ targets: mask, y: 640, angle: 120, alpha: 0, duration: 1200, ease: 'Quad.In' });
    this.celebrate(960, 450);
    this.feedback(`${this.d.reveal} ${this.d.summary}`, 'alert');
    const done = new Button(this, 1085, 52, { label: '¡Listo!', width: 220, height: 60, color: 0xf6c945, size: 24, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([done], done);
  }
}
