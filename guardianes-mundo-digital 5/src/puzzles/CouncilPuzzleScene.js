import PuzzleScene, { Card } from './PuzzleScene.js';
import { quests } from '../systems/QuestManager.js';
import { makeText, drawPanel, reducedMotion } from '../ui/helpers.js';
import Button from '../ui/Button.js';
import { audio } from '../systems/AudioManager.js';

// MISIÓN 9 — El Consejo de Guardianes: desafío final que integra todas las
// herramientas y habilidades. Cada acierto enciende un pilar del Consejo.
export default class CouncilPuzzleScene extends PuzzleScene {
  constructor() {
    super('CouncilPuzzleScene');
  }

  create() {
    this.d = quests.content('m9');
    this.buildFrame(this.d.title, this.d.instruction, 0xf6c945);
    this.round = 0;
    const n = this.d.rounds.length;
    this.pillars = this.d.rounds.map((_, i) => this.add.image(640 + (i - (n - 1) / 2) * 120, 196 + Math.abs(i - (n - 1) / 2) * 8, 'pillar_off').setScale(0.42));
    this.luma = this.add.image(640, 200, 'luma').setScale(0.55).setAlpha(0.9);
    if (!reducedMotion()) this.tweens.add({ targets: this.luma, y: 190, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.luma.setX(640 + ((n - 1) / 2 + 1) * 120);

    const g = this.add.graphics();
    drawPanel(g, 140, 262, 1000, 118, { fill: 0xfffaf0, border: 0xf6c945, radius: 22, borderWidth: 4, glow: false });
    this.roundLabel = makeText(this, 170, 286, '', { size: 18, weight: '800', color: '#a8721b' }).setOrigin(0, 0.5);
    this.scenario = makeText(this, 640, 336, '', { size: 23, weight: '700', color: '#16303a', wrap: 940, align: 'center', scaleWithSetting: true }).setOrigin(0.5);

    this.toolCards = this.d.tools.map((t, i) => {
      const c = new Card(this, 115 + i * 210, 476, { width: 196, height: 128, text: `${t.name}\n${t.skill}`, icon: null, size: 16, fill: 0xfff6dc, align: 'center', onClick: (card) => this.choose(t, card) });
      c.text.setY(26);
      c.add(this.add.image(0, -30, t.icon).setScale(0.75));
      return c;
    });
    this.feedback(this.d.intro, 'info');
    this.showRound();
  }

  showRound() {
    const r = this.d.rounds[this.round];
    this.roundLabel.setText(`Situación ${this.round + 1} de ${this.d.rounds.length}`);
    this.scenario.setText(r.text).setAlpha(0);
    this.tweens.add({ targets: this.scenario, alpha: 1, duration: 300 });
    this.toolCards.forEach((c) => c.setState({ fill: 0xfff6dc, border: 0x9fc7c0, marker: null }));
    this.activateFocus(this.toolCards, this.toolCards[0]);
  }

  choose(t, card) {
    if (this.waiting) return;
    const r = this.d.rounds[this.round];
    if (t.id !== r.answer) {
      card.setState({ fill: 0xdde4f7, marker: 'icon_retry', border: 0x6c8cff });
      this.shake(card);
      this.feedback(this.d.retry, 'retry');
      return;
    }
    this.waiting = true;
    card.setState({ fill: 0xd9f7e6, marker: 'icon_check', border: 0x4cd38a });
    const p = this.pillars[this.round];
    p.setTexture('pillar_on');
    this.tweens.add({ targets: p, scale: { from: 0.55, to: 0.42 }, duration: 400, ease: 'Back.Out' });
    audio.sfx('checkpoint');
    this.feedback(r.feedback, 'good');
    this.round += 1;
    this.time.delayedCall(1700, () => {
      this.waiting = false;
      if (this.round < this.d.rounds.length) this.showRound();
      else this.end();
    });
  }

  end() {
    this.toolCards.forEach((c) => c.setEnabled(false));
    this.roundLabel.setText('¡Consejo completo!');
    this.scenario.setText(this.d.final);
    this.celebrate(640, 200);
    audio.sfx('crystal');
    this.feedback('¡Todos los pilares brillan! Eres parte del Consejo de Guardianes.', 'good');
    const btn = new Button(this, 1085, 52, { label: '¡Lo logramos!', width: 240, height: 60, color: 0xf6c945, size: 22, onClick: () => this.finish(true) });
    this.exitBtn.setVisible(false);
    this.activateFocus([btn], btn);
  }
}
