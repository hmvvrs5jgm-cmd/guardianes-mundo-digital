import OverlayScene from './OverlayScene.js';
import Button from '../ui/Button.js';
import { makeText } from '../ui/helpers.js';
import { save } from '../systems/SaveManager.js';
import { audio } from '../systems/AudioManager.js';

const VOL = [0, 0.25, 0.5, 0.75, 1];
const volLabel = (v) => (v === 0 ? 'Apagado' : `${Math.round(v * 100)}%`);

// Opciones de sonido y accesibilidad (se guardan automáticamente).
export default class OptionsScene extends OverlayScene {
  constructor() {
    super('OptionsScene');
  }

  create() {
    const win = this.buildWindow('Opciones', 860, 660);
    const s = () => save.settings;
    const rows = [
      { label: 'Música', get: () => volLabel(s().musicVolume), next: () => ({ musicVolume: VOL[(VOL.indexOf(s().musicVolume) + 1) % VOL.length] }) },
      { label: 'Efectos de sonido', get: () => volLabel(s().sfxVolume), next: () => ({ sfxVolume: VOL[(VOL.indexOf(s().sfxVolume) + 1) % VOL.length] }) },
      { label: 'Silenciar todo', get: () => (s().muted ? 'Sí' : 'No'), next: () => ({ muted: !s().muted }) },
      { label: 'Tamaño del texto', get: () => (s().textSize === 'large' ? 'Grande' : 'Normal'), next: () => ({ textSize: s().textSize === 'large' ? 'normal' : 'large' }) },
      { label: 'Velocidad del texto', get: () => ({ slow: 'Lenta', normal: 'Normal', instant: 'Inmediata' })[s().textSpeed], next: () => ({ textSpeed: { slow: 'normal', normal: 'instant', instant: 'slow' }[s().textSpeed] }) },
      { label: 'Reducir movimiento', get: () => (s().reducedMotion ? 'Sí' : 'No'), next: () => ({ reducedMotion: !s().reducedMotion }) },
      { label: 'Controles táctiles', get: () => ({ auto: 'Automático', always: 'Siempre', never: 'Nunca' })[s().touchControls], next: () => ({ touchControls: { auto: 'always', always: 'never', never: 'auto' }[s().touchControls] }) }
    ];
    const buttons = rows.map((r, i) => {
      const y = -220 + i * 66;
      win.add(makeText(this, -370, y, r.label, { size: 25, weight: '700' }).setOrigin(0, 0.5));
      const b = new Button(this, 230, y, {
        label: r.get(), width: 260, height: 56, size: 22, color: 0x2fd6b5,
        onClick: () => {
          save.updateSettings(r.next());
          b.setLabel(r.get());
          audio.unlock();
        }
      });
      win.add(b);
      return b;
    });
    win.add(makeText(this, 0, 248, 'Los cambios se guardan solos en este dispositivo.', { size: 18, color: '#9fe8da' }).setOrigin(0.5));
    const ok = new Button(this, 0, 296 - 10, { label: 'Listo', width: 220, height: 56, color: 0xf6c945, onClick: () => this.close() });
    ok.y = 290;
    win.add(ok);
    this.focus([...buttons, ok], buttons[0]);
  }
}
