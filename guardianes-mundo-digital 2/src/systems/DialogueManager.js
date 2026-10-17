import Phaser from 'phaser';
import dialogues from '../data/dialogues.json';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { FocusGroup, focusManager } from './FocusManager.js';
import { input } from './InputManager.js';
import { audio } from './AudioManager.js';
import { save } from './SaveManager.js';

const SPEED = { slow: 38, normal: 22, instant: 0 };

// Ventana de conversación con retrato, nombre, texto progresivo,
// botón para avanzar, botón para repetir y opciones de respuesta.
export default class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    const { width, height } = scene.scale;
    this.root = scene.add.container(0, 0).setDepth(500).setVisible(false);

    const panelY = height - 196;
    this.panelY = panelY;
    this.bg = scene.add.graphics();
    drawPanel(this.bg, 40, panelY, width - 80, 176, { fill: 0x0f2f38, border: 0x2fd6b5, radius: 26 });

    this.portraitRing = scene.add.graphics();
    this.portrait = scene.add.image(132, panelY + 70, 'portrait_bit_neutral');
    const maskG = scene.make.graphics({ x: 0, y: 0, add: false });
    maskG.fillStyle(0xffffff);
    maskG.fillCircle(132, panelY + 62, 72);
    this.portrait.setMask(maskG.createGeometryMask());

    this.nameBg = scene.add.graphics();
    this.nameText = makeText(scene, 240, panelY - 2, '', { size: 26, weight: '800', color: '#0b2e33' }).setOrigin(0, 0.5);
    this.text = makeText(scene, 232, panelY + 26, '', {
      size: 27, color: '#f4fffb', weight: '600', wrap: width - 470, lineSpacing: 4, scaleWithSetting: true
    });

    this.next = new Button(scene, width - 130, panelY + 66, {
      label: 'Seguir', icon: 'icon_arrow_right', iconScale: 0.6, width: 150, height: 66, size: 24, color: 0x2fd6b5,
      onClick: () => this.advance(), sound: null
    });
    this.repeat = new Button(scene, width - 130, panelY + 138, {
      label: 'Repetir', icon: 'icon_replay', iconScale: 0.55, width: 150, height: 48, size: 20, color: 0x9fe8da,
      onClick: () => this.restart(), sound: 'click'
    });
    this.arrow = scene.add.triangle(width - 220, panelY + 150, 0, 0, 18, 0, 9, 12, 0xf6c945).setVisible(false);

    this.choiceBox = scene.add.container(0, 0);
    this.root.add([this.bg, this.portraitRing, this.portrait, this.nameBg, this.nameText, this.text, this.next, this.repeat, this.arrow, this.choiceBox]);

    this.group = new FocusGroup({ confirmActions: ['confirm', 'interact'] });
    this.group.setItems([this.next, this.repeat]);
    this.typingEvent = null;
  }

  speaker(id) {
    return dialogues.speakers[id] || dialogues.speakers.narrator;
  }

  // Reproduce una secuencia por id (dialogues.json) o una lista de líneas.
  play(idOrLines) {
    const lines = typeof idOrLines === 'string' ? dialogues[idOrLines] : idOrLines;
    if (!lines || !lines.length) return Promise.resolve(null);
    if (this.active) this.finish(null);
    this.lines = lines;
    this.index = 0;
    this.lastChoice = null;
    this.active = true;
    this.root.setVisible(true).setAlpha(0);
    this.root.y = 30;
    this.scene.tweens.add({ targets: this.root, alpha: 1, y: 0, duration: reducedMotion() ? 1 : 220, ease: 'Back.Out' });
    focusManager.push(this.group);
    this.scene.events.emit('dialogue', true);
    this.showLine();
    return new Promise((resolve) => { this.resolve = resolve; });
  }

  showLine() {
    const line = this.lines[this.index];
    const sp = this.speaker(line.s);
    const color = Number(sp.color);
    let portraitKey = sp.portrait;
    if (line.s === 'bit') portraitKey = `portrait_bit_${line.e || 'neutral'}`;
    if (line.s === 'tiko' && (line.e === 'happy' || line.t.includes('Gracias'))) portraitKey = 'portrait_tiko_happy';
    const hasPortrait = !!portraitKey && this.scene.textures.exists(portraitKey);
    const { panelY } = this;

    this.portraitRing.clear();
    this.portrait.setVisible(hasPortrait);
    if (hasPortrait) {
      this.portrait.setTexture(portraitKey).setDisplaySize(150, 150);
      this.portraitRing.fillStyle(0x0b2229, 1);
      this.portraitRing.fillCircle(132, panelY + 62, 78);
      this.portraitRing.fillStyle(color, 0.35);
      this.portraitRing.fillCircle(132, panelY + 62, 72);
      this.portraitRing.lineStyle(6, color, 1);
      this.portraitRing.strokeCircle(132, panelY + 62, 76);
      if (!reducedMotion()) this.scene.tweens.add({ targets: this.portrait, scale: { from: this.portrait.scale * 0.92, to: this.portrait.scale }, duration: 180, ease: 'Back.Out' });
    }
    const textX = hasPortrait ? 232 : 80;
    this.text.setX(textX);
    this.text.setWordWrapWidth(this.scene.scale.width - textX - 240, true);

    this.nameBg.clear();
    if (sp.name) {
      this.nameText.setText(sp.name).setX(textX + 14).setVisible(true);
      this.nameBg.fillStyle(color, 1);
      this.nameBg.fillRoundedRect(textX, panelY - 22, this.nameText.width + 30, 42, 14);
      this.nameBg.lineStyle(3, 0x0b2e33, 1);
      this.nameBg.strokeRoundedRect(textX, panelY - 22, this.nameText.width + 30, 42, 14);
    } else {
      this.nameText.setVisible(false);
    }

    this.fullText = input.format(line.t);
    this.clearChoices();
    this.startTyping();
  }

  startTyping() {
    this.typingEvent?.remove();
    const speed = SPEED[save.settings.textSpeed] ?? 22;
    this.next.setVisible(true);
    this.arrow.setVisible(false);
    if (!speed) {
      this.text.setText(this.fullText);
      this.typing = false;
      this.onTyped();
      return;
    }
    this.typing = true;
    this.charIndex = 0;
    this.text.setText('');
    this.typingEvent = this.scene.time.addEvent({
      delay: speed,
      loop: true,
      callback: () => {
        this.charIndex += 1;
        this.text.setText(this.fullText.slice(0, this.charIndex));
        if (this.charIndex % 3 === 0) audio.sfx('blip');
        if (this.charIndex >= this.fullText.length) {
          this.typingEvent.remove();
          this.typing = false;
          this.onTyped();
        }
      }
    });
  }

  onTyped() {
    const line = this.lines[this.index];
    if (line.choices) {
      this.showChoices(line.choices);
    } else {
      this.arrow.setVisible(true);
      this.group.setItems([this.next, this.repeat]);
      this.group.focus(this.next);
    }
  }

  showChoices(choices) {
    const { width } = this.scene.scale;
    this.next.setVisible(false);
    const buttons = choices.map((c, i) => {
      const b = new Button(this.scene, width - 380, this.panelY - 60 - (choices.length - 1 - i) * 82, {
        label: input.format(c.t), width: 640, height: 70, size: 22, color: 0xf6c945,
        onClick: () => {
          this.lastChoice = c.v ?? i;
          this.clearChoices();
          this.advance(true);
        }
      });
      this.choiceBox.add(b);
      return b;
    });
    this.group.setItems([...buttons, this.repeat]);
    this.group.focus(buttons[0]);
  }

  clearChoices() {
    this.choiceBox.removeAll(true);
  }

  advance(fromChoice = false) {
    if (!this.active) return;
    if (this.typing) {
      this.typingEvent?.remove();
      this.typing = false;
      this.text.setText(this.fullText);
      this.onTyped();
      return;
    }
    const line = this.lines[this.index];
    if (line.choices && !fromChoice) return;
    audio.sfx('click');
    this.index += 1;
    if (this.index >= this.lines.length) this.finish(this.lastChoice);
    else this.showLine();
  }

  restart() {
    if (!this.active) return;
    this.index = 0;
    this.showLine();
  }

  finish(result) {
    this.typingEvent?.remove();
    this.active = false;
    focusManager.remove(this.group);
    this.clearChoices();
    this.scene.tweens.add({
      targets: this.root, alpha: 0, duration: reducedMotion() ? 1 : 150,
      onComplete: () => { if (!this.active) this.root.setVisible(false); }
    });
    this.scene.events.emit('dialogue', false);
    input.clearPressed();
    const r = this.resolve;
    this.resolve = null;
    r?.(result);
  }
}
