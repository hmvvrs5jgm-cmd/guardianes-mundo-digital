import OverlayScene from './OverlayScene.js';
import Button from '../ui/Button.js';
import { makeText } from '../ui/helpers.js';

const HELP = [
  ['icon_alert', 'Si algo en internet te hace sentir incómodo, confundido o con miedo, no respondas y no compartas tus datos.'],
  ['icon_check', 'Guarda lo que pasó (por ejemplo, una captura) solo si es seguro hacerlo.'],
  ['icon_heart_help', 'Cuéntaselo a una persona adulta de confianza: mamá, papá, la persona que te cuida, un familiar o tu docente.'],
  ['icon_retry', 'Si no te escuchan, busca a otra persona adulta de confianza hasta que alguien te ayude.'],
  ['icon_star', 'Pedir ayuda es valiente. Lo que te pasó nunca es tu culpa.']
];

// «¿Necesitas ayuda?» y créditos. No incluye teléfonos ni contactos inventados.
export default class HelpScene extends OverlayScene {
  constructor() {
    super('HelpScene');
  }

  create() {
    if (this.params.mode === 'credits') return this.buildCredits();
    const win = this.buildWindow('¿Necesitas ayuda?', 980, 640, 0xff8aa8);
    HELP.forEach(([icon, text], i) => {
      const y = -200 + i * 84;
      win.add(this.add.image(-410, y, icon).setScale(0.85));
      win.add(makeText(this, -370, y, text, { size: 22, weight: '600', wrap: 800, scaleWithSetting: true }).setOrigin(0, 0.5));
    });
    const ok = new Button(this, 0, 250, { label: 'Entendido', width: 280, height: 70, color: 0xff8aa8, onClick: () => this.close() });
    win.add(ok);
    this.focus([ok], ok);
  }

  buildCredits() {
    const win = this.buildWindow('Créditos', 900, 620, 0xf6c945);
    const lines = [
      ['Guardianes del Mundo Digital', 30, '#f6c945'],
      ['La Fortaleza de los Secretos', 24, '#ffffff'],
      ['Iniciativa educativa Naveguemos Seguros · ChildFund Ecuador', 22, '#9fe8da'],
      ['Diseño, programación e ilustraciones generadas por código original del proyecto.', 19, '#d8fff6'],
      ['Motor: Phaser 3 (licencia MIT) · Fuente: Baloo 2 (SIL Open Font License)', 19, '#d8fff6'],
      ['Sonidos sintetizados en el navegador: sin archivos de terceros.', 19, '#d8fff6'],
      ['Este juego no recopila datos personales, no tiene anuncios ni compras.', 19, '#d8fff6']
    ];
    lines.forEach(([t, size, color], i) => {
      win.add(makeText(this, 0, -200 + i * 54, t, { size, color, weight: i < 3 ? '800' : '600', align: 'center', wrap: 820 }).setOrigin(0.5));
    });
    const ok = new Button(this, 0, 240, { label: 'Cerrar', width: 260, height: 70, color: 0xf6c945, onClick: () => this.close() });
    win.add(ok);
    this.focus([ok], ok);
  }
}
