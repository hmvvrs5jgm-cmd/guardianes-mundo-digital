# Recursos gráficos y de audio

Hoy todo el arte del juego se genera por código (`src/art/`) y el sonido se sintetiza
en el navegador (`src/systems/AudioManager.js`). Estas carpetas están listas para
recibir recursos profesionales:

| Carpeta        | Contenido esperado                                        |
| -------------- | --------------------------------------------------------- |
| `characters/`  | Alex, Bit, Luma, Tiko, Glitch, Eco, Nubarrón y retratos    |
| `backgrounds/` | Cielos y capas de parallax de cada mundo                  |
| `items/`       | Herramientas, cristales, insignias e íconos de datos      |
| `ui/`          | Botones, corazones, íconos y controles táctiles           |
| `audio/`       | Música y efectos                                          |
| `logos/`       | Logos institucionales (solo con autorización expresa)     |

## Cómo reemplazar una textura

1. Guarda la imagen (PNG o WebP) en la carpeta correspondiente.
2. Regístrala en `EXTERNAL_ASSETS` dentro de `src/config.js` usando **la misma clave**
   que usa el generador. Ejemplo:

   ```js
   export const EXTERNAL_ASSETS = [
     { type: 'image', key: 'item_lupa', url: 'assets/items/lupa.png' }
   ];
   ```

3. `BootScene` la carga y el generador procedural deja de dibujar esa clave.

Las claves disponibles aparecen en `src/art/*.js` (por ejemplo `bg_l1_sky`,
`tree_messenger`, `chest_closed`, `portrait_luma`, `item_lupa`, `badge_explorer`).
Respeta el tamaño aproximado de cada textura para no alterar las colisiones.

> Usa solo recursos propios o con licencia verificada y registra su autoría en el README principal.
