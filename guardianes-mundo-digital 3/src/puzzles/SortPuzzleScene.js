import Phaser from 'phaser';
import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

const CHEST_ICON = { share: 'icon_heart_help', private: 'info_password', sensitive: 'item_escudo' };

// MISIÓN 2 — El cofre de los secretos: clasificar información en
// compartible, privada y sensible; descubrir el riesgo de combinar datos.
export default class SortPuzzleScene extends PuzzleScene {
  constructor() {
    super('SortPuzzleScene');
  }

  create() {
    this.d = quests.content('m2');
    this.buildFrame(this.d.title, this.d.instruction, 0xf6c945);
    this.selected = null;
    this.placed = 0;
    this.buildTargets();
    this.buildItems();
    this.feedback('Cada cofre guarda un tipo de información. ¿Dónde va cada dato?', 'info');
    this.refreshFocus();
  }

  buildTargets() {
    this.targets = this.d.categories.map((c, i) => {
      const x = 230 + i * 410, y = 500;
      const color = Number(c.color);
      const cont = this.add.container(x, y);
      const g = this.add.graphics();
      const draw = (focused = false, hot = false) => {
        g.clear();
        drawPanel(g, -170, -75, 340, 150, { fill: 0x10343d, border: focused ? 0xfff3a0 : hot ? 0xffffff : color, radius: 22, borderWidth: focused || hot ? 6 : 4 });
        g.fillStyle(color, 0.22);
        g.fillRoundedRect(-166, -71, 332, 142, 20);
      };
      draw();
      const chest = this.add.image(-108, 6, 'chest_closed').setScale(0.82);
      const sym = this.add.image(-108, -6, CHEST_ICON[c.id]).setScale(0.55);
      const name = makeText(this, -30, -36, c.name, { size: 24, weight: '800', color: '#ffffff' }).setOrigin(0, 0.5);
      if (name.width > 190) name.setFontSize(Math.floor(24 * 190 / name.width));
      const sub = makeText(this, -30, -6, c.sub, { size: 18, weight: '600', color: '#d8fff6' }).setOrigin(0, 0.5);
      const slots = this.add.container(-24, 38);
      cont.add([g, chest, sym, name, sub, slots]);
      cont.setSize(340, 150);
      cont.setInteractive({ useHandCursor: true });
      const t = { id: c.id, cont, chest, slots, draw, count: 0, x, y };
      cont.on('pointerup', () => { if (!this.dragging) this.placeSelected(t); });
      cont.on('pointerover', () => draw(false, !!this.selected));
      cont.on('pointerout', () => draw(t.focused));
      // Interfaz para FocusGroup
      cont.setFocused = (v) => { t.focused = v; draw(v); };
      cont.activate = () => this.placeSelected(t);
      cont.isEnabled = () => true;
      return t;
    });
  }

  buildItems() {
    const items = Phaser.Utils.Array.Shuffle([...this.d.items]);
    this.cards = items.map((it, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const hx = 230 + col * 410, hy = 168 + row * 84;
      const c = new Card(this, hx, hy, { width: 330, height: 72, text: it.text, icon: it.icon, size: 22, fill: 0xfffaf0, onClick: (card) => this.selectCard(card) });
      c.item = it;
      c.home = { x: hx, y: hy };
      this.input.setDraggable(c);
      return c;
    });
    this.input.on('dragstart', (p, obj) => {
      if (!obj.item) return;
      this.dragging = false;
      obj.dragStart = { x: p.x, y: p.y };
      obj.setDepth(50);
    });
    this.input.on('drag', (p, obj, dx, dy) => {
      if (!obj.item) return;
      if (Math.abs(p.x - obj.dragStart.x) + Math.abs(p.y - obj.dragStart.y) > 12) {
        this.dragging = true;
        if (this.selected !== obj) this.selectCard(obj, true);
      }
      obj.setPosition(dx, dy);
      this.targets.forEach((t) => t.draw(false, this.dragging && this.overTarget(obj) === t));
    });
    this.input.on('dragend', (p, obj) => {
      if (!obj.item) return;
      const wasDragging = this.dragging;
      obj.setDepth(0);
      this.targets.forEach((t) => t.draw(false));
      if (wasDragging) {
        const t = this.overTarget(obj);
        if (t) this.place(obj, t);
        else this.returnHome(obj);
      }
      this.time.delayedCall(0, () => { this.dragging = false; });
    });
  }

  overTarget(card) {
    return this.targets.find((t) => Math.abs(card.x - t.x) < 180 && Math.abs(card.y - t.y) < 95) || null;
  }

  selectCard(card, silent = false) {
    if (this.dragging && !silent) return;
    if (this.selected === card && !silent) {
      card.setSelected(false);
      this.selected = null;
      return;
    }
    this.selected?.setSelected(false);
    this.selected = card;
    card.setSelected(true);
    if (!silent) this.feedback(`Elegiste «${card.item.text}». Ahora toca el cofre donde debe ir.`, 'info');
    if (!reducedMotion()) this.tweens.add({ targets: card, scale: { from: 1.06, to: 1 }, duration: 180 });
    // Con teclado, el foco salta a los cofres
    this.group.focus(this.targets[0].cont);
  }

  placeSelected(t) {
    if (!this.selected) {
      this.feedback('Primero elige un dato de arriba. Después toca su cofre.', 'info');
      return;
    }
    this.place(this.selected, t);
  }

  place(card, t) {
    const it = card.item;
    if (it.category !== t.id) {
      this.feedback(`Mmm, mejor en otro cofre. ${it.feedback}`, 'retry');
      this.returnHome(card);
      this.shake(t.cont);
      return;
    }
    card.disableInteractive();
    card.setSelected(false);
    this.selected = null;
    this.placed += 1;
    const slotX = t.count * 30;
    t.count += 1;
    this.tweens.add({
      targets: card, x: t.x - 108, y: t.y, scale: 0.15, alpha: 0, duration: 380, ease: 'Cubic.In',
      onComplete: () => {
        card.destroy();
        this.cards = this.cards.filter((c) => c !== card);
        const mini = this.add.image(slotX, 0, it.icon).setScale(0.42);
        t.slots.add(mini);
        if (!reducedMotion()) this.tweens.add({ targets: t.chest, scaleY: { from: 0.7, to: 0.82 }, duration: 200, ease: 'Back.Out' });
        this.refreshFocus();
        if (this.placed === this.d.items.length) this.time.delayedCall(900, () => this.startCombo());
      }
    });
    audio.sfx('orb');
    this.feedback(`¡Bien! ${it.feedback}`, 'good');
  }

  returnHome(card) {
    this.tweens.add({ targets: card, x: card.home.x, y: card.home.y, duration: 300, ease: 'Back.Out' });
  }

  refreshFocus() {
    this.activateFocus([...this.cards, ...this.targets.map((t) => t.cont)]);
  }

  // ---------- Fase 2: datos combinados ----------
  startCombo() {
    const combo = this.d.combo;
    this.targets.forEach((t) => this.tweens.add({ targets: t.cont, alpha: 0, y: t.y + 40, duration: 400, onComplete: () => t.cont.destroy() }));
    this.titleText.setText(combo.title);
    this.instrText.setText('Mira qué pasa cuando algunos datos se juntan en una publicación.');
    this.feedback('¡Clasificaste toda la información! Ahora un reto de guardián...', 'good');

    const pos = [[300, 250], [640, 190], [980, 250]];
    this.pieces = combo.pieces.map((p, i) => {
      const c = new Card(this, pos[i][0], pos[i][1], { width: 320, height: 76, text: p.text, icon: p.icon, size: 21, fill: 0xfffaf0 });
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 400, delay: 300 + i * 200 });
      return c;
    });
    this.joinBtn = new Button(this, 640, 400, { label: '¿Y si se juntan?', width: 360, height: 72, color: 0xf6c945, size: 28, onClick: () => this.joinPieces() });
    this.activateFocus([this.joinBtn], this.joinBtn);
  }

  joinPieces() {
    const combo = this.d.combo;
    this.joinBtn.destroy();
    const lines = this.add.graphics();
    this.pieces.forEach((p, i) => {
      this.tweens.add({ targets: p, x: 640 + (i - 1) * 345, y: 170, scale: 0.92, duration: 600, ease: 'Sine.InOut' });
    });
    this.time.delayedCall(650, () => {
      lines.lineStyle(5, 0xffb347, 1);
      [-345, 0, 345].forEach((dx) => lines.lineBetween(640 + dx, 210, 640, 300));
      const pin = this.add.graphics({ x: 640, y: 320 });
      pin.fillStyle(0xff8a65, 1);
      pin.fillCircle(0, 0, 34);
      pin.fillTriangle(-30, 14, 30, 14, 0, 72);
      pin.lineStyle(4, 0x16303a, 1);
      pin.strokeCircle(0, 0, 34);
      pin.fillStyle(0xffffff, 1);
      pin.fillCircle(0, -2, 13);
      pin.setScale(0);
      this.tweens.add({ targets: pin, scale: 1, duration: 500, ease: 'Back.Out' });
      this.pin = pin;
      const reveal = makeText(this, 640, 420, combo.reveal, { size: 30, weight: '800', color: '#ffb347', align: 'center' }).setOrigin(0.5);
      this.feedback(combo.lesson, 'alert');
      this.time.delayedCall(1800, () => this.askQuestion(reveal));
    });
  }

  askQuestion(reveal) {
    const combo = this.d.combo;
    reveal.setY(410).setFontSize(26);
    const q = makeText(this, 640, 452, combo.question, { size: 24, weight: '800', color: '#ffffff' }).setOrigin(0.5);
    this.tweens.add({ targets: q, alpha: { from: 0, to: 1 }, duration: 300 });
    this.qOptions = combo.options.map((o, i) => new Card(this, 230 + i * 410, 540, {
      width: 380, height: 104, text: o.text, size: 19, fill: 0xfff6dc,
      onClick: (c) => this.answer(o, c)
    }));
    this.activateFocus(this.qOptions, this.qOptions[0]);
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
    this.qOptions.forEach((c) => { if (c !== card) c.setEnabled(false); });
    this.celebrate(card.x, card.y);
    this.feedback(o.feedback, 'good');
    const done = new Button(this, 1085, 52, { label: '¡Abrir el cofre!', width: 260, height: 60, color: 0xf6c945, size: 22, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([done], done);
  }
}
