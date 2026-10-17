# Guardianes del Mundo Digital: La Fortaleza de los Secretos

Videojuego web educativo de aventura narrativa 2D para niñas y niños de 10 a 12 años.
Forma parte de la iniciativa educativa **Naveguemos Seguros** (ChildFund Ecuador).

Alex, una joven persona Guardiana Digital, recorre Conexia junto a Bit, su compañero robot,
para recuperar los fragmentos del Cristal de la Confianza. La seguridad digital es el motor
de la aventura: reconocer engaños, proteger la información, poner límites y pedir ayuda.

> **Estado actual:** el **Nivel 1 (El Bosque de las Señales)** es jugable de principio a fin,
> con sus tres misiones. Los niveles 2 y 3 tienen escena, arte y datos preparados, pero su
> contenido jugable está pendiente (ver [`TASKS.md`](TASKS.md)).

## Características

- Plataformas 2D con movimiento, carrera, salto, colisiones, plataformas atravesables y móviles.
- Cámara que sigue al personaje y fondos con parallax en escenarios más grandes que la pantalla.
- Bit acompaña, da pistas y reacciona; Luma aparece en los momentos importantes.
- Diálogos con retrato, nombre, texto progresivo, botón **Seguir** y botón **Repetir**.
- Acertijos variados: examinar mensajes e identificar pistas, clasificar información
  (tocando o arrastrando), combinar datos, elegir acciones y personas de confianza.
- Herramientas con efecto real: la **Lupa de la Verdad** revela plataformas ocultas,
  señales falsas y un cofre escondido.
- Inventario visual (herramientas, cristales, insignias), recompensas animadas,
  coleccionables y tres corazones solo para obstáculos de aventura.
- Los errores en temas de seguridad digital **nunca** quitan vidas: siempre se explica y se reintenta.
- Guardado automático con `localStorage` (progreso, herramientas, insignias, preferencias).
- Teclado completo, controles táctiles multitáctiles, pausa, opciones de sonido y accesibilidad.
- Sección **«¿Necesitas ayuda?»** accesible desde el menú y la pausa.
- Sin registro, sin anuncios, sin compras, sin chat y sin recopilación de datos personales.

## Requisitos

- Node.js 18 o superior (probado con Node 22) y npm.

## Desarrollo local

```bash
npm install       # instala las dependencias (versiones fijadas en package.json)
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # compilación de producción en dist/
npm run preview   # sirve dist/ en http://localhost:4173/guardianes-mundo-digital/
```

`npm run preview` usa la misma ruta base que GitHub Pages para comprobar la versión publicada.

## Controles

| Acción                 | Teclado                         | Táctil                  |
| ---------------------- | ------------------------------- | ----------------------- |
| Moverse                | ← → o A / D                     | Flechas en pantalla     |
| Correr                 | Mantener la dirección o Shift   | Mantener la flecha      |
| Saltar                 | Espacio, ↑ o W                  | Botón de salto          |
| Interactuar / hablar   | E o Enter                       | Botón de acción         |
| Usar la Lupa           | Q                               | Botón de lupa           |
| Mochila                | I                               | Ícono de mochila        |
| Pista de Bit           | H                               | Botón «?»               |
| Pausa                  | Esc o P                         | Botón de pausa          |
| Menús y acertijos      | Flechas / Tab + Enter, Esc para volver | Tocar             |

## Publicación en GitHub Pages

El flujo `.github/workflows/deploy.yml` compila y publica el juego al hacer *push* a `main`
(o manualmente desde **Actions → Desplegar en GitHub Pages → Run workflow**).

1. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Publica los cambios en `main`.
3. El juego quedará en `https://<usuario-u-organización>.github.io/<repositorio>/`.

La ruta base se toma del nombre del repositorio (`BASE_PATH`). Para compilar a mano con otra
ruta: `BASE_PATH=/otra-ruta/ npm run build`. Si el sitio se publica en la raíz de un dominio
(por ejemplo, un repositorio `usuario.github.io`), usa `BASE_PATH=/`.

## Estructura

```
index.html                 Página contenedora (carga, aviso de orientación)
vite.config.js             Configuración de Vite y ruta base
src/main.js                Arranque de Phaser y registro de escenas
src/config.js              Constantes, física, niveles y recursos externos opcionales
src/scenes/                Boot, Menú, Personalización, Intro, Mapa, Niveles 1-3, Final,
                           Interfaz (HUD), Pausa, Mochila, Opciones, Ayuda, Confirmación
src/puzzles/               Acertijos de las misiones 1, 2 y 3 (base común PuzzleScene)
src/systems/               PlayerController, DialogueManager, QuestManager, InventoryManager,
                           RewardManager, SaveManager, AudioManager, InputManager, FocusManager
src/entities/              Bit (compañero) e Interactable (puntos de interacción)
src/art/                   Arte procedural original (personajes, escenarios, objetos, interfaz)
src/ui/                    Botones y utilidades de interfaz
src/data/                  Contenido pedagógico: missions.json, dialogues.json, rewards.json
public/assets/             Carpetas para recursos profesionales futuros (ver su README)
.github/workflows/         Despliegue automático en GitHub Pages
```

La lógica del juego está separada del contenido pedagógico: los textos de diálogos,
mensajes, datos a clasificar, acciones y retroalimentación se editan en `src/data/*.json`
sin tocar el código.

## Reemplazar el arte por ilustraciones profesionales

Todo el arte actual se dibuja por código. Para usar ilustraciones finales, consulta
[`public/assets/README.md`](public/assets/README.md): basta con registrar la imagen en
`EXTERNAL_ASSETS` (`src/config.js`) con la misma clave de textura.

## Privacidad y protección de la niñez

- No se piden nombres, contraseñas reales ni datos personales. La contraseña de la
  misión 7 (pendiente) será ficticia y no se guardará.
- `localStorage` solo guarda progreso del juego, la apariencia elegida y preferencias.
- No hay chat, anuncios, compras, analítica ni servicios externos.
- La sección «¿Necesitas ayuda?» recomienda acudir a una persona adulta de confianza y no
  incluye números ni contactos inventados.

## Créditos y licencias de recursos

- Iniciativa educativa **Naveguemos Seguros** · ChildFund Ecuador.
- Arte procedural, personajes, escenarios e íconos: creados con código original de este proyecto.
- Sonidos y música: sintetizados en tiempo real con Web Audio (sin archivos de terceros).
- [Phaser 3](https://phaser.io) — licencia MIT.
- [Vite](https://vitejs.dev) — licencia MIT.
- Fuente [Baloo 2](https://fonts.google.com/specimen/Baloo+2) vía `@fontsource/baloo-2` — SIL Open Font License 1.1.
- No se incluyen logos institucionales: deben añadirse solo con autorización (`public/assets/logos/`).
