import OverlayScene from './OverlayScene.js';
import Button from '../ui/Button.js';
import { makeText } from '../ui/helpers.js';

// Confirmación (por ejemplo, reiniciar progreso).
export default class ConfirmScene extends OverlayScene {
  constructor() {
    super('ConfirmScene');
  }

  create() {
    const { title = '¿Estás seguro?', text = '', yes = 'Sí', no = 'No', danger = false } = this.params;
    const win = this.buildWindow(title, 680, 380, danger ? 0xff8a65 : 0x2fd6b5);
    win.add(makeText(this, 0, -40, text, { size: 24, align: 'center', wrap: 580, weight: '600', scaleWithSetting: true }).setOrigin(0.5));
    const bNo = new Button(this, -150, 120, { label: no, width: 250, height: 70, color: 0x9fe8da, onClick: () => this.close(false) });
    const bYes = new Button(this, 150, 120, { label: yes, width: 250, height: 70, color: danger ? 0xff8a65 : 0xf6c945, onClick: () => this.close(true) });
    win.add([bNo, bYes]);
    this.focus([bNo, bYes], bNo);
  }
}
