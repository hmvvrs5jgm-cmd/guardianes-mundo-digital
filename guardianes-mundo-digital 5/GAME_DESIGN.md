# Documento de diseño — Guardianes del Mundo Digital: La Fortaleza de los Secretos

## 1. Visión

Aventura narrativa 2D de exploración y acertijos (20–30 minutos, un jugador, español) para
niñas y niños de 10 a 12 años. La seguridad digital es el motor de la historia: cada obstáculo
del mundo se supera reconociendo riesgos, protegiendo información, poniendo límites y pidiendo
ayuda. Iniciativa educativa **Naveguemos Seguros** (ChildFund Ecuador).

**Mensaje central:** la verdadera fuerza de un guardián es reconocer riesgos, protegerse,
respetar a los demás y pedir ayuda.

## 2. Pilares

1. **Jugar para aprender:** los aprendizajes están integrados en mecánicas (examinar, clasificar,
   reconstruir un puente, revelar caminos), no en cuestionarios aislados.
2. **Error sin castigo:** en los retos de seguridad digital nunca se pierden corazones;
   Bit explica con amabilidad y se puede reintentar sin límite. Nunca se culpa a las víctimas.
3. **Ritmo dinámico:** textos breves, recompensas frecuentes, sin límites de tiempo.
4. **Seguro por diseño:** sin datos personales, sin chat, sin anuncios, sin compras.

## 3. Historia

Conexia es un mundo de bosques luminosos, islas flotantes, laberintos y fortalezas protegido
por el Cristal de la Confianza. Los engaños, los mensajes hirientes y las trampas digitales lo
desequilibraron y sus tres fragmentos se dispersaron:

| Mundo | Escenario                      | Fragmento                 | Paleta                       |
| ----- | ------------------------------ | ------------------------- | ---------------------------- |
| 1     | El Bosque de las Señales       | Cristal del Conocimiento  | verde, turquesa, dorado      |
| 2     | El Laberinto de las Trampas    | Cristal de la Protección  | violeta, azul, turquesa      |
| 3     | La Fortaleza de los Secretos   | Cristal de la Confianza   | azul, esmeralda, dorado      |

## 4. Personajes

| Personaje | Rol | Diseño |
| --------- | --- | ------ |
| **Alex** | Protagonista controlado por el jugador. Sin nombre real ni datos. | Chibi con sudadera de guardián; piel, peinado, color de cabello y traje personalizables. Animaciones: reposo, caminar, correr, saltar, caer, interactuar, celebrar, golpe suave. |
| **Bit** | Compañero robot flotante. Explica objetivos, da pistas (tecla H / botón «?»), reacciona y celebra; nunca resuelve por el jugador. | Esfera blanca con pantalla-cara (feliz, neutral, sorprendido, pensativo) y antena dorada. |
| **Luma** | Guardiana de la confianza. Aparece en momentos sensibles y refuerza que pedir ayuda es positivo. | Búho de luz lavanda con estrella dorada. |
| **Glitch** | Trampas digitales: phishing, enlaces engañosos, premios falsos. | Criatura violeta de píxeles, traviesa, no aterradora. |
| **Eco** | Suplantación y presión (nivel 2). | Figura con capa iridiscente y máscara sonriente. |
| **Nubarrón** | Mensajes hirientes (nivel 2). | Nube gris-azulada con gesto enfurruñado. |
| **Tiko** | Amigo del bosque que necesita ayuda (misión 3). | Zorrito naranja (triste / contento). |

## 5. Mecánicas

### Movimiento y exploración
- Desplazamiento horizontal con aceleración; carrera al mantener la dirección o con Shift.
- Salto con tolerancia (*coyote time* y búfer) y altura variable.
- Suelos sólidos, plataformas atravesables desde abajo, plataformas móviles.
- Cámara con zona muerta y fondos de tres capas con parallax.
- Puntos de control (faroles) que guardan la posición.
- Coleccionables: chispas de luz (contador en el HUD).

### Corazones (solo obstáculos de aventura)
- Tres corazones. Las zarzas de estática, las chispas de Glitch y las caídas restan uno.
- Con cero corazones se vuelve al último farol con los corazones llenos. No hay «fin del juego».

### Interacción y diálogos
- Aviso flotante («E» o «!» en táctil) cerca de personajes y objetos.
- Ventana de diálogo con retrato, nombre, texto progresivo, **Seguir**, **Repetir** y opciones.
- Los textos insertan los controles correctos según teclado o pantalla táctil.

### Herramientas (efecto real)
| Herramienta | Efecto |
| ----------- | ------ |
| Lupa de la Verdad (nivel 1) | Pulso que revela plataformas de cristal, señales falsas y el cofre escondido. |
| Escudo Antiphishing (nivel 2) | Rompe portales engañosos que bloquean el camino. |
| Espada de los Límites (nivel 2) | Corta cadenas de presión (nunca ataca personas). |
| Capa de Privacidad (nivel 2) | Protege al cruzar la tormenta de mensajes hirientes. |
| Llave Maestra (nivel 3) | Abrirá puertas con dos pasos de verificación. |

### Recompensas
- Animación con rayos, partículas y sonido al obtener herramientas, cristales e insignias.
- Insignias de misión (aviso emergente) e insignias de nivel (celebración completa).
- Fragmentos del cristal por misión; al reunir tres se forma el cristal del mundo.

## 6. Nivel 1 — El Bosque de las Señales (jugable)

Recorrido lineal con exploración opcional (≈ 6.700 px de ancho):

1. **Claro inicial** — Bit da la bienvenida (diálogo del guion). Tutorial de salto y zarzas.
2. **Misión 1: El mensaje misterioso** (Árbol Mensajero). Tres mensajes: concurso falso,
   mensaje legítimo de la profe y falso «soporte». El jugador **toca partes del mensaje**
   para examinarlas (pista de engaño ⚠ o parte normal ✓) y luego **decide qué hacer**.
   Debe examinar al menos una parte antes de decidir. Recompensa: **Lupa de la Verdad**,
   insignia Detector de Engaños, fragmento 1/3.
3. **La bifurcación** — Glitch cambia las señales. Con la Lupa se descubre que la señal
   de «¡Premios!» es falsa y aparece el sendero de cristal sobre el abismo (elegir rutas).
   Secreto opcional: cofre escondido sobre una plataforma oculta (insignia Ojo Atento).
4. **Misión 2: El cofre de los secretos.** Clasificar nueve datos en tres cofres
   (*se puede compartir según el contexto*, *privada*, *sensible*) tocando o arrastrando.
   Fase 2: combinar «nombre de la escuela + foto con uniforme + horario de salida» revela
   dónde y cuándo encontrar a alguien; pregunta final sobre pensar antes de publicar.
   Recompensa: insignia Guardasecretos, fragmento 2/3; la luz del cofre deshace las
   enredaderas de estática.
5. **Misión 3: El puente de confianza.** Tiko recibe mensajes incómodos y le piden guardar
   el secreto. Cada acción protectora correcta coloca una tabla del puente (no responder y
   guardar evidencia si es seguro, bloquear y reportar, contarlo a una persona adulta de
   confianza). Luego se encienden faroles eligiendo personas adultas de confianza.
   Luma llega y refuerza el mensaje. Recompensa: insignia Puente de Confianza, fragmento 3/3;
   el puente se reconstruye en el mundo.
6. **Pedestal del Conocimiento** — los tres fragmentos forman el **Cristal del Conocimiento**
   y se enciende el portal.
7. **Portal** — insignia **Explorador Digital**, resumen de aprendizajes, desbloqueo del nivel 2.

## 7. Nivel 2 — El Laberinto de las Trampas (jugable)

Laberinto tecnológico violeta y azul (≈ 6.500 px) con bloques de circuitos, vacío de datos y una tormenta.

1. **Entrada** — Bit presenta el laberinto y a sus tres antagonistas.
2. **Misión 4: El portal del premio.** Glitch ofrece un portal dorado de premios. El jugador inspecciona
   una página falsa y encuentra 5 señales (dirección rara, premio demasiado bueno, prisa, pedido de datos,
   botón que presiona) entre elementos señuelo; luego decide cerrar sin escribir nada y contarlo.
   Recompensa: **Escudo Antiphishing**, insignia Ojo Antiphishing, fragmento 1/3.
3. **Portal engañoso** — bloquea el camino; con el Escudo (tecla Q) se rompe.
   Pasadizo secreto opcional con la Lupa (cofre con chispas).
4. **Misión 5: El visitante misterioso.** «Estrella_Amistosa» (Eco disfrazado) conversa en un chat de
   práctica ficticio: pide la escuela, ofrece regalos por la dirección, pide un secreto y presiona.
   Cada respuesta segura revela una señal de alerta; al final la máscara cae. Luma refuerza que se puede
   decir que no y pedir ayuda. Recompensa: **Espada de los Límites** (corta cadenas de presión, nunca
   ataca), insignia Guardián de Límites, fragmento 2/3.
5. **Cadenas de presión** — se cortan con la Espada.
6. **Misión 6: Las palabras que pesan.** Nubarrón llueve mensajes (solo símbolos, sin insultos) sobre Pío.
   El jugador ordena los pasos: no responder con agresión → guardar evidencia si es seguro → bloquear y
   reportar → buscar apoyo adulto; luego elige dos mensajes de apoyo. Recompensa: **Capa de Privacidad**,
   insignia Amistad Valiente, fragmento 3/3.
7. **Tormenta de mensajes** — empuja hacia atrás (no quita corazones); la Capa permite cruzarla.
8. **Pedestal de la Protección** → **Cristal de la Protección** → portal, insignia **Protector Digital**,
   resumen y desbloqueo del nivel 3.

## 7b. Nivel 3 — La Fortaleza de los Secretos (jugable)

Fortaleza azul, esmeralda y dorada (≈ 6.300 px) con muros de piedra, puertas monumentales y mecanismos.

1. **Entrada** — Luma da la bienvenida a la Fortaleza.
2. **Misión 7: El código secreto.** La cerradura mágica pide una contraseña muy fuerte. El jugador
   arma una contraseña **ficticia** con piezas (palabras, números, símbolos); las piezas con datos
   personales («Tu nombre», «Tu cumpleaños») o débiles («1234», «contraseña») se rechazan con una
   explicación. Un medidor (color + texto) muestra la fuerza; se abre con 14+ caracteres, 3 palabras y
   un número o símbolo. Después, tres decisiones: no compartir con amigos, una contraseña distinta por
   cuenta, usar un gestor con ayuda adulta. Nada se guarda. Insignia Maestro de Claves, fragmento 1/3.
3. **Misión 8: La llave de dos pasos.** La puerta tiene dos cerrojos: hay que pisar dos placas en lugares
   distintos (una en lo alto) y luego, en la consola, escribir el código de 6 cifras del «dispositivo de
   confianza». Pregunta final: nunca compartir el código aunque digan ser «soporte».
   Recompensa: **Llave Maestra**, insignia Doble Cerrojo, fragmento 2/3.
4. **Misión 9: El Consejo de Guardianes.** Seis situaciones (enlace raro, premio falso, alguien que pide
   la dirección en secreto, foto con uniforme, código de verificación, compañero que recibe burlas) que se
   resuelven eligiendo la herramienta o habilidad adecuada, incluida **pedir ayuda**. Cada acierto enciende
   un pilar. Insignia Consejo de Guardianes, fragmento 3/3.
5. **Pedestal de la Confianza** → **Cristal de la Confianza**.
6. **Corazón de la Fortaleza** — los tres cristales se unen → escena final: diálogo de Bit y Luma
   («no era la espada, ni el escudo, ni la llave…»), insignia **Guardián Digital**, misiones superadas,
   mensaje central, créditos y opción de volver a jugar.

## 8. Interfaz y accesibilidad

- Resolución lógica 1280×720 con escalado proporcional (sin deformar) y aviso para girar
  el dispositivo en vertical.
- Botones grandes (≥ 56 px) con estados de foco visibles; navegación completa con teclado.
- Indicadores que no dependen solo del color (íconos ✓, ⚠, ↺ y textos).
- Opciones: volumen de música y efectos, silenciar, tamaño del texto, velocidad del texto,
  reducir movimiento, controles táctiles (automático / siempre / nunca).
- Pausa en cualquier momento; sin límites de tiempo.

## 9. Guardado

`localStorage` con dos claves:
- `gmd_progress`: versión, nivel desbloqueado, nivel actual, puntos de control, misiones,
  herramientas, insignias, cristales, banderas de estado del mundo y apariencia.
- `gmd_settings`: preferencias de audio y accesibilidad (se conservan al reiniciar el progreso).

Los datos se validan al cargar: JSON dañado → se respalda en `gmd_progress_corrupt` y se
empieza de cero; campos desconocidos o fuera de rango → se descartan; versiones distintas →
se migran (`MIGRATIONS` en `SaveManager.js`). Si `localStorage` no está disponible, se usa memoria.

## 10. Seguridad y protección infantil

No se piden nombres reales, contraseñas reales ni datos; no hay chats, anuncios, compras ni
seguimiento. Las situaciones sensibles se presentan sin detalles explícitos ni tono alarmista y
siempre se refuerza que pedir ayuda es positivo y que nunca es culpa de quien lo vive.
La sección «¿Necesitas ayuda?» recomienda a una persona adulta de confianza y no inventa
números ni contactos.

## 11. Decisiones técnicas

| Decisión | Motivo |
| -------- | ------ |
| Arte procedural con Canvas 2D (`src/art`) | No hay ilustraciones finales; evita recursos con licencias dudosas y deja claves reemplazables (`EXTERNAL_ASSETS`). |
| Audio sintetizado con Web Audio | Sin archivos de terceros; funciona sin conexión. |
| Escenas superpuestas (UI, acertijos, pausa) | Separa HUD y acertijos del mundo; el nivel se pausa mientras se resuelve un acertijo. |
| `FocusManager` propio | Navegación por teclado coherente en menús, diálogos y acertijos. |
| Contenido en JSON | Docentes y equipo pedagógico pueden ajustar textos sin programar. |
| Base de Vite configurable (`BASE_PATH`) | Funciona con cualquier nombre de repositorio en GitHub Pages. |
