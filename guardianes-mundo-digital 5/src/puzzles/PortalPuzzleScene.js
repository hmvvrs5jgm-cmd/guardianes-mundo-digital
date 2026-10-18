import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';

// MISIÓN 4 — El portal del premio: inspeccionar una página de premios
// falsa, encontrar las señales de phishing y decidir qué hacer.
export default class PortalPuzzleScene extends PuzzleScene {
  constructor() {
    super('PortalPuzzleScene');
  }

  create() {
    this.d = quests.content('m4');
    this.buildFrame(this.d.title, this.d.instruction, 0xb07bff);
    this.found = new Set();
    const pg = this.d.page;

    // Ventana del navegador ficticio
    const g = this.add.graphics();
    drawPanel(g, 50, 118, 780, 478, { fill: 0xfaf6ff, border: 0xb07bff, radius: 20, borderWidth: 4, glow: false });
    g.fillStyle(0xe4dcf5, 1);
    g.fillRoundedRect(54, 122, 772, 64, { tl: 18, tr: 18, bl: 0, br: 0 });
    [0xff6b6b, 0xf6c945, 0x5fd068].forEach((c, i) => { g.fillStyle(c, 1); g.fillCircle(78 + i * 22, 154, 7); });

    const hot = (id) => this.d.hotspots.find((h) => h.id === id);
    const decoy = (id) => this.d.decoys.find((h) => h.id === id);
    const defs = [
      { id: 'url', x: 470, y: 154, w: 640, h: 42, text: pg.url, size: 18, fill: 0xffffff },
      { id: 'title', x: 440, y: 222, w: 740, h: 66, text: `${pg.title}\n${pg.subtitle}`, size: 22, fill: 0xfff3a0, align: 'center' },
      { id: 'prize', x: 240, y: 314, w: 360, h: 98, text: pg.prize, size: 19, fill: 0xf3ecff, icon: 'crystal_trust' },
      { id: 'timer', x: 625, y: 314, w: 370, h: 98, text: pg.timer, size: 22, fill: 0xffd6d6, align: 'center' },
      { id: 'fields', x: 440, y: 418, w: 740, h: 92, text: `${pg.formTitle}  ${pg.fields.map((f) => `${f}: ______`).join('   ')}`, size: 18, fill: 0xffffff },
      { id: 'button', x: 440, y: 502, w: 440, h: 56, text: pg.button, size: 24, fill: 0xffb347, align: 'center' },
      { id: 'footer', x: 440, y: 562, w: 520, h: 36, text: pg.footer, size: 15, fill: 0xf2eefa, align: 'center' }
    ];
    this.parts = defs.map((d) => {
      const info = hot(d.id) || decoy(d.id);
      const c = new Card(this, d.x, d.y, { width: d.w, height: d.h, text: d.text, size: d.size, fill: d.fill, icon: d.icon, align: d.align || 'left', onClick: () => this.inspect(d.id, c, info, !!hot(d.id)) });
      c.baseFill = d.fill;
      return c;
    });

    // Panel de señales encontradas
    const p = this.add.graphics();
    drawPanel(p, 860, 118, 390, 478, { fill: 0x10343d, border: 0xb07bff, radius: 20 });
    this.counter = makeText(this, 1055, 146, `Señales encontradas: 0/${this.d.hotspots.length}`, { size: 22, weight: '800', color: '#f6c945' }).setOrigin(0.5);
    this.list = this.d.hotspots.map((h, i) => {
      const y = 196 + i * 40;
      const icon = this.add.image(892, y, 'icon_alert').setScale(0.5).setAlpha(0.25);
      const t = makeText(this, 916, y, '· · ·', { size: 20, weight: '700', color: '#7f9aa0' }).setOrigin(0, 0.5);
      return { id: h.id, icon, t, label: h.label };
    });
    this.optionLayer = this.add.container(0, 0);
    this.feedback(this.d.intro, 'info');
    this.activateFocus(this.parts, this.parts[0]);
  }

  inspect(id, card, info, isClue) {
    if (this.answered) return;
    if (isClue) {
      const first = !this.found.has(id);
      this.found.add(id);
      card.setState({ fill: 0xffe8cc, border: 0xffa04d, marker: 'icon_alert' });
      const row = this.list.find((l) => l.id === id);
      row.icon.setAlpha(1);
      row.t.setText(row.label).setColor('#ffffff');
      this.counter.setText(`Señales encontradas: ${this.found.size}/${this.d.hotspots.length}`);
      if (first && !reducedMotion()) this.tweens.add({ targets: [card, row.t], scale: { from: 1.06, to: 1 }, duration: 200 });
      this.feedback(info.explain, 'alert');
      if (first && this.found.size === this.d.hotspots.length) this.time.delayedCall(1400, () => this.ask());
    } else {
      card.setState({ fill: 0xe3f8ec, border: 0x4cd38a, marker: 'icon_check' });
      this.feedback(info.explain, 'info');
    }
  }

  ask() {
    if (this.asked) return;
    this.asked = true;
    this.list.forEach((l, i) => { l.icon.setY(188 + i * 29).setScale(0.4); l.t.setY(188 + i * 29).setFontSize(17); });
    this.counter.setY(150);
    this.counter.setText('¡Encontraste todas!');
    this.feedback(this.d.question, 'good');
    const q = makeText(this, 1055, 352, '¿Qué haces?', { size: 22, weight: '800', color: '#f6c945' }).setOrigin(0.5);
    this.optionLayer.add(q);
    this.options = this.d.options.map((o, i) => {
      const c = new Card(this, 1055, 420 + i * 76, { width: 360, height: 68, text: o.text, size: 16, fill: 0xfff6dc, onClick: (card) => this.answer(o, card) });
      this.optionLayer.add(c);
      return c;
    });
    this.activateFocus([...this.options, ...this.parts], this.options[0]);
  }

  answer(o, card) {
    if (this.answered) return;
    if (!o.correct) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(o.feedback, 'retry');
      return;
    }
    this.answered = true;
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    this.options.forEach((c) => { if (c !== card) c.setEnabled(false); });
    // la página falsa se cierra
    this.parts.forEach((p, i) => this.tweens.add({ targets: p, alpha: 0.15, scale: 0.9, duration: 400, delay: i * 50 }));
    const closed = makeText(this, 440, 350, 'PÁGINA CERRADA', { size: 46, weight: '800', color: '#7136e0', stroke: '#ffffff', strokeThickness: 10 }).setOrigin(0.5).setAngle(-8).setScale(0);
    this.tweens.add({ targets: closed, scale: 1, duration: 400, delay: 350, ease: 'Back.Out' });
    this.celebrate(440, 350);
    this.feedback(`${o.feedback} ${this.d.summary}`, 'good');
    const done = new Button(this, 1085, 52, { label: '¡Listo!', width: 220, height: 60, color: 0xf6c945, size: 24, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([done], done);
  }
}
