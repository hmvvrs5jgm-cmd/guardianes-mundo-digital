import Phaser from 'phaser';
import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

// MISIÓN 8 — La llave de dos pasos: el primer cerrojo (contraseña) ya está
// abierto; el segundo pide el código del dispositivo de confianza.
export default class TwoStepPuzzleScene extends PuzzleScene {
  constructor() {
    super('TwoStepPuzzleScene');
  }

  create() {
    this.d = quests.content('m8');
    this.buildFrame(this.d.title, this.d.instruction, 0x5ff0b8);
    this.code = String(Phaser.Math.Between(100000, 999999));
    this.typed = '';

    // Puerta con dos cerrojos
    const g = this.add.graphics();
    drawPanel(g, 50, 124, 300, 460, { fill: 0x13695a, border: 0xf6c945, radius: 26 });
    makeText(this, 200, 160, 'Puerta de dos pasos', { size: 20, weight: '800', color: '#fff3a0' }).setOrigin(0.5);
    this.locks = [0, 1].map((i) => {
      const y = 270 + i * 170;
      const ring = this.add.graphics();
      const label = makeText(this, 200, y + 62, i === 0 ? 'Paso 1: contraseña' : 'Paso 2: código', { size: 18, weight: '800', color: '#ffffff' }).setOrigin(0.5);
      return { y, ring, label };
    });
    this.drawLock(0, true);
    this.drawLock(1, false);

    // Pantalla y teclado
    const kp = this.add.graphics();
    drawPanel(kp, 390, 124, 420, 460, { fill: 0x10343d, border: 0x5ff0b8, radius: 22 });
    this.display = makeText(this, 600, 178, '', { size: 40, weight: '800', color: '#b6ffe6' }).setOrigin(0.5);
    this.keys = [];
    const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'];
    labels.forEach((l, i) => {
      const x = 480 + (i % 3) * 120, y = 262 + Math.floor(i / 3) * 80;
      const label = l === '⌫' ? 'Borrar' : l;
      const b = new Button(this, x, y, { label, width: 104, height: 66, size: l === '⌫' ? 18 : l.length > 2 ? 20 : 30, color: l === 'OK' ? 0xf6c945 : 0x2fd6b5, onClick: () => this.press(l) });
      this.keys.push(b);
    });

    // Dispositivo de confianza
    const ph = this.add.graphics();
    drawPanel(ph, 860, 124, 380, 460, { fill: 0x1c2b3a, border: 0x9fe8da, radius: 34 });
    ph.fillStyle(0xe8f6ff, 1).fillRoundedRect(884, 170, 332, 380, 18);
    makeText(this, 1050, 148, this.d.deviceTitle, { size: 19, weight: '800', color: '#9fe8da' }).setOrigin(0.5);
    makeText(this, 1050, 230, this.d.deviceText, { size: 20, weight: '700', color: '#16303a', align: 'center', wrap: 300 }).setOrigin(0.5);
    makeText(this, 1050, 320, this.code.replace(/(\d{3})(\d{3})/, '$1 $2'), { size: 52, weight: '800', color: '#0b7a62' }).setOrigin(0.5);
    this.add.image(930, 450, 'icon_alert').setScale(0.7);
    makeText(this, 960, 450, this.d.deviceWarning, { size: 18, weight: '700', color: '#a8461a', wrap: 240 }).setOrigin(0, 0.5);

    this.refresh();
    this.feedback(this.d.explain, 'info');
    this.activateFocus(this.keys, this.keys[0]);
    this.input.keyboard?.on('keydown', (e) => {
      if (this.finished || this.stage) return;
      if (/^[0-9]$/.test(e.key)) this.press(e.key);
      else if (e.key === 'Backspace') this.press('⌫');
    });
  }

  drawLock(i, open) {
    const { y, ring } = this.locks[i];
    ring.clear();
    ring.fillStyle(open ? 0x4cd38a : 0x0b2a31, 1).fillCircle(200, y, 40);
    ring.lineStyle(5, open ? 0xffffff : 0xf6c945, 1).strokeCircle(200, y, 40);
    if (open) {
      ring.lineStyle(7, 0xffffff, 1);
      ring.beginPath(); ring.moveTo(182, y + 2); ring.lineTo(196, y + 16); ring.lineTo(220, y - 12); ring.strokePath();
    } else {
      ring.fillStyle(0xf6c945, 1).fillCircle(200, y - 6, 9).fillRect(196, y - 4, 8, 20);
    }
  }

  refresh() {
    const slots = Array.from({ length: 6 }, (_, i) => this.typed[i] || '·');
    this.display.setText(slots.join(' '));
  }

  press(k) {
    if (this.stage) return;
    if (k === '⌫') this.typed = this.typed.slice(0, -1);
    else if (k === 'OK') return this.check();
    else if (this.typed.length < 6) this.typed += k;
    audio.sfx('blip');
    this.refresh();
    if (this.typed.length === 6) this.check();
  }

  check() {
    if (this.typed.length < 6) { this.feedback('El código tiene 6 números. Míralo en el dispositivo de confianza.', 'info'); return; }
    if (this.typed !== this.code) {
      this.feedback(this.d.wrong, 'retry');
      this.shake(this.display);
      this.typed = '';
      this.refresh();
      return;
    }
    this.stage = 'question';
    this.drawLock(1, true);
    this.celebrate(200, 440);
    this.feedback('¡Segundo paso completado! Las dos cerraduras están abiertas.', 'good');
    this.time.delayedCall(1600, () => this.askQuestion());
  }

  askQuestion() {
    this.keys.forEach((k) => k.setVisible(false));
    this.display.setVisible(false);
    const q = makeText(this, 600, 190, this.d.question, { size: 19, weight: '800', color: '#ffffff', wrap: 380, align: 'center', scaleWithSetting: true }).setOrigin(0.5, 0);
    void q;
    this.options = this.d.options.map((o, i) => new Card(this, 600, 360 + i * 76, { width: 390, height: 68, text: o.text, size: 16, fill: 0xfff6dc, onClick: (card) => this.answer(o, card) }));
    this.feedback('Una última pregunta sobre los códigos de verificación.', 'info');
    this.activateFocus(this.options, this.options[0]);
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
    this.feedback(o.feedback, 'good');
    const btn = new Button(this, 1085, 52, { label: '¡Abrir la puerta!', width: 260, height: 60, color: 0xf6c945, size: 22, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([btn], btn);
  }
}
