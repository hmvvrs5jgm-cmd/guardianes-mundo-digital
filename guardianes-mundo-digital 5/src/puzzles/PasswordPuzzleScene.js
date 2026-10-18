import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

const LEVELS = [
  { label: 'Muy débil', color: 0xff6b6b },
  { label: 'Débil', color: 0xffa04d },
  { label: 'Media', color: 0xf6c945 },
  { label: 'Fuerte', color: 0x9be36a },
  { label: 'Muy fuerte', color: 0x4cd38a }
];
const MAX_PIECES = 8;

// MISIÓN 7 — El código secreto: armar una contraseña ficticia fuerte con
// piezas, con un medidor de fuerza. Nada de lo escrito se guarda.
export default class PasswordPuzzleScene extends PuzzleScene {
  constructor() {
    super('PasswordPuzzleScene');
  }

  create() {
    this.d = quests.content('m7');
    this.buildFrame(this.d.title, this.d.instruction, 0xf6c945);
    this.pw = [];

    // Campo de la contraseña y cerradura
    const g = this.add.graphics();
    drawPanel(g, 70, 124, 900, 84, { fill: 0xffffff, border: 0xf6c945, radius: 20, borderWidth: 4, glow: false });
    this.pwText = makeText(this, 100, 166, '', { size: 34, weight: '800', color: '#16303a' }).setOrigin(0, 0.5);
    this.placeholder = makeText(this, 100, 166, 'Toca las piezas para armar tu contraseña…', { size: 22, weight: '600', color: '#8aa0a6' }).setOrigin(0, 0.5);
    this.lock = this.add.graphics({ x: 1110, y: 190 });
    this.drawLock(false);

    // Medidor de fuerza (color + texto)
    this.meterBg = this.add.graphics();
    this.meterBg.fillStyle(0x0b2a31, 1).fillRoundedRect(70, 226, 640, 26, 13);
    this.meter = this.add.graphics();
    this.meterLabel = makeText(this, 730, 239, 'Fuerza: —', { size: 22, weight: '800', color: '#ffffff' }).setOrigin(0, 0.5);
    makeText(this, 70, 270, this.d.privacy, { size: 16, weight: '600', color: '#9fe8da' });

    this.undoBtn = new Button(this, 1110, 300, { label: 'Borrar última', width: 220, height: 50, size: 19, color: 0x9fe8da, onClick: () => this.undo() });
    this.clearBtn = new Button(this, 1110, 358, { label: 'Borrar todo', width: 220, height: 50, size: 19, color: 0x9fe8da, onClick: () => this.clearAll() });

    this.pieceCards = this.d.pieces.map((p, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const c = new Card(this, 130 + col * 225, 324 + row * 70, { width: 205, height: 60, text: p.text, size: 22, fill: p.kind === 'personal' || p.kind === 'weak' ? 0xfff0e6 : 0xfff6dc, align: 'center', onClick: (card) => this.addPiece(p, card) });
      return c;
    });
    this.feedback(this.d.intro, 'info');
    this.activateFocus([...this.pieceCards, this.undoBtn, this.clearBtn], this.pieceCards[0]);
  }

  drawLock(open) {
    const g = this.lock;
    g.clear();
    g.lineStyle(10, 0x1e2a36, 1);
    g.beginPath();
    g.arc(0, open ? -62 : -42, 24, Math.PI, 0);
    g.strokePath();
    g.lineStyle(6, open ? 0x4cd38a : 0xc9921b, 1);
    g.beginPath();
    g.arc(0, open ? -62 : -42, 24, Math.PI, 0);
    g.strokePath();
    g.fillStyle(open ? 0x4cd38a : 0xf6c945, 1).fillRoundedRect(-36, -44, 72, 58, 10);
    g.lineStyle(3, 0x1e2a36, 1).strokeRoundedRect(-36, -44, 72, 58, 10);
    g.fillStyle(0x1e2a36, 1).fillCircle(0, -20, 7).fillRect(-3, -20, 6, 18);
  }

  addPiece(p, card) {
    if (this.unlocked) return;
    if (p.kind === 'personal' || p.kind === 'weak') {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(p.feedback, 'retry');
      return;
    }
    if (this.pw.length >= MAX_PIECES) {
      this.feedback('¡Ya es bastante larga! Si quieres cambiarla, usa «Borrar última».', 'info');
      return;
    }
    this.pw.push(p);
    audio.sfx('click');
    if (!reducedMotion()) this.tweens.add({ targets: card, scale: { from: 0.92, to: 1 }, duration: 150 });
    this.evaluate();
  }

  undo() { if (!this.unlocked) { this.pw.pop(); this.evaluate(); } }
  clearAll() { if (!this.unlocked) { this.pw = []; this.evaluate(); } }

  evaluate() {
    const text = this.pw.map((p) => p.text).join('');
    this.pwText.setText(text);
    let s = 34;
    this.pwText.setFontSize(s);
    while (this.pwText.width > 840 && s > 16) { s -= 2; this.pwText.setFontSize(s); }
    this.placeholder.setVisible(!text);
    const len = text.length;
    const words = this.pw.filter((p) => p.kind === 'word').length;
    const mix = this.pw.some((p) => p.kind === 'number' || p.kind === 'symbol');
    const { minLength, minWords } = this.d.rules;
    let score = 0;
    if (len >= 6) score += 1;
    if (len >= 10) score += 1;
    if (words >= minWords) score += 1;
    if (len >= minLength && mix) score += 1;
    const strong = len >= minLength && words >= minWords && mix;
    if (strong) score = 4;
    else score = Math.min(score, 3);
    const lvl = LEVELS[text ? score : 0];
    this.meter.clear();
    if (text) this.meter.fillStyle(lvl.color, 1).fillRoundedRect(72, 228, 636 * ((score + 1) / 5), 22, 11);
    this.meterLabel.setText(text ? `Fuerza: ${lvl.label}` : 'Fuerza: —');
    if (!text) return;
    if (strong) return this.unlock();
    const t = this.d.tips;
    this.feedback(len < minLength ? t.short : words < minWords ? t.words : t.mix, 'info');
  }

  unlock() {
    this.unlocked = true;
    audio.sfx('correct');
    this.drawLock(true);
    this.celebrate(1110, 160);
    this.feedback(this.d.tips.done, 'good');
    this.time.delayedCall(1800, () => this.askQuestion(0));
  }

  askQuestion(i) {
    this.pieceCards.forEach((c) => c.setVisible(false));
    this.undoBtn.setVisible(false);
    this.clearBtn.setVisible(false);
    this.qLayer?.destroy();
    this.qLayer = this.add.container(0, 0);
    const q = this.d.questions[i];
    const head = makeText(this, 640, 330, `Pregunta ${i + 1} de ${this.d.questions.length}: ${q.q}`, { size: 23, weight: '800', color: '#ffffff', align: 'center', wrap: 1100, scaleWithSetting: true }).setOrigin(0.5);
    this.qLayer.add(head);
    const cards = q.options.map((o, k) => {
      const c = new Card(this, 360 + k * 560, 470, { width: 520, height: 96, text: o.text, size: 20, fill: 0xfff6dc, onClick: (card) => this.answer(i, o, card) });
      this.qLayer.add(c);
      return c;
    });
    this.feedback('Ahora, tres preguntas rápidas para cuidar tu contraseña.', 'info');
    this.activateFocus(cards, cards[0]);
  }

  answer(i, o, card) {
    if (this.waiting) return;
    if (!o.correct) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(o.feedback, 'retry');
      return;
    }
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    this.feedback(o.feedback, 'good');
    this.waiting = true;
    this.time.delayedCall(1500, () => {
      this.waiting = false;
      if (i + 1 < this.d.questions.length) this.askQuestion(i + 1);
      else this.done();
    });
  }

  done() {
    this.celebrate(640, 420);
    this.feedback('¡Eres un Maestro de Claves! Y recuerda: esta contraseña era de práctica y no se guardó.', 'good');
    const btn = new Button(this, 1085, 52, { label: '¡Abrir la puerta!', width: 260, height: 60, color: 0xf6c945, size: 22, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([btn], btn);
  }
}
