import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';

// MISIÓN 1 — El mensaje misterioso: examinar partes de mensajes,
// identificar pistas de engaño y decidir qué hacer.
export default class MessagePuzzleScene extends PuzzleScene {
  constructor() {
    super('MessagePuzzleScene');
  }

  create() {
    this.data1 = quests.content('m1');
    this.buildFrame(this.data1.title, this.data1.instruction, 0x2fd6b5);
    this.state = this.data1.messages.map(() => ({ examined: new Set(), resolved: false, tried: new Set() }));
    this.current = 0;

    makeText(this, 150, 128, 'Mensajes', { size: 22, weight: '800', color: '#9fe8da' }).setOrigin(0.5, 0);
    this.tabs = this.data1.messages.map((m, i) => new Card(this, 150, 205 + i * 110, {
      width: 230, height: 92, text: m.tab, icon: 'envelope', fill: 0xe8fbf6, size: 22,
      onClick: () => this.select(i)
    }));

    this.cardLayer = this.add.container(0, 0);
    this.optionLayer = this.add.container(0, 0);
    makeText(this, 1085, 128, '¿Qué harías?', { size: 24, weight: '800', color: '#f6c945' }).setOrigin(0.5, 0);

    this.feedback(this.data1.intro, 'info');
    this.select(0);
  }

  select(i) {
    this.current = i;
    this.tabs.forEach((t, k) => t.setSelected(k === i));
    this.renderMessage();
  }

  renderMessage() {
    this.cardLayer.removeAll(true);
    this.optionLayer.removeAll(true);
    const msg = this.data1.messages[this.current];
    const st = this.state[this.current];
    const x0 = 290, w = 620, y0 = 126;

    const card = this.add.graphics();
    drawPanel(card, x0, y0, w, 452, { fill: 0xf4fbff, border: 0x2fd6b5, radius: 24, borderWidth: 4, glow: false });
    card.fillStyle(0x2fd6b5, 1);
    card.fillRoundedRect(x0, y0, w, 50, { tl: 24, tr: 24, bl: 0, br: 0 });
    const head = makeText(this, x0 + 24, y0 + 25, `Mensaje ${this.current + 1} de ${this.data1.messages.length}`, { size: 22, weight: '800', color: '#0b2e33' }).setOrigin(0, 0.5);
    const clues = msg.parts.filter((p) => p.clue).length;
    const found = msg.parts.filter((p, k) => p.clue && st.examined.has(k)).length;
    const counterTxt = msg.safe && st.resolved ? 'Sin señales de engaño' : `Pistas: ${found}/${clues}`;
    const counter = this.counterText = makeText(this, x0 + w - 24, y0 + 25, counterTxt, { size: 20, weight: '800', color: '#0b2e33' }).setOrigin(1, 0.5);
    this.cardLayer.add([card, head, counter]);

    // Partes del mensaje
    const parts = [];
    let y = y0 + 64;
    const avail = 452 - 64 - 14;
    const gap = 8;
    const h = Math.min(66, Math.floor((avail - gap * (msg.parts.length - 1)) / msg.parts.length));
    msg.parts.forEach((p, k) => {
      const c = new Card(this, x0 + w / 2, y + h / 2, {
        width: w - 32, height: h, text: p.text, label: p.label || null, size: 21,
        fill: 0xffffff, onClick: () => this.examine(k)
      });
      this.applyPartState(c, p, st.examined.has(k));
      parts.push(c);
      this.cardLayer.add(c);
      y += h + gap;
    });
    this.parts = parts;

    if (st.resolved) {
      const stampText = msg.safe ? 'MENSAJE SEGURO' : '¡ENGAÑO DETECTADO!';
      const stamp = makeText(this, x0 + w / 2, y0 + 250, stampText, {
        size: 44, weight: '800', color: msg.safe ? '#1f9a5a' : '#c2410c', stroke: '#ffffff', strokeThickness: 10
      }).setOrigin(0.5).setAngle(-8).setAlpha(0.92);
      this.cardLayer.add(stamp);
    }

    // Opciones
    const opts = msg.options.map((o, k) => {
      const tried = st.tried.has(k);
      const b = new Card(this, 1085, 228 + k * 124, {
        width: 330, height: 112, text: o.text, size: 19, fill: st.resolved && o.correct ? 0xd9f7e6 : tried ? 0xdde4f7 : 0xfff6dc,
        onClick: () => this.choose(k)
      });
      if (st.resolved && o.correct) b.setState({ marker: 'icon_check', border: 0x4cd38a });
      if (tried && !o.correct) b.setState({ marker: 'icon_retry', border: 0x6c8cff });
      if (st.resolved) b.setEnabled(o.correct);
      this.optionLayer.add(b);
      return b;
    });
    this.options = opts;

    const items = [...this.tabs, ...parts, ...opts];
    if (this.allResolved()) {
      this.doneBtn = this.doneBtn || new Button(this, 1085, 600 - 40, { label: '¡Terminar!', width: 300, height: 66, color: 0xf6c945, size: 26, onClick: () => this.finish(true) });
      this.doneBtn.setDepth(5);
      this.optionLayer.setVisible(false);
      items.push(this.doneBtn);
    }
    this.activateFocus(items, this.allResolved() ? this.doneBtn : parts[0]);
  }

  applyPartState(card, part, examined) {
    if (!examined) {
      card.setState({ fill: 0xffffff, border: 0x9fc7c0, marker: null });
    } else if (part.clue) {
      card.setState({ fill: 0xffe8cc, border: 0xffa04d, marker: 'icon_alert' });
    } else {
      card.setState({ fill: 0xe3f8ec, border: 0x4cd38a, marker: 'icon_check' });
    }
  }

  examine(k) {
    const msg = this.data1.messages[this.current];
    const st = this.state[this.current];
    const part = msg.parts[k];
    const first = !st.examined.has(k);
    st.examined.add(k);
    this.applyPartState(this.parts[k], part, true);
    if (first && !reducedMotion()) this.tweens.add({ targets: this.parts[k], scale: { from: 1.04, to: 1 }, duration: 200 });
    this.feedback(part.explain, part.clue ? 'alert' : 'info');
    // refresca el contador sin reconstruir la tarjeta
    const clues = msg.parts.filter((p) => p.clue).length;
    const found = msg.parts.filter((p, i) => p.clue && st.examined.has(i)).length;
    if (!(msg.safe && st.resolved)) this.counterText.setText(`Pistas: ${found}/${clues}`);
    if (part.clue && found === clues && first) {
      this.time.delayedCall(10, () => this.feedback(`${part.explain} ¡Encontraste todas las pistas! Ahora decide qué hacer.`, 'good'));
    }
  }

  choose(k) {
    const msg = this.data1.messages[this.current];
    const st = this.state[this.current];
    if (st.resolved) return;
    if (st.examined.size === 0) {
      this.feedback('Antes de decidir, toca alguna parte del mensaje para examinarla con calma.', 'info');
      this.parts.forEach((p) => this.shake(p));
      return;
    }
    const opt = msg.options[k];
    if (!opt.correct) {
      st.tried.add(k);
      this.options[k].setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(this.options[k]);
      this.feedback(opt.feedback, 'retry');
      return;
    }
    st.resolved = true;
    this.tabs[this.current].setState({ marker: 'icon_check', fill: 0xd9f7e6 });
    this.celebrate(600, 350);
    this.renderMessage();
    this.feedback(opt.feedback, 'good');
    if (this.allResolved()) {
      this.time.delayedCall(1600, () => this.feedback(this.data1.summary, 'good'));
    } else {
      const next = this.state.findIndex((s) => !s.resolved);
      const from = this.current;
      this.time.delayedCall(1700, () => { if (!this.finished && this.current === from) this.select(next); });
    }
  }

  allResolved() {
    return this.state.every((s) => s.resolved);
  }
}
